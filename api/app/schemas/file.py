from datetime import datetime
from enum import Enum
from typing import Annotated

from fastapi import Query
from pydantic import BaseModel

from app.models.user import FileProcessingStatus


class SortBy(str, Enum):
    created_at = 'created_at'
    name = 'name'
    status = 'status'


class SortOrder(str, Enum):
    asc = 'asc'
    desc = 'desc'


class FileResponse(BaseModel):
    id: int
    filename: str
    status: FileProcessingStatus
    size: int
    type: str
    url: str
    created_at: datetime
    description: str | None


class ListFilesQueries(BaseModel):
    page: Annotated[int, Query(gt=0)] = 1
    page_size: Annotated[int, Query(gt=0, le=50)] = 20
    sort_by: SortBy = SortBy.created_at
    order: SortOrder = SortOrder.asc


class ListFilesResponse(BaseModel):
    result_count: int
    page_count: int
    page_size: int
    page: int
    credit: int
    credit_count: int
    credit_timestamp: datetime | None
    results: list[FileResponse]
