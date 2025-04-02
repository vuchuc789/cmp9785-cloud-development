from contextlib import suppress
from typing import Annotated, Union

from fastapi import APIRouter, BackgroundTasks, Query

from app.api.dependencies import CurrentUserDep, SessionDep, SettingsDep
from app.schemas.media import (
    AudioSearchItem,
    AudioSearchResponse,
    ImageSearchItem,
    ImageSearchResponse,
    MediaDetailParams,
    MediaHistoryResponse,
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
    if query_params.q != '':
        # ignore exceptions as this's an additional feature
        with suppress(Exception):
            media_service.update_history(keyword=query_params.q, user=current_user, db=session)

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


@router.get('/history', response_model=list[MediaHistoryResponse])
async def get_history(
    current_user: CurrentUserDep,
):
    return current_user.media_histories


@router.delete('/history', response_model=list[MediaHistoryResponse])
async def delete_history(
    session: SessionDep,
    current_user: CurrentUserDep,
    keyword: Annotated[str | None, Query()] = None,
):
    if keyword is not None:
        media_service.delete_history(keyword=keyword, user=current_user, db=session)
    else:
        media_service.delete_all_history(user=current_user, db=session)

    return current_user.media_histories
