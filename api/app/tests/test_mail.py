from unittest.mock import MagicMock

import pytest

from app.utils.mail import send_email_with_sendgrid


@pytest.fixture
def mock_sendgrid_client(mocker):
    """Fixture to mock SendGridAPIClient"""
    mock_client = mocker.patch('app.utils.mail.SendGridAPIClient')
    mock_instance = MagicMock()
    mock_client.return_value = mock_instance
    return mock_instance


@pytest.fixture
def mock_logger(mocker):
    """Fixture to mock the logger"""
    return mocker.patch('app.utils.mail.logger')


def test_send_email_success(mock_sendgrid_client, mock_logger):
    send_email_with_sendgrid(
        api_key='fake_api_key',
        from_email='test@example.com',
        to_emails=['recipient@example.com'],
        subject='Test Email',
        content='<p>Hello, World!</p>',
    )

    # Verify that send() was called once
    mock_sendgrid_client.send.assert_called_once()

    # Verify successful log message
    mock_logger.info.assert_called_with('Email to recipient@example.com has been sent successfully')


def test_send_email_failure(mock_sendgrid_client, mock_logger):
    # Simulate an error when sending an email
    mock_sendgrid_client.send.side_effect = Exception('SendGrid error')

    send_email_with_sendgrid(
        api_key='fake_api_key',
        from_email='test@example.com',
        to_emails=['recipient@example.com'],
        subject='Test Email',
        content='<p>Hello, World!</p>',
    )

    # Verify that send() was called once
    mock_sendgrid_client.send.assert_called_once()

    # Verify failure log message
    mock_logger.warn.assert_called_with('Email to recipient@example.com was unable to send')
