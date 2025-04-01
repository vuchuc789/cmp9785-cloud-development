from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
import pytest
from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.dependencies import get_current_user
from app.core.config import Settings, get_settings
from app.models.user import AuthSession, User


@pytest.fixture(name='session')
def session_fixture():
    engine = create_engine(
        'sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name='settings')
def settings_fixture():
    settings = get_settings()
    yield settings


@pytest.mark.asyncio
async def test_get_current_user(session: Session, settings: Settings):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='abc',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    user = await get_current_user(encoded_jwt, session, settings)

    assert user[0].username == 'johndoe'


@pytest.mark.asyncio
async def test_get_current_user_not_found(session: Session, settings: Settings):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe1',
        hashed_password='abc',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )

    with pytest.raises(HTTPException) as excinfo:
        await get_current_user(encoded_jwt, session, settings)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == 'Could not validate credentials'


@pytest.mark.asyncio
async def test_get_current_user_expired_token(session: Session, settings: Settings):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='abc',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) - timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )

    with pytest.raises(HTTPException) as excinfo:
        await get_current_user(encoded_jwt, session, settings)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == 'Could not validate credentials'


@pytest.mark.asyncio
async def test_get_current_user_invalid_credentials(session: Session, settings: Settings):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='abc',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    to_encode = {
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )

    with pytest.raises(HTTPException) as excinfo:
        await get_current_user(encoded_jwt, session, settings)

    assert excinfo.value.status_code == 401
    assert excinfo.value.detail == 'Could not validate credentials'
