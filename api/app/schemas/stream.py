from datetime import datetime
from enum import Enum

from pydantic import BaseModel

from app.core.config import ServerMode
from app.models.user import FileProcessingStatus


class Topic(str, Enum):
    files = 'files'
    notifications = 'notifications'


class EventType(str, Enum):
    file_upload = 'file.uploaded'
    status_update = 'status.updated'


class Metadata(BaseModel):
    version: int
    source: ServerMode


class BaseEvent(BaseModel):
    event_type: EventType
    timestamp: datetime
    metadata: Metadata


class FileUploadedPayload(BaseModel):
    file_id: int


class FileUploadedEvent(BaseEvent):
    payload: FileUploadedPayload


class StatusUpdatedPayload(BaseModel):
    user_id: int
    status: FileProcessingStatus
    message: str


class StatusUpdatedEvent(BaseEvent):
    payload: StatusUpdatedPayload
