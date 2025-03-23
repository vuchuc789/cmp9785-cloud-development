import random
from datetime import UTC, datetime, timedelta
from time import sleep

import requests
from sqlmodel import Session, select

from app.core.config import Settings
from app.core.logging import logger
from app.models.openverse_token import OpenverseToken


def get_openverse_token(
    db: Session, settings: Settings, sync: bool = True
) -> OpenverseToken | None:
    try:
        if not sync:
            # mimic raft algorithm to avoid excessive token requests from instances
            sleep(random.randint(1, 300))

        statement = select(OpenverseToken).where(
            OpenverseToken.expires_in - datetime.now(UTC) >= timedelta(hours=1)
        )
        results = db.exec(statement)
        token = results.first()

        if token is not None:
            logger.info('Openverse token renewed.')
            return token

        url = f'{settings.openverse_url}v1/auth_tokens/token/'
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'grant_type': 'client_credentials',
            'client_id': settings.openverse_client_id,
            'client_secret': settings.openverse_client_secret,
        }

        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()

        if response.status_code != 200:
            logger.warn('Failed to fetch Openverse token.')
            return None

        new_token = OpenverseToken(
            access_token=response.json()['access_token'],
            expires_in=datetime.now(UTC) + timedelta(seconds=response.json()['expires_in']),
        )

        db.add(new_token)
        db.commit()
        db.refresh(new_token)

        logger.info('Openverse token renewed.')
        return new_token
    except Exception as e:
        logger.warn(f'Unexpected error in get_openverse_token: {e}', exc_info=True)
        return None
