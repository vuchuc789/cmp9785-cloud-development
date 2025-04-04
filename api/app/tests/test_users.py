from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient
from pytest_mock import MockerFixture
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.main import app
from app.models.user import AuthSession, EmailVerificationStatus, User
from app.utils.mail import send_email_with_sendgrid


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


def test_login_for_access_token(session: Session, client: TestClient):
    session.add(
        User(
            username='johndoe',
            hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        )
    )
    session.commit()

    # Convert OAuth2PasswordRequestForm to dictionary for the request
    login_data = {'username': 'johndoe', 'password': 'secret'}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/login', data=login_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert 'access_token' in response.json()
    assert response.json()['token_type'] == 'bearer'


def test_login_for_access_token_user_not_found(session: Session, client: TestClient):
    session.add(
        User(
            username='johndoe',
            hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        )
    )
    session.commit()

    # Convert OAuth2PasswordRequestForm to dictionary for the request
    login_data = {'username': 'johndoee', 'password': 'secret'}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/login', data=login_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 401
    assert response.json()['detail'] == 'Incorrect username or password'


def test_login_for_access_token_wrong_password(session: Session, client: TestClient):
    session.add(
        User(
            username='johndoe',
            hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        )
    )
    session.commit()

    # Convert OAuth2PasswordRequestForm to dictionary for the request
    login_data = {'username': 'johndoe', 'password': 'secrett'}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/login', data=login_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 401
    assert response.json()['detail'] == 'Incorrect username or password'


def test_get_current_user_info(session: Session, settings: Settings, client: TestClient):
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

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )

    headers = {'Authorization': f'Bearer {encoded_jwt}'}

    response = client.get('/users/info', headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doe'
    assert response.json()['email'] == 'johndoe@example.com'


def test_register_new_user(client: TestClient):
    request_data = {
        'username': 'johndoe',
        'password': 'secret',
        'password_repeat': 'secret',
        'full_name': 'John Doe',
        'email': 'johndoe@example.com',
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/register', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doe'
    assert response.json()['email'] == 'johndoe@example.com'


def test_register_new_user_passwords_not_matched(client: TestClient):
    request_data = {
        'username': 'johndoe',
        'password': 'secret',
        'password_repeat': 'secrett',
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/register', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 422


def test_register_new_user_user_duplicated(session: Session, client: TestClient):
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    request_data = {
        'username': 'johndoe',
        'password': 'secret',
        'password_repeat': 'secret',
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/register', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 400
    assert response.json()['detail'] == 'Username is already taken'


def test_register_new_user_email_duplicated(session: Session, client: TestClient):
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    request_data = {
        'username': 'johndoee',
        'password': 'secret',
        'password_repeat': 'secret',
        'email': 'johndoe@example.com',
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/register', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 400
    assert response.json()['detail'] == 'Email is already registered'


def test_register_new_user_email_wrong_type(client: TestClient):
    request_data = {
        'username': 'johndoe',
        'password': 'secret',
        'password_repeat': 'secret',
        'email': 'johndoe.com',
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    response = client.post('/users/register', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 422


def test_update_user_info(session: Session, settings: Settings, client: TestClient):
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'password': 'abc123',
        'password_repeat': 'abc123',
        'email': 'johndoe@gmail.com',
        'full_name': 'John Doeeeee',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doeeeee'
    assert response.json()['email'] == 'johndoe@gmail.com'


def test_update_user_info_update_verifying_email(
    session: Session, settings: Settings, client: TestClient
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    mock_token = uuid4()
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_status=EmailVerificationStatus.verifying,
        email_verification_token=str(mock_token),
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'password': 'abc123',
        'password_repeat': 'abc123',
        'email': 'johndoe@gmail.com',
        'full_name': 'John Doeeeee',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    session.refresh(user)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doeeeee'
    assert response.json()['email'] == 'johndoe@gmail.com'
    assert response.json()['email_verification_status'] == 'none'
    assert user.email_verification_status == 'none'
    assert user.email_verification_token is None


def test_update_user_info_update_verified_email(
    session: Session, settings: Settings, client: TestClient
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    mock_token = uuid4()
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_status=EmailVerificationStatus.verified,
        email_verification_token=str(mock_token),
        auth_sessions=[auth_session],
    )
    session.add(user)
    session.commit()
    session.refresh(auth_session)

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'password': 'abc123',
        'password_repeat': 'abc123',
        'email': 'johndoe@gmail.com',
        'full_name': 'John Doeeeee',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    session.refresh(user)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doeeeee'
    assert response.json()['email'] == 'johndoe@gmail.com'
    assert response.json()['email_verification_status'] == 'none'
    assert user.email_verification_status == 'none'
    assert user.email_verification_token is None


def test_update_user_info_user_fields_empty(
    session: Session, settings: Settings, client: TestClient
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'password': '',
        'password_repeat': '',
        'email': '',
        'full_name': '',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doe'
    assert response.json()['email'] == 'johndoe@example.com'


def test_update_user_info_user_fields_none(
    session: Session, settings: Settings, client: TestClient
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 200
    assert response.json()['username'] == 'johndoe'
    assert response.json()['full_name'] == 'John Doe'
    assert response.json()['email'] == 'johndoe@example.com'


def test_update_user_info_user_usernames_not_match(
    session: Session, settings: Settings, client: TestClient
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoeee',
        'password': 'abc123',
        'password_repeat': 'abc123',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 400
    assert response.json()['detail'] == 'Username and token do not match'


def test_update_user_info_user_passwords_not_match(
    session: Session, settings: Settings, client: TestClient
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'password': 'abc123',
        'password_repeat': 'abcd1234',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 422


def test_update_user_info_user_usernames_email_existed(
    session: Session, settings: Settings, client: TestClient
):
    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user_1 = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        auth_sessions=[auth_session],
    )
    user_2 = User(
        username='johndoe1',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@gmail.com',
    )
    session.add(user_1)
    session.add(user_2)
    session.commit()
    session.refresh(auth_session)

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers['Authorization'] = f'Bearer {encoded_jwt}'

    request_data = {
        'username': 'johndoe',
        'email': 'johndoe@gmail.com',
    }

    response = client.patch('/users/update', data=request_data, headers=headers)

    # Assert response to use the variable
    assert response.status_code == 400
    assert response.json()['detail'] == 'Email is already registered'


def test_send_verification_email(
    session: Session,
    settings: Settings,
    mocker: MockerFixture,
    client: TestClient,
):
    mock_add_task = mocker.patch('app.services.user_service.BackgroundTasks.add_task')
    mock_token = uuid4()
    mock_uuid4 = mocker.patch('app.services.user_service.uuid4')
    mock_uuid4.return_value = mock_token

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

    to_encode = {
        'sub': 'johndoe',
        'session_id': str(auth_session.id),
        'exp': datetime.now(UTC) + timedelta(minutes=15),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.auth_token_secret_key, algorithm=settings.auth_token_algorithm
    )
    headers = {'Authorization': f'Bearer {encoded_jwt}'}

    response = client.post('/users/verify-email', headers=headers)

    session.refresh(user)

    assert response.status_code == 200
    assert response.json()['email'] == 'johndoe@example.com'
    assert response.json()['email_verification_status'] == 'verifying'
    assert user.email_verification_token == str(mock_token)

    mock_add_task.assert_called_once()
    mock_add_task.assert_called_once_with(
        send_email_with_sendgrid,
        api_key=settings.sendgrid_api_key,
        from_email=settings.source_email,
        to_emails=['johndoe@example.com'],
        subject='Verify your email',
        content=f'<p>Verify your email by clicking this <a href="http://localhost:3000/verify-email?token={str(mock_token)}">link</a>.</p>',
    )


def test_send_verification_email_with_no_email(
    session: Session,
    settings: Settings,
    mocker: MockerFixture,
    client: TestClient,
):
    mock_add_task = mocker.patch('app.services.user_service.BackgroundTasks.add_task')

    token_version = uuid4()
    auth_session = AuthSession(
        expires_date=datetime.now(UTC) + timedelta(hours=1),
        token_version=token_version,
    )
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
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
    headers = {'Authorization': f'Bearer {encoded_jwt}'}

    response = client.post('/users/verify-email', headers=headers)

    session.refresh(user)

    assert response.status_code == 400
    assert response.json()['detail'] == 'User has no email'
    assert user.email_verification_status == 'none'
    assert user.email_verification_token is None

    mock_add_task.assert_not_called()


def test_send_verification_email_with_verified_email(
    session: Session,
    settings: Settings,
    mocker: MockerFixture,
    client: TestClient,
):
    mock_add_task = mocker.patch('app.services.user_service.BackgroundTasks.add_task')

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
        email_verification_token='i-am-a-token',
        email_verification_status=EmailVerificationStatus.verified,
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
    headers = {'Authorization': f'Bearer {encoded_jwt}'}

    response = client.post('/users/verify-email', headers=headers)

    session.refresh(user)

    assert response.status_code == 400
    assert response.json()['detail'] == 'User has already been verified'
    assert user.email_verification_status == 'verified'
    assert user.email_verification_token == 'i-am-a-token'

    mock_add_task.assert_not_called()


def test_verify_email(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_token=str(mock_token),
        email_verification_status=EmailVerificationStatus.verifying,
    )
    session.add(user)
    session.commit()

    response = client.get('/users/verify-email', params={'token': str(mock_token)})

    session.refresh(user)

    assert response.status_code == 200
    assert response.json()['email_verification_status'] == 'verified'
    assert user.email_verification_status == 'verified'
    assert user.email_verification_token == str(mock_token)


def test_verify_email_token_not_found(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    response = client.get('/users/verify-email', params={'token': str(mock_token)})

    assert response.status_code == 400
    assert response.json()['detail'] == 'Token not found'


def test_verify_email_already_verified(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_token=str(mock_token),
        email_verification_status=EmailVerificationStatus.verified,
    )
    session.add(user)
    session.commit()

    response = client.get('/users/verify-email', params={'token': str(mock_token)})

    session.refresh(user)

    assert response.status_code == 400
    assert response.json()['detail'] == 'User is already verified'


def test_verify_email_updated_email(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_token=str(mock_token),
        email_verification_status=EmailVerificationStatus.none,
    )
    session.add(user)
    session.commit()

    response = client.get('/users/verify-email', params={'token': str(mock_token)})

    session.refresh(user)

    assert response.status_code == 400
    assert response.json()['detail'] == 'Email has been updated'


def test_send_reset_password_email(
    session: Session,
    settings: Settings,
    mocker: MockerFixture,
    client: TestClient,
):
    mock_add_task = mocker.patch('app.services.user_service.BackgroundTasks.add_task')
    mock_token_1 = uuid4()
    mock_token_2 = uuid4()
    mock_uuid4 = mocker.patch('app.services.user_service.uuid4')
    mock_uuid4.return_value = mock_token_1

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        email_verification_status=EmailVerificationStatus.verified,
        email_verification_token=str(mock_token_2),
    )
    session.add(user)
    session.commit()

    body = {'email': 'johndoe@example.com'}

    response = client.post('/users/reset-password', json=body)

    session.refresh(user)

    assert response.status_code == 200
    assert (
        response.json()['detail']
        == 'If your email is found and verified, an reset password email will be sent'
    )
    assert user.password_reset_token == str(mock_token_1)

    mock_add_task.assert_called_once()
    mock_add_task.assert_called_once_with(
        send_email_with_sendgrid,
        api_key=settings.sendgrid_api_key,
        from_email=settings.source_email,
        to_emails=['johndoe@example.com'],
        subject='Reset your password',
        content=f'<p>Click this <a href="http://localhost:3000/reset-password?token={str(mock_token_1)}">link</a> to reset password for user <b>johndoe</b>.</p>',  # noqa: E501
    )


def test_send_reset_password_email_not_sent(
    mocker: MockerFixture,
    client: TestClient,
):
    mock_add_task = mocker.patch('app.services.user_service.BackgroundTasks.add_task')
    mock_uuid4 = mocker.patch('app.services.user_service.uuid4')

    body = {'email': 'johndoe@gmail.com'}

    response = client.post('/users/reset-password', json=body)

    assert response.status_code == 200
    assert (
        response.json()['detail']
        == 'If your email is found and verified, an reset password email will be sent'
    )

    mock_uuid4.assert_not_called()
    mock_add_task.assert_not_called()


def test_reset_password(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        password_reset_token=str(mock_token),
    )
    session.add(user)
    session.commit()

    response = client.patch(
        '/users/reset-password',
        params={'token': str(mock_token)},
        data={'password': 'abc123', 'password_repeat': 'abc123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )

    session.refresh(user)

    assert response.status_code == 200
    assert user.password_reset_token is None
    assert user.hashed_password != '$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS'


def test_reset_password_token_not_found(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    response = client.patch(
        '/users/reset-password',
        params={'token': str(mock_token)},
        data={'password': 'abc123', 'password_repeat': 'abc123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )

    assert response.status_code == 400
    assert response.json()['detail'] == 'Token not found'


def test_reset_password_passwords_not_match(
    session: Session,
    client: TestClient,
):
    mock_token = uuid4()

    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
        password_reset_token=str(mock_token),
    )
    session.add(user)
    session.commit()

    response = client.patch(
        '/users/reset-password',
        params={'token': str(mock_token)},
        data={'password': 'abc123', 'password_repeat': 'abc1234'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )

    session.refresh(user)

    assert response.status_code == 422
    assert user.password_reset_token == str(mock_token)
    assert user.hashed_password == '$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS'
