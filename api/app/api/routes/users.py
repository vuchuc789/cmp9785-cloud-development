from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import CurrentUserDep, SettingsDep
from app.core.security import (
    Token,
    authenticate_user,
    create_access_token,
    fake_users_db,
)
from app.schemas.user import User

router = APIRouter()


@router.post('/login')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    settings: SettingsDep,
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
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
    )
    return Token(access_token=access_token, token_type='bearer')


@router.get('/info', response_model=User)
async def get_current_user_info(current_user: CurrentUserDep):
    return current_user
