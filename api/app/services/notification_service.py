import asyncio
import contextlib

from fastapi import WebSocket, WebSocketDisconnect

from app.core.cache import get_client, get_sync_client
from app.core.config import get_settings
from app.core.logging import logger
from app.models.user import FileProcessingStatus, User
from app.schemas.notification import Notification, NotificationCategory, NotificationType
from app.schemas.stream import BaseEvent, EventType, StatusUpdatedEvent
from app.utils.mail import send_email_with_sendgrid


class NotificationService:
    def route_notifications(self, msg: str):
        noti_event = BaseEvent.parse_raw(msg)
        match noti_event.event_type:
            case EventType.status_update:
                self._notify_file_status_updated(msg)
            case _:
                raise Exception('No event type matched')

    def _notify_file_status_updated(self, msg: str):
        fileUploadedEvent = StatusUpdatedEvent.parse_raw(msg)
        noti = Notification(
            type=NotificationType.info,
            category=NotificationCategory.file,
            message=fileUploadedEvent.payload.message,
        )
        if fileUploadedEvent.payload.status == FileProcessingStatus.failed:
            noti.type = NotificationType.error

        with contextlib.suppress(Exception):
            r = get_sync_client()
            r.publish(channel=f'noti:{fileUploadedEvent.payload.user_id}', message=noti.json())

        if fileUploadedEvent.payload.email is not None and fileUploadedEvent.payload.status in [
            FileProcessingStatus.success,
            FileProcessingStatus.failed,
        ]:
            settings = get_settings()
            send_email_with_sendgrid(
                api_key=settings.sendgrid_api_key,
                from_email=settings.source_email,
                to_emails=[fileUploadedEvent.payload.email],
                subject='Your file processing has finished',
                content=f'<p>{fileUploadedEvent.payload.message}</p>',
            )

    async def push_notifications(self, websocket: WebSocket, user: User):
        await websocket.accept()
        logger.debug(f'"{user.full_name or "An user"}" has joined')

        async def handler(msg):
            await websocket.send_text(msg['data'])

        r = get_client()
        p = r.pubsub()

        await p.subscribe(**{f'noti:{user.id}': handler})
        task = asyncio.create_task(p.run())

        try:
            while True:
                data = await websocket.receive_text()
                logger.debug(f'User sent: {data}')
        except WebSocketDisconnect:
            logger.debug(f'"{user.full_name or "An user"}" has left')
        finally:
            task.cancel()
            await p.unsubscribe(str(user.id))
            await p.close()


notification_service = NotificationService()
