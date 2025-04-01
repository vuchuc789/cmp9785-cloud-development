from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Form,
    HTTPException,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import UUID4

from app.api.dependencies import (
    CurrentRefreshTokenUserDep,
    CurrentUserDep,
    SessionDep,
    SettingsDep,
    get_current_user,
)
from app.core.config import Settings
from app.core.security import Token, create_jwt_token
from app.models.user import AuthSession, User
from app.schemas.user import (
    CreateUserData,
    CreateUserForm,
    EmailRequest,
    PasswordResetForm,
    UpdateUserData,
    UpdateUserForm,
    UserResponse,
)
from app.services.user_service import user_service

router = APIRouter()


def generate_tokens(user: User, auth_session: AuthSession, settings: Settings, now: datetime):
    """Generates both access and refresh tokens."""
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_jwt_token(
        data={
            'sub': user.username,
            'session_id': str(auth_session.id),
        },
        issued_at=now,
        expires_time=now + access_token_expires,
        secret_key=settings.auth_token_secret_key,
        algorithm=settings.auth_token_algorithm,
    )

    refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
    refresh_token = create_jwt_token(
        data={
            'sub': user.username,
            'session_id': str(auth_session.id),
            'token_version': str(auth_session.token_version),
        },
        issued_at=now,
        secret_key=settings.auth_token_secret_key,
        algorithm=settings.auth_token_algorithm,
    )

    return access_token, refresh_token, now + refresh_token_expires


def set_refresh_token_cookie(response: Response, refresh_token: str, expires_at: datetime):
    """Sets the refresh token as a secure HTTP-only cookie."""
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,  # Prevents JS access
        samesite='None',  # Required for cross-origin
        secure=True,  # Required for HTTPS
        expires=expires_at,
    )


@router.post('/register', response_model=UserResponse)
async def register_new_user(user: Annotated[CreateUserForm, Form()], session: SessionDep):
    response_user = user_service.create_user(session, user=CreateUserData(**user.model_dump()))
    return response_user


@router.post('/login')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
    settings: SettingsDep,
    response: Response,
) -> Token:
    user = user_service.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    now = datetime.now(UTC)

    refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
    auth_session = user_service.create_session(
        user=user, expires_date=now + refresh_token_expires, db=session
    )

    access_token, refresh_token, refresh_expires_at = generate_tokens(
        user, auth_session, settings, now
    )
    set_refresh_token_cookie(response, refresh_token, refresh_expires_at)

    return Token(access_token=access_token, token_type='bearer')


@router.post('/refresh')
def refresh_access_token(
    user_auth_session: CurrentRefreshTokenUserDep,
    response: Response,
    settings: SettingsDep,
    session: SessionDep,
) -> Token:
    user = user_auth_session[0]
    auth_session = user_auth_session[1]

    now = datetime.now(UTC)

    refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
    user_service.update_session(auth_session, expires_date=now + refresh_token_expires, db=session)

    access_token, refresh_token, refresh_expires_at = generate_tokens(
        user, auth_session, settings, now
    )
    set_refresh_token_cookie(response, refresh_token, refresh_expires_at)

    return Token(access_token=access_token, token_type='bearer')


@router.delete('/logout')
def logout(
    user_auth_session: Annotated[tuple[User, AuthSession], Depends(get_current_user)],
    session: SessionDep,
    response: Response,
):
    auth_session = user_auth_session[1]

    user_service.update_session(auth_session, is_ended=True, db=session)

    response.delete_cookie(
        key='refresh_token',
        httponly=True,
        samesite='None',
        secure=True,
    )

    return {'detail': 'Logged out'}


@router.get('/info', response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUserDep):
    return current_user


@router.patch('/update', response_model=UserResponse)
async def update_user_info(
    user: Annotated[UpdateUserForm, Form()],
    current_user: CurrentUserDep,
    session: SessionDep,
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
        session,
        settings=settings,
        current_user=current_user,
        background_tasks=background_tasks,
    )

    return current_user


@router.post('/reset-password')
async def send_reset_password_email(
    body: EmailRequest,
    session: SessionDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
):
    user_service.send_reset_password_email(
        email=body.email,
        db=session,
        settings=settings,
        background_tasks=background_tasks,
    )

    return {'detail': 'If your email is found and verified, an reset password email will be sent'}


@router.patch('/reset-password', response_model=UserResponse)
async def reset_passwosd(
    token: UUID4,
    form_data: Annotated[PasswordResetForm, Form()],
    session: SessionDep,
):
    user = user_service.reset_password(token=str(token), password=form_data.password, db=session)

    return user
