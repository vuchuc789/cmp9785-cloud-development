from typing import Self

from pydantic import BaseModel, EmailStr, Field, model_validator


class User(BaseModel):
    username: str = Field(min_length=6, max_length=50)
    email: EmailStr | None = None
    full_name: str | None = None


class CreateUserData(User):
    password: str = Field(min_length=6, max_length=50)


class CreateUserForm(CreateUserData):
    password_repeat: str = Field(min_length=6, max_length=50)

    @model_validator(mode='after')
    def check_password_matchs(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError('Passwords do not match')
        return self


class UserResponse(User):
    pass
