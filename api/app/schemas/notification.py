from enum import Enum

from pydantic import BaseModel


class NotificationType(str, Enum):
    info = 'info'
    error = 'error'


class NotificationCategory(str, Enum):
    file = 'file'


class Notification(BaseModel):
    type: NotificationType
    category: NotificationCategory
    message: str
