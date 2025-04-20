import contextlib
import urllib
from datetime import UTC, datetime
from uuid import uuid4

import requests
from confluent_kafka import Producer
from fastapi import BackgroundTasks, HTTPException, UploadFile, status
from google import genai
from google.genai import types
from sqlalchemy.orm import selectinload
from sqlmodel import Session, asc, desc, func, select

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.core.logging import logger
from app.core.stream import get_producer
from app.models.user import File as UserFile
from app.models.user import FileDescription as UserFileDescription
from app.models.user import FileProcessingStatus
from app.schemas.file import SortBy, SortOrder
from app.schemas.stream import EventType, FileUploadedEvent, StatusUpdatedEvent, Topic
from app.utils.upload import delete_blob, upload_blob_from_memory


class FileService:
    def _update_status(
        self,
        db: Session,
        producer: Producer,
        settings: Settings,
        file_data: UserFile,
        message: str,
        status: FileProcessingStatus = FileProcessingStatus.unknown,
        noti_only: bool = False,
    ):
        if not noti_only:
            file_data.status = status
            db.add(file_data)
            db.commit()
            db.refresh(file_data)

        noti_event = StatusUpdatedEvent(
            event_type=EventType.status_update,
            timestamp=file_data.created_at,
            metadata={'version': 1, 'source': settings.server_mode},
            payload={
                'user_id': file_data.user_id,
                'status': file_data.status.value,
                'message': message,
            },
        )
        producer.produce(
            Topic.notifications.value,
            key=f'{file_data.user_id},{file_data.id},{file_data.status.value}',
            value=noti_event.json(),
        )

    def _upload_file(
        self,
        settings: Settings,
        db: Session,
        producer: Producer,
        file_bytes: bytes,
        file_data: UserFile,
    ):
        try:
            upload_blob_from_memory(
                settings.bucket_name,
                file_bytes,
                file_data.object_path,
                file_data.type,
            )

            file_event = FileUploadedEvent(
                event_type=EventType.file_upload,
                timestamp=file_data.created_at,
                metadata={'version': 1, 'source': settings.server_mode},
                payload={'file_id': file_data.id},
            )
            producer.produce(Topic.files.value, key=str(file_data.id), value=file_event.json())

            self._update_status(
                db=db,
                producer=producer,
                file_data=file_data,
                message=f'File "{file_data.filename}" is queuing',
                status=FileProcessingStatus.queuing,
                settings=settings,
            )

            logger.debug(f'File "{file_data.filename}" uploaded')

        except Exception as e:
            with contextlib.suppress(Exception):
                self._update_status(
                    db=db,
                    producer=producer,
                    file_data=file_data,
                    message=f'File "{file_data.filename}" was failed to push to queue',
                    status=FileProcessingStatus.failed,
                    settings=settings,
                )
            logger.debug(e)

    async def upload_file(
        self,
        user_id: int,
        settings: Settings,
        db: Session,
        producer: Producer,
        background_tasks: BackgroundTasks,
        file: UploadFile,
    ) -> UserFile:
        try:
            now = datetime.now(UTC)
            rand_str = str(uuid4())
            object_path = f'{user_id}/{rand_str}/{file.filename}'
            file_url = (
                f'{settings.cdn_url}/{user_id}/{rand_str}/{urllib.parse.quote(file.filename)}'
            )

            file_data = UserFile(
                filename=file.filename,
                status=FileProcessingStatus.pending,
                size=file.size,
                type=file.content_type,
                url=file_url,
                created_at=now,
                object_path=object_path,
                user_id=user_id,
            )
            db.add(file_data)
            db.commit()
            db.refresh(file_data)

            file_bytes = await file.read()
            background_tasks.add_task(
                self._upload_file,
                settings,
                db,
                producer,
                file_bytes,
                file_data,
            )

            self._update_status(
                db=db,
                producer=producer,
                file_data=file_data,
                message=f'File "{file_data.filename}" is waiting to be uploaded',
                noti_only=True,
                settings=settings,
            )

        except Exception as e:
            with contextlib.suppress(Exception):
                self._update_status(
                    db=db,
                    producer=producer,
                    file_data=file_data,
                    message=f'File "{file_data.filename}" was failed to handle',
                    status=FileProcessingStatus.failed,
                    settings=settings,
                )
            logger.debug(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Error occured while uploading file',
            ) from e

        return file_data

    def list_files(
        self,
        db: Session,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        sort_by: SortBy = SortBy.created_at,
        sort_order: SortOrder = SortOrder.asc,
    ) -> tuple[UserFile, int]:
        try:
            file_statement = select(UserFile).where(UserFile.user_id == user_id)

            match sort_by:
                case SortBy.created_at:
                    sort = UserFile.created_at
                case SortBy.name:
                    sort = UserFile.filename
                case SortBy.status:
                    sort = UserFile.status

            if sort is not None:
                sort = desc(sort) if sort_order == SortOrder.desc else asc(sort)
                file_statement = file_statement.order_by(sort)

            file_statement = (
                file_statement.offset((page - 1) * page_size)
                .limit(page_size)
                .options(selectinload(UserFile.file_descriptions))  # fix n + 1 queries
            )

            file_results = db.exec(file_statement)
            files = file_results.all()

            count_statement = select(func.count(UserFile.id)).where(UserFile.user_id == user_id)
            count_result = db.exec(count_statement)
            count = count_result.one()
        except Exception as e:
            logger.debug(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Error occured while listing files',
            ) from e

        return files, count

    def delete_file(
        self,
        db: Session,
        settings: Settings,
        background_tasks: BackgroundTasks,
        user_id: int,
        file_id: int,
    ):
        try:
            statement = select(UserFile).where(UserFile.user_id == user_id, UserFile.id == file_id)
            result = db.exec(statement)
            file = result.first()
        except Exception as e:
            logger.debug(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Error occured while deleting file',
            ) from e

        if file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File doesn't exist",
            )

        if file.status in [
            FileProcessingStatus.pending,
            FileProcessingStatus.processing,
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Unable to delete processing files',
            )

        try:
            db.delete(file)
            db.commit()

            background_tasks.add_task(delete_blob, settings.bucket_name, file.object_path)

        except Exception as e:
            logger.debug(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Error occured while deleting file',
            ) from e

    # Method for processing files in the file worker
    def process_file(self, msg: str):
        try:
            # Parse the FileUploadedEvent from the message
            fileUploadedEvent = FileUploadedEvent.parse_raw(msg)

            # Get a database session
            # Here is a method for a worker, so it's acceptable to get db like this
            db = next(get_session())
            # Get Kafka producer
            producer = get_producer()

            # Get settings
            settings = get_settings()

            # Retrieve the file data from the database
            statement = select(UserFile).where(UserFile.id == fileUploadedEvent.payload.file_id)
            result = db.exec(statement)
            file_data = result.one()

            # If the file processing was cancelled, exit
            if file_data.status == FileProcessingStatus.cancelled:
                return

            # Update the file status to processing
            self._update_status(
                db=db,
                producer=producer,
                file_data=file_data,
                message=f'File "{file_data.filename}" is being processed',
                status=FileProcessingStatus.processing,
                settings=settings,
            )

            # Download the file from the URL
            file = requests.get(file_data.url)

            # Get settings and initialize the Gemini client
            settings = get_settings()
            client = genai.Client(api_key=settings.gemini_api_key)

            # Generate content using the Gemini model
            res = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[
                    'Please summarize and explain the contents of this file. What is it about and what is its purpose?',  # noqa: E501
                    types.Part.from_bytes(data=file.content, mime_type=file_data.type),
                ],
            )

            # Create a new file description and associate it with the file
            now = datetime.now(UTC)
            file_description_data = UserFileDescription(description=res.text, created_at=now)
            file_data.file_descriptions.append(file_description_data)

            # Update the file status to success
            self._update_status(
                db=db,
                producer=producer,
                file_data=file_data,
                message=f'File "{file_data.filename}" is successfully processed',
                status=FileProcessingStatus.success,
                settings=settings,
            )
        except Exception as e:
            # If an error occurs, update the file status to failed
            with contextlib.suppress(Exception):
                file_data.status = FileProcessingStatus.failed
                db.add(file_data)
                db.commit()
                self._update_status(
                    db=db,
                    producer=producer,
                    file_data=file_data,
                    message=f'An error occured when proccessing file "{file_data.filename}"',
                    status=FileProcessingStatus.failed,
                    settings=settings,
                )
            raise e


file_service = FileService()
