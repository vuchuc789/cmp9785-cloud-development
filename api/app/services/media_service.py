from datetime import UTC, datetime, timedelta

import requests
from fastapi import BackgroundTasks, HTTPException, status
from sqlmodel import Session

from app.core.config import Settings
from app.schemas.media import MediaDetailParams, MediaSearchParams, MediaType
from app.utils.openverse import get_openverse_token


class MediaService:
    def __init__(self) -> None:
        self.openverse_access_token: str | None = None
        self.openverse_expires_in: datetime = datetime.now(UTC)

    def check_openverse_token(
        self, db: Session, settings: Settings, background_tasks: BackgroundTasks
    ):
        now = datetime.now(UTC)

        if self.openverse_access_token is None or self.openverse_expires_in <= now:
            token = get_openverse_token(db=db, settings=settings)
            if token is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail='Unabled to get new token',
                )

            self.openverse_access_token = token.access_token
            self.openverse_expires_in = token.expires_in.replace(tzinfo=UTC)
            return

        if self.openverse_access_token is not None and self.openverse_expires_in <= now + timedelta(
            hours=1
        ):
            background_tasks.add_task(
                get_openverse_token,
                sync=False,
                db=db,
                settings=settings,
            )
            return

    def search(
        self,
        query_params: MediaSearchParams,
        db: Session,
        settings: Settings,
        background_tasks: BackgroundTasks,
    ):
        self.check_openverse_token(db=db, settings=settings, background_tasks=background_tasks)
        params = {
            'q': query_params.q,
            'page': query_params.page,
            'page_size': query_params.page_size,
            **{
                key: ','.join(value)
                for key, value in {
                    'license': query_params.license,
                    'license_type': query_params.license_type,
                    'categories': query_params.categories,
                }.items()
                if value is not None
            },
        }

        if query_params.type == MediaType.IMAGE:
            url = f'{settings.openverse_url}v1/images/'
            params = {
                **params,
                **{
                    key: ','.join(value)
                    for key, value in {
                        'aspect_ratio': query_params.aspect_ratio,
                        'size': query_params.size,
                    }.items()
                    if value is not None
                },
            }

        if query_params.type == MediaType.AUDIO:
            url = f'{settings.openverse_url}v1/audio/'
            params = {
                **params,
                **{
                    key: ','.join(value)
                    for key, value in {
                        'length': query_params.aspect_ratio,
                    }.items()
                    if value is not None
                },
            }

        headers = {'Authorization': f'Bearer {self.openverse_access_token}'}

        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            if response.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response.json()['detail'],
                )
            if response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response.json()['detail'],
                )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Unabled to fetch media',
            )

        # print(curlify.to_curl(response.request))

        data = response.json()
        return data

    def detail(
        self,
        query_params: MediaDetailParams,
        db: Session,
        settings: Settings,
        background_tasks: BackgroundTasks,
    ):
        self.check_openverse_token(db=db, settings=settings, background_tasks=background_tasks)

        if query_params.type == MediaType.IMAGE:
            url = f'{settings.openverse_url}v1/images/{query_params.id}'

        if query_params.type == MediaType.AUDIO:
            url = f'{settings.openverse_url}v1/audio/{query_params.id}'

        headers = {'Authorization': f'Bearer {self.openverse_access_token}'}

        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            if response.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response.json()['detail'],
                )
            if response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response.json()['detail'],
                )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Unabled to fetch media',
            )

        # print(curlify.to_curl(response.request))

        data = response.json()
        return data


media_service = MediaService()
