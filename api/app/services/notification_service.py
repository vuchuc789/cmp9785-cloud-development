import redis

from app.models.user import FileProcessingStatus
from app.schemas.notification import Notification, NotificationType
from app.schemas.stream import BaseEvent, EventType, StatusUpdatedEvent


class NotificationService:
    def route_notification(self, msg: str):
        noti_event = BaseEvent.parse_raw(msg)
        match noti_event.event_type:
            case EventType.status_update:
                self._notify_file_status_updated(msg)
            case _:
                raise Exception('No event type matched')

    def _notify_file_status_updated(self, msg: str):
        fileUploadedEvent = StatusUpdatedEvent.parse_raw(msg)
        if fileUploadedEvent.payload.status == FileProcessingStatus.failed:
            noti = Notification(
                type=NotificationType.error,
                message=fileUploadedEvent.payload.message,
            )
        else:
            noti = Notification(
                type=NotificationType.info,
                message=fileUploadedEvent.payload.message,
            )

        try:
            r = redis.Redis(host='localhost', port=6379, decode_responses=True)
            r.publish(channel=f'noti:{fileUploadedEvent.payload.user_id}', message=noti.json())
        except Exception:
            pass


notification_service = NotificationService()
