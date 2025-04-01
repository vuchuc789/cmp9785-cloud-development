from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock
from uuid import uuid4

import jwt
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pytest_mock import MockFixture
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.main import app
from app.models.openverse_token import OpenverseToken
from app.models.user import AuthSession, User
from app.services.media_service import MediaService


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


@pytest.fixture(name='client')
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name='background_tasks')
def background_tasks_fixture():
    background_tasks = MagicMock()
    background_tasks.add_task.return_value = None
    yield background_tasks


@pytest.fixture(name='get_openverse_token')
def get_openverse_token_fixture(mocker: MockFixture):
    get_openverse_token = mocker.patch('app.services.media_service.get_openverse_token')
    yield get_openverse_token
    get_openverse_token.reset_mock()


@pytest.fixture(name='requests')
def requests_fixture(mocker: MockFixture):
    requests = mocker.patch('app.services.media_service.requests')
    yield requests
    requests.reset_mock()


@pytest.fixture
def media_service():
    """Fixture to create a fresh MediaService instance for each test"""
    return MediaService()


def test_get_openverse_token(
    media_service: MediaService,
    session: Session,
    settings: Settings,
    background_tasks: MagicMock,
    get_openverse_token: MagicMock,
):
    get_openverse_token.return_value = OpenverseToken(
        access_token='token', expires_in=datetime.now(UTC) + timedelta(minutes=300)
    )

    media_service.openverse_access_token = 'valid_token'
    media_service.openverse_expires_in = datetime.now(UTC) + timedelta(minutes=300)

    media_service.check_openverse_token(
        db=session, settings=settings, background_tasks=background_tasks
    )

    get_openverse_token.assert_not_called()
    background_tasks.add_task.assert_not_called()


def test_get_openverse_token_sync(
    media_service: MediaService,
    session: Session,
    settings: Settings,
    background_tasks: MagicMock,
    get_openverse_token: MagicMock,
):
    new_expire_time = datetime.now(UTC) + timedelta(minutes=300)
    get_openverse_token.return_value = OpenverseToken(
        access_token='new_token', expires_in=new_expire_time
    )

    media_service.check_openverse_token(
        db=session, settings=settings, background_tasks=background_tasks
    )

    get_openverse_token.assert_called_once_with(db=session, settings=settings)
    background_tasks.add_task.assert_not_called()

    assert media_service.openverse_access_token == 'new_token'
    assert media_service.openverse_expires_in == new_expire_time


def test_get_openverse_token_sync_failed(
    media_service: MediaService,
    session: Session,
    settings: Settings,
    background_tasks: MagicMock,
    get_openverse_token: MagicMock,
):
    get_openverse_token.return_value = None

    try:
        media_service.check_openverse_token(
            db=session, settings=settings, background_tasks=background_tasks
        )
    except HTTPException as e:
        assert e.status_code == 500
        assert e.detail == 'Unabled to get new token'

    get_openverse_token.assert_called_once_with(db=session, settings=settings)
    background_tasks.add_task.assert_not_called()

    assert media_service.openverse_access_token is None


def test_get_openverse_token_async(
    media_service: MediaService,
    session: Session,
    settings: Settings,
    background_tasks: MagicMock,
    get_openverse_token: MagicMock,
):
    new_expire_time = datetime.now(UTC) + timedelta(minutes=300)
    get_openverse_token.return_value = OpenverseToken(
        access_token='new_token', expires_in=new_expire_time
    )

    old_expire_time = datetime.now(UTC) + timedelta(minutes=30)
    media_service.openverse_access_token = 'old_token'
    media_service.openverse_expires_in = old_expire_time

    media_service.check_openverse_token(
        db=session, settings=settings, background_tasks=background_tasks
    )

    get_openverse_token.assert_not_called()
    background_tasks.add_task.assert_called_once_with(
        get_openverse_token, sync=False, db=session, settings=settings
    )

    assert media_service.openverse_access_token == 'old_token'
    assert media_service.openverse_expires_in == old_expire_time


def test_search_media_image(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_called_once_with(db=session, settings=settings)
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/images/',
        headers={'Authorization': 'Bearer valid_token'},
        params={'q': '', 'page': None, 'page_size': None},
    )

    assert response.status_code == 200


def test_search_media_audio(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio'}

    response = client.get('/media/search', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/',
        headers={'Authorization': 'Bearer valid_token'},
        params={'q': '', 'page': None, 'page_size': None},
    )

    assert response.status_code == 200


def test_search_media_400(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio'}

    response = client.get('/media/search', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/',
        headers={'Authorization': 'Bearer valid_token'},
        params={'q': '', 'page': None, 'page_size': None},
    )

    assert response.status_code == 400
    assert response.json()['detail'] == 'error'


def test_search_media_401(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image'}

    response = client.get('/media/search', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/images/',
        headers={'Authorization': 'Bearer valid_token'},
        params={'q': '', 'page': None, 'page_size': None},
    )

    assert response.status_code == 400
    assert response.json()['detail'] == 'error'


def test_search_media_error(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image'}

    response = client.get('/media/search', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/images/',
        headers={'Authorization': 'Bearer valid_token'},
        params={'q': '', 'page': None, 'page_size': None},
    )

    assert response.status_code == 500
    assert response.json()['detail'] == 'Unabled to fetch media'


def test_detail_media_image(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'id': '664005b7-29ae-4de4-bf67-1af00837df12',
        'title': None,
        'indexed_on': 0,
        'foreign_landing_url': None,
        'url': None,
        'creator': None,
        'creator_url': None,
        'license': '',
        'license_version': None,
        'license_url': None,
        'provider': None,
        'source': None,
        'category': None,
        'filesize': None,
        'filetype': None,
        'tags': None,
        'attribution': None,
        'fields_matched': None,
        'mature': False,
        'height': None,
        'width': None,
        'thumbnail': '',
        'detail_url': '',
        'related_url': '',
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image', 'id': '664005b7-29ae-4de4-bf67-1af00837df12'}

    response = client.get('/media/detail', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/images/664005b7-29ae-4de4-bf67-1af00837df12',
        headers={'Authorization': 'Bearer valid_token'},
    )

    assert response.status_code == 200


def test_detail_media_audio(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'id': '664005b7-29ae-4de4-bf67-1af00837df12',
        'title': None,
        'indexed_on': 0,
        'foreign_landing_url': None,
        'url': None,
        'creator': None,
        'creator_url': None,
        'license': '',
        'license_version': None,
        'license_url': None,
        'provider': None,
        'source': None,
        'category': None,
        'filesize': None,
        'filetype': None,
        'tags': None,
        'attribution': None,
        'fields_matched': None,
        'mature': False,
        'height': None,
        'width': None,
        'thumbnail': '',
        'detail_url': '',
        'related_url': '',
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'id': '664005b7-29ae-4de4-bf67-1af00837df12'}

    response = client.get('/media/detail', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/664005b7-29ae-4de4-bf67-1af00837df12',
        headers={'Authorization': 'Bearer valid_token'},
    )

    assert response.status_code == 200


def test_detail_media_401(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'id': '664005b7-29ae-4de4-bf67-1af00837df12'}

    response = client.get('/media/detail', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/664005b7-29ae-4de4-bf67-1af00837df12',
        headers={'Authorization': 'Bearer valid_token'},
    )

    assert response.status_code == 400
    assert response.json()['detail'] == 'error'


def test_detail_media_404(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'id': '664005b7-29ae-4de4-bf67-1af00837df12'}

    response = client.get('/media/detail', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/664005b7-29ae-4de4-bf67-1af00837df12',
        headers={'Authorization': 'Bearer valid_token'},
    )

    assert response.status_code == 404
    assert response.json()['detail'] == 'error'


def test_detail_media_error(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 403
    mock_response.json.return_value = {'detail': 'error'}
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'id': '664005b7-29ae-4de4-bf67-1af00837df12'}

    response = client.get('/media/detail', headers=headers, params=params)

    # called in the above test case
    get_openverse_token.assert_not_called()
    requests.get.assert_called_once_with(
        'https://api.openverse.org/v1/audio/664005b7-29ae-4de4-bf67-1af00837df12',
        headers={'Authorization': 'Bearer valid_token'},
    )

    assert response.status_code == 500
    assert response.json()['detail'] == 'Unabled to fetch media'


def test_search_media_wrong_field_1(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image', 'categories': 'music'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_not_called()
    requests.get.assert_not_called()

    assert response.status_code == 422


def test_search_media_wrong_field_2(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'image', 'length': 'short'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_not_called()
    requests.get.assert_not_called()

    assert response.status_code == 422


def test_search_media_wrong_field_3(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'categories': 'photograph'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_not_called()
    requests.get.assert_not_called()

    assert response.status_code == 422


def test_search_media_wrong_field_4(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'size': 'large'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_not_called()
    requests.get.assert_not_called()

    assert response.status_code == 422


def test_search_media_wrong_field_5(
    session: Session,
    settings: Settings,
    client: TestClient,
    requests: MagicMock,
    get_openverse_token: MagicMock,
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    openverse_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )
    get_openverse_token.return_value = openverse_token

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'result_count': 1,
        'page_count': 1,
        'page_size': 1,
        'page': 1,
        'results': [],
    }
    requests.get.return_value = mock_response

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}
    params = {'type': 'audio', 'aspect_ratio': 'square'}

    response = client.get('/media/search', headers=headers, params=params)

    get_openverse_token.assert_not_called()
    requests.get.assert_not_called()

    assert response.status_code == 422
