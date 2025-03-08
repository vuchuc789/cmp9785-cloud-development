from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from app.core.config import get_settings


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='users/login')


def get_password_hash(password: str):
    return str(
        bcrypt.hashpw(
            bytes(password, encoding='utf-8'),
            bcrypt.gensalt(),
        ),
        encoding='utf-8',
    )


def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(
        bytes(plain_password, encoding='utf-8'),
        bytes(hashed_password, encoding='utf-8'),
    )


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode.update({'exp': expire})
    settings = get_settings()
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    return encoded_jwt
