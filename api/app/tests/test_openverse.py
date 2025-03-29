from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

import pytest
import requests

from app.models.openverse_token import OpenverseToken
from app.utils.openverse import get_openverse_token


@pytest.fixture
def mock_sleep(mocker):
    """Fixture to mock time.sleep"""
    return mocker.patch('app.utils.openverse.sleep')


@pytest.fixture
def mock_logger(mocker):
    """Fixture to mock the logger"""
    return mocker.patch('app.utils.openverse.logger')


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    db = MagicMock()
    db.exec.return_value.first.return_value = None
    return db


@pytest.fixture
def mock_settings():
    """Fixture to mock settings"""
    settings = MagicMock()
    settings.openverse_url = 'https://api.openverse.org/'
    settings.openverse_client_id = 'test_client_id'
    settings.openverse_client_secret = 'test_client_secret'
    return settings


@pytest.fixture
def mock_requests_post(mocker):
    """Fixture to mock requests.post"""
    mock_post = mocker.patch('requests.post')
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'access_token': 'test_token',
        'expires_in': 3600,  # 1 hour in seconds
    }
    mock_post.return_value = mock_response
    return mock_post


def test_get_existing_valid_token(mock_db, mock_settings, mock_logger):
    # Create valid token that expires in more than 1 hour
    valid_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )

    # Configure mock DB to return the valid token
    mock_db.exec.return_value.first.return_value = valid_token

    # Call the function
    result = get_openverse_token(mock_db, mock_settings)

    # Assertions
    assert result == valid_token
    mock_logger.info.assert_called_with('Openverse token renewed.')
    mock_db.add.assert_not_called()
    mock_db.commit.assert_not_called()


def test_get_new_token_success(mock_db, mock_settings, mock_requests_post, mock_logger):
    # Call the function to get a new token
    result = get_openverse_token(mock_db, mock_settings)

    # Verify HTTP request was made correctly
    mock_requests_post.assert_called_once_with(
        f'{mock_settings.openverse_url}v1/auth_tokens/token/',
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        data={
            'grant_type': 'client_credentials',
            'client_id': mock_settings.openverse_client_id,
            'client_secret': mock_settings.openverse_client_secret,
        },
    )

    # Verify token was created and saved
    assert result is not None
    assert result.access_token == 'test_token'
    assert result.expires_in > datetime.now(UTC)
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()
    mock_logger.info.assert_called_with('Openverse token renewed.')


def test_get_token_http_error(mock_db, mock_settings, mock_requests_post, mock_logger):
    # Configure mock to raise an HTTP error
    mock_requests_post.side_effect = requests.HTTPError('HTTP Error')

    # Call the function
    result = get_openverse_token(mock_db, mock_settings)

    # Verify result and logging
    assert result is None
    mock_logger.warn.assert_called_with(
        'Unexpected error in get_openverse_token: HTTP Error', exc_info=True
    )


def test_get_token_non_200_response(mock_db, mock_settings, mock_requests_post, mock_logger):
    # Configure mock to return non-200 response
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.raise_for_status.return_value = None
    mock_requests_post.return_value = mock_response

    # Call the function
    result = get_openverse_token(mock_db, mock_settings)

    # Verify result and logging
    assert result is None
    mock_logger.warn.assert_called_with('Failed to fetch Openverse token.')


def test_async_mode_sleeps(mock_db, mock_settings, mock_sleep, mock_logger):
    # Create valid token that expires in more than 1 hour
    valid_token = OpenverseToken(
        access_token='valid_token', expires_in=datetime.now(UTC) + timedelta(hours=2)
    )

    # Configure mock DB to return the valid token
    mock_db.exec.return_value.first.return_value = valid_token

    # Call function with sync=False
    result = get_openverse_token(mock_db, mock_settings, sync=False)

    # Verify sleep was called
    mock_sleep.assert_called_once()
    assert result == valid_token


def test_general_exception_handling(mock_db, mock_settings, mock_logger):
    # Configure mock DB to raise an exception
    mock_db.exec.side_effect = Exception('Database error')

    # Call the function
    result = get_openverse_token(mock_db, mock_settings)

    # Verify result is None and error was logged
    assert result is None
    mock_logger.warn.assert_called_with(
        'Unexpected error in get_openverse_token: Database error', exc_info=True
    )
