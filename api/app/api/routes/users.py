from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import UUID4

from app.api.dependencies import CurrentUserDep, SessionDep, SettingsDep
from app.core.security import Token, create_access_token
from app.schemas.user import (
    CreateUserData,
    CreateUserForm,
    UpdateUserData,
    UpdateUserForm,
    UserResponse,
)
from app.services.user_service import user_service

router = APIRouter()


@router.post('/register', response_model=UserResponse)
async def register_new_user(user: Annotated[CreateUserForm, Form()], session: SessionDep):
    response_user = user_service.create_user(session, user=CreateUserData(**user.model_dump()))
    return response_user


@router.post('/login')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
    settings: SettingsDep,
) -> Token:
    user = user_service.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={'sub': user.username},
        expires_delta=access_token_expires,
        secret_key=settings.auth_token_secret_key,
        algorithm=settings.auth_token_algorithm,
    )
    return Token(access_token=access_token, token_type='bearer')


@router.get('/info', response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUserDep):
    return current_user


@router.patch('/update', response_model=UserResponse)
async def update_user_info(
    user: Annotated[UpdateUserForm, Form()], current_user: CurrentUserDep, session: SessionDep
):
    user_service.update_user(
        session, user=UpdateUserData(**user.model_dump()), current_user=current_user
    )
    return current_user


@router.get('/verify-email', response_model=UserResponse)
async def verify_email(
    token: UUID4,
    session: SessionDep,
):
    user = user_service.verify_email(token=str(token), db=session)

    return user


@router.post('/verify-email', response_model=UserResponse)
async def send_verification_email(
    current_user: CurrentUserDep,
    session: SessionDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
):
    user_service.send_verification_email(
        session, settings=settings, current_user=current_user, background_tasks=background_tasks
    )

    return current_user
