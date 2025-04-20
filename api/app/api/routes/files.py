from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Path, Query, UploadFile, status

from app.api.dependencies import CurrentUserDep, ProducerDep, SessionDep, SettingsDep
from app.schemas.file import FileResponse, ListFilesQueries, ListFilesResponse
from app.services.file_service import file_service

router = APIRouter()


@router.post('/upload', response_model=FileResponse)
async def upload_file(
    current_user: CurrentUserDep,
    settings: SettingsDep,
    session: SessionDep,
    producer: ProducerDep,
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File()],
):
    if file.filename is None or file.filename == '':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Unable to read filename',
        )

    if file.content_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Content type is not supported',
        )

    if file.size is None or file.size <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='File is empty',
        )

    if file.size > 5242880:  # = 5 * 1024 * 1024 = 5MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='File too large (Max 5MB)',
        )

    new_file = await file_service.upload_file(
        user_id=current_user.id,
        settings=settings,
        db=session,
        producer=producer,
        background_tasks=background_tasks,
        file=file,
    )
    return new_file


@router.get('/', response_model=ListFilesResponse)
async def list_files(
    session: SessionDep,
    current_user: CurrentUserDep,
    queries: Annotated[ListFilesQueries, Query()],
):
    files, count = file_service.list_files(
        db=session,
        user_id=current_user.id,
        page=queries.page,
        page_size=queries.page_size,
        sort_by=queries.sort_by,
        sort_order=queries.order,
    )
    page_count = ((count - 1) // queries.page_size) + 1

    return {
        'result_count': count,
        'page_count': page_count,
        'page_size': queries.page_size,
        'page': queries.page,
        'results': files,
    }


@router.delete('/{file_id}')
async def delete_file(
    session: SessionDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
    current_user: CurrentUserDep,
    file_id: Annotated[int, Path(gt=0)],
):
    file_service.delete_file(
        db=session,
        settings=settings,
        background_tasks=background_tasks,
        user_id=current_user.id,
        file_id=file_id,
    )
    return {
        'detail': 'Deleted successfully',
    }
