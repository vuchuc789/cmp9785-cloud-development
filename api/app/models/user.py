from enum import Enum

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class EmailVerificationStatus(str, Enum):
    verified = 'verified'
    verifying = 'verifying'
    none = 'none'


class User(SQLModel, table=True):
    __tablename__ = 'users'  # type: ignore
    __table_args__ = (
        UniqueConstraint('username', name='uq_users_username'),
        UniqueConstraint('email', name='uq_users_email'),
        {'extend_existing': True},
    )

    id: int | None = Field(default=None, primary_key=True)
    username: str
    email: str | None = None
    full_name: str | None = None
    hashed_password: str
    email_verification_status: EmailVerificationStatus = EmailVerificationStatus.none
    email_verification_token: str | None = None
