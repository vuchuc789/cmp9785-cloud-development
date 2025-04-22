from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Email, Mail, To

from app.core.logging import logger


def send_email_with_sendgrid(
    api_key: str, from_email: str, to_emails: list[str], subject: str, content: str
):
    try:
        message = Mail(
            from_email=Email(from_email),
            to_emails=list(map(lambda email: To(email), to_emails)),
            subject=subject,
            html_content=content,
        )

        sg = SendGridAPIClient(api_key)
        sg.send(message)

        logger.info(f'Email to {", ".join(to_emails)} has been sent successfully')
    except Exception as e:
        logger.error(e)
        logger.warn(f'Email to {", ".join(to_emails)} was unable to send')
