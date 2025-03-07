from datetime import UTC, datetime, timedelta
from typing import Annotated

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel

from app.core.config import Settings, get_settings
from app.models.user import User as DBUser

fake_users_db = {
    'johndoe': {
        'username': 'johndoe',
        'full_name': 'John Doe',
        'email': 'johndoe@example.com',
        'hashed_password': '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    },
    'alice': {
        'username': 'alice',
        'full_name': 'Alice Chains',
        'email': 'alicechains@example.com',
        'hashed_password': '$2b$12$gSvqqUPvlXP2tfVFaWK1Be7DlH.PKZbv5H8KnzzVgXXbVxpva.pFm',
    },
}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='users/login')


def get_password_hash(password):
    return bcrypt.hashpw(
        bytes(password, encoding='utf-8'),
        bcrypt.gensalt(),
    )


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        bytes(plain_password, encoding='utf-8'),
        bytes(hashed_password, encoding='utf-8'),
    )


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode.update({'exp': expire})
    settings = get_settings()
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    return encoded_jwt


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return DBUser(**user_dict)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(
            token, settings.auth_token_secret_key, algorithms=[settings.auth_token_algorithm]
        )
        username = payload.get('sub')
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError as err:
        raise credentials_exception from err

    if token_data.username is None:
        raise credentials_exception

    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
