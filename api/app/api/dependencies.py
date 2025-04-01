import uuid
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from jwt.exceptions import InvalidTokenError
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.core.security import oauth2_scheme
from app.models.user import AuthSession, User
from app.services.user_service import user_service

SettingsDep = Annotated[Settings, Depends(get_settings)]

# dependency to get DB sessions
SessionDep = Annotated[Session, Depends(get_session)]

# this dependency only ensures that a token exists in the request
TokenDep = Annotated[str, Depends(oauth2_scheme)]


# this dependency make sure that user is logged in
# it also returns the user info in database
async def get_current_user(
    token: TokenDep,
    session: SessionDep,
    settings: SettingsDep,
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        # expiration time is automatically verified in jwt.decode()
        payload = jwt.decode(
            token, settings.auth_token_secret_key, algorithms=[settings.auth_token_algorithm]
        )
        username = payload.get('sub')
        auth_session_id = payload.get('session_id')

        if username is None or auth_session_id is None:
            raise credentials_exception

    except InvalidTokenError as err:
        raise credentials_exception from err

    user_auth_session = user_service.get_user_with_auth_session(
        db=session, username=username, auth_session_id=uuid.UUID(auth_session_id)
    )
    if user_auth_session is None:
        raise credentials_exception

    return user_auth_session


async def get_user_only(
    user_auth_session: Annotated[tuple[User, AuthSession], Depends(get_current_user)],
):
    return user_auth_session[0]


CurrentUserDep = Annotated[User, Depends(get_user_only)]


async def get_current_user_from_refresh_token(
    refresh_token: Annotated[str, Cookie()],
    session: SessionDep,
    settings: SettingsDep,
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
    )
    try:
        payload = jwt.decode(
            refresh_token,
            settings.auth_token_secret_key,
            algorithms=[settings.auth_token_algorithm],
        )
        username = payload.get('sub')
        auth_session_id = payload.get('session_id')
        token_version = payload.get('token_version')

        if username is None or auth_session_id is None or token_version is None:
            raise credentials_exception

    except InvalidTokenError as err:
        raise credentials_exception from err

    user_auth_session = user_service.get_user_with_auth_session(
        db=session, username=username, auth_session_id=uuid.UUID(auth_session_id)
    )
    if user_auth_session is None or str(user_auth_session[1].token_version) != token_version:
        raise credentials_exception

    return user_auth_session


CurrentRefreshTokenUserDep = Annotated[User, Depends(get_current_user_from_refresh_token)]
