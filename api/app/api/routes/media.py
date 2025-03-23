from typing import Annotated, Union

from fastapi import APIRouter, BackgroundTasks, Query

from app.api.dependencies import CurrentUserDep, SessionDep, SettingsDep
from app.schemas.media import AudioSearchResponse, ImageSearchResponse, MediaSearchParams
from app.services.media_service import media_service

router = APIRouter()


@router.get(
    '/search',
    response_model=Union[ImageSearchResponse, AudioSearchResponse],  # noqa: UP007
    # response_model=ImageSearchResponse,
    # response_model=AudioSearchResponse,
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
