from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class Topic(str, Enum):
    files = 'files'


class EventType(str, Enum):
    file_upload = 'file.uploaded'


class Metadata(BaseModel):
    version: int
    source: str


class BaseEvent(BaseModel):
    event_type: EventType
    timestamp: datetime
    metadata: Metadata


class FileUploadedPayload(BaseModel):
    file_id: int


class FileUploadedEvent(BaseEvent):
    payload: FileUploadedPayload
