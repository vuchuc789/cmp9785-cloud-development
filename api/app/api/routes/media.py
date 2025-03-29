from typing import Annotated, Union

from fastapi import APIRouter, BackgroundTasks, Query

from app.api.dependencies import CurrentUserDep, SessionDep, SettingsDep
from app.schemas.media import (
    AudioSearchItem,
    AudioSearchResponse,
    ImageSearchItem,
    ImageSearchResponse,
    MediaDetailParams,
    MediaSearchParams,
)
from app.services.media_service import media_service

router = APIRouter()


@router.get(
    '/search',
    response_model=Union[ImageSearchResponse, AudioSearchResponse],  # noqa: UP007
    response_model_exclude_unset=True,
)
async def search_media(
    query_params: Annotated[MediaSearchParams, Query()],
    current_user: CurrentUserDep,
    session: SessionDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
):
    result = media_service.search(
        query_params=query_params, db=session, settings=settings, background_tasks=background_tasks
    )
    return result


@router.get('/detail', response_model=Union[ImageSearchItem, AudioSearchItem])  # noqa: UP007
async def media_detail(
    query_params: Annotated[MediaDetailParams, Query()],
    current_user: CurrentUserDep,
    session: SessionDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
):
    result = media_service.detail(
        query_params=query_params, db=session, settings=settings, background_tasks=background_tasks
    )
    return result
