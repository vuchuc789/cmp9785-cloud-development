import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


class EmailVerificationStatus(str, Enum):
    verified = 'verified'
    verifying = 'verifying'
    none = 'none'


class FileProcessingStatus(str, Enum):
    pending = 'pending'
    processing = 'processing'
    success = 'success'
    failed = 'failed'
    cancelled = 'cancelled'
    unknown = 'unknown'


class User(SQLModel, table=True):
    __tablename__ = 'users'
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
    password_reset_token: str | None = None

    auth_sessions: list['AuthSession'] = Relationship(back_populates='user')
    media_histories: list['MediaHistory'] = Relationship(back_populates='user')
    files: list['File'] = Relationship(back_populates='user')


class AuthSession(SQLModel, table=True):
    __tablename__ = 'auth_sessions'
    __table_args__ = {'extend_existing': True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    expires_date: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))
    token_version: uuid.UUID
    is_ended: bool = Field(default=False)

    user_id: int | None = Field(default=None, foreign_key='users.id')
    user: User | None = Relationship(back_populates='auth_sessions')


class MediaHistory(SQLModel, table=True):
    __tablename__ = 'media_histories'
    __table_args__ = {'extend_existing': True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    keyword: str
    timestamp: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))

    user_id: int | None = Field(default=None, foreign_key='users.id')
    user: User | None = Relationship(back_populates='media_histories')


class File(SQLModel, table=True):
    __tablename__ = 'files'
    __table_args__ = ({'extend_existing': True},)

    id: int | None = Field(default=None, primary_key=True)
    filename: str
    status: FileProcessingStatus = FileProcessingStatus.unknown
    size: int
    type: str
    url: str
    created_at: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))
    active_file_description_id: int | None = Field(default=None)
    object_path: str

    user_id: int | None = Field(default=None, foreign_key='users.id')
    user: User | None = Relationship(back_populates='files')

    file_descriptions: list['FileDescription'] = Relationship(
        back_populates='file', cascade_delete=True
    )


class FileDescription(SQLModel, table=True):
    __tablename__ = 'file_descriptions'
    __table_args__ = ({'extend_existing': True},)

    id: int | None = Field(default=None, primary_key=True)
    description: str
    created_at: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))

    file_id: int | None = Field(default=None, foreign_key='files.id', ondelete='CASCADE')
    file: File | None = Relationship(back_populates='file_descriptions')
