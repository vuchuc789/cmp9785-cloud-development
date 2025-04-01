from datetime import datetime
from uuid import uuid4

import bcrypt
import jwt
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


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


def create_jwt_token(
    data: dict,
    secret_key: str,
    algorithm: str,
    issued_at: datetime | None = None,
    expires_time: datetime | None = None,
):
    to_encode = data.copy()

    to_encode.update({'jti': str(uuid4())})

    if issued_at is not None:
        to_encode.update({'iat': issued_at})

    if expires_time is not None:
        to_encode.update({'exp': expires_time})

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt
