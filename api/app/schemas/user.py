from typing import Any, Self

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.user import EmailVerificationStatus
from app.utils.model import convert_empty_str_to_none


class User(BaseModel):
    username: str = Field(min_length=6, max_length=50)
    email: EmailStr | None = None
    full_name: str | None = None

    @model_validator(mode='before')
    @classmethod
    def handle_empty_str(cls, data: Any) -> Any:
        return convert_empty_str_to_none(data)


class CreateUserData(User):
    password: str = Field(min_length=6, max_length=50)


class CreateUserForm(User):
    password: str = Field(min_length=6, max_length=50)
    password_repeat: str = Field(min_length=6, max_length=50)

    @model_validator(mode='after')
    def check_password_matchs(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError('Passwords do not match')
        return self


class UpdateUserData(User):
    password: str | None = Field(default=None, min_length=6, max_length=50)
    email_verification_token: str | None = None
    email_verification_status: EmailVerificationStatus = EmailVerificationStatus.none
    password_reset_token: str | None = None


class UpdateUserForm(User):
    password: str | None = Field(default=None, min_length=6, max_length=50)
    password_repeat: str | None = Field(default=None, min_length=6, max_length=50)

    @model_validator(mode='after')
    def check_password_matchs(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError('Passwords do not match')
        return self


class UserResponse(User):
    email_verification_status: EmailVerificationStatus


class EmailRequest(BaseModel):
    email: EmailStr


class PasswordResetForm(BaseModel):
    password: str = Field(min_length=6, max_length=50)
    password_repeat: str = Field(min_length=6, max_length=50)

    @model_validator(mode='after')
    def check_password_matchs(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError('Passwords do not match')
        return self
