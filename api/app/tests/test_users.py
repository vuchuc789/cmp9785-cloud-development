from datetime import datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.main import app
from app.models.user import User


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
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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


def test_update_user_info_user_fields_empty(
    session: Session, settings: Settings, client: TestClient
):
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
    user = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
    )
    session.add(user)
    session.commit()

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
    user_1 = User(
        username='johndoe',
        hashed_password='$2b$12$AHQ9qSw9./9eosG4RuH3W.hsSUUPS5yUHocSMna7oswoWOfirTWkS',
        full_name='John Doe',
        email='johndoe@example.com',
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

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    to_encode = {'sub': 'johndoe', 'exp': datetime.now() + timedelta(minutes=15)}
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
