from enum import Enum

from pydantic import BaseModel


class NotificationType(str, Enum):
    info = 'info'
    error = 'error'


class Notification(BaseModel):
    type: NotificationType
    message: str
