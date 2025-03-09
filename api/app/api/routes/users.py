from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import CurrentUserDep, SessionDep, SettingsDep
from app.core.security import Token, create_access_token
from app.schemas.user import CreateUserForm, UpdateUserForm, UserResponse
from app.services.user_service import user_service

router = APIRouter()


@router.post('/register', response_model=UserResponse)
async def register_new_user(user: Annotated[CreateUserForm, Form()], session: SessionDep):
    response_user = user_service.create_user(session, user=user)
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
    if user.username != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Username and token do not match',
        )

    user_service.update_user(session, user=user, current_user=current_user)
    return current_user
