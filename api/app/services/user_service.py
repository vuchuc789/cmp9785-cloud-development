import uuid
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, not_, select
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from app.core.config import Settings
from app.core.security import get_password_hash, verify_password
from app.models.user import AuthSession, EmailVerificationStatus, User
from app.schemas.user import CreateUserData, UpdateUserData
from app.utils.mail import send_email_with_sendgrid


class UserService:
    def get_user(self, db: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        results = db.exec(statement)

        return results.first()

    def get_user_with_auth_session(
        self, db: Session, username: str, auth_session_id: uuid.UUID
    ) -> tuple[User, AuthSession] | None:
        statement = (
            select(User, AuthSession)
            .join(AuthSession)
            .where(
                User.username == username,
                AuthSession.id == auth_session_id,
                AuthSession.expires_date > datetime.now(UTC),
                not_(AuthSession.is_ended),
            )
        )
        results = db.exec(statement)

        return results.first()

    def authenticate_user(self, db: Session, username: str, password: str) -> User | None:
        user = self.get_user(db, username)

        if user is None:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def create_user(self, db: Session, user: CreateUserData):
        db_user = User(
            **vars(user),
            hashed_password=get_password_hash(user.password),
        )
        db.add(db_user)
        try:
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError as err:
            db.rollback()

            err_msg = str(err.orig)

            if 'username' in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail='Username is already taken'
                ) from err

            if 'email' in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail='Email is already registered'
                ) from err

    def update_user(self, db: Session, user: UpdateUserData, current_user: User):
        if user.username != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Username and token do not match',
            )

        if user.password is not None:
            current_user.hashed_password = get_password_hash(user.password)
            current_user.password_reset_token = None

        if user.full_name is not None:
            current_user.full_name = user.full_name

        if user.email is not None and user.email != current_user.email:
            current_user.email = user.email
            current_user.email_verification_token = None
            current_user.email_verification_status = EmailVerificationStatus.none

        if user.email_verification_token is not None:
            current_user.email_verification_token = user.email_verification_token

        if user.email_verification_status != EmailVerificationStatus.none:
            current_user.email_verification_status = user.email_verification_status

        if user.password_reset_token is not None:
            current_user.password_reset_token = user.password_reset_token

        db.add(current_user)
        try:
            db.commit()
            db.refresh(current_user)
        except IntegrityError as err:
            db.rollback()

            err_msg = str(err.orig)

            if 'email' in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail='Email is already registered'
                ) from err

    def send_verification_email(
        self, db: Session, settings: Settings, current_user: User, background_tasks: BackgroundTasks
    ):
        if current_user.email is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='User has no email')

        if current_user.email_verification_status == EmailVerificationStatus.verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='User has already been verified'
            )

        if current_user.email_verification_token is None:
            user_to_update = UpdateUserData(username=current_user.username)

            user_to_update.email_verification_token = str(uuid4())
            user_to_update.email_verification_status = EmailVerificationStatus.verifying

            self.update_user(db, user=user_to_update, current_user=current_user)

        verify_link = (
            f'{settings.frontend_url}verify-email?token={current_user.email_verification_token}'
        )
        content = f'<p>Verify your email by clicking this <a href="{verify_link}">link</a>.</p>'

        background_tasks.add_task(
            send_email_with_sendgrid,
            api_key=settings.sendgrid_api_key,
            from_email=settings.source_email,
            to_emails=[current_user.email],
            subject='Verify your email',
            content=content,
        )

    def verify_email(self, token: str, db: Session):
        statement = select(User).where(User.email_verification_token == token)
        results = db.exec(statement)
        user = results.first()

        if user is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Token not found')

        if user.email_verification_status == EmailVerificationStatus.none:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='Email has been updated'
            )

        if user.email_verification_status == EmailVerificationStatus.verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='User is already verified'
            )

        user_to_update = UpdateUserData(username=user.username)
        user_to_update.email_verification_status = EmailVerificationStatus.verified

        self.update_user(db, user=user_to_update, current_user=user)

        return user

    def send_reset_password_email(
        self, db: Session, settings: Settings, email: str, background_tasks: BackgroundTasks
    ):
        statement = select(User).where(User.email == email)
        results = db.exec(statement)
        user = results.first()

        if user is None or user.email_verification_status != EmailVerificationStatus.verified:
            # no error returned as this action is run on unauthenticated users
            return

        user_to_update = UpdateUserData(username=user.username)
        user_to_update.password_reset_token = str(uuid4())
        self.update_user(db, user=user_to_update, current_user=user)

        verify_link = f'{settings.frontend_url}reset-password?token={user.password_reset_token}'
        content = f'<p>Click this <a href="{verify_link}">link</a> to reset password for user <b>{user.username}</b>.</p>'  # noqa: E501

        background_tasks.add_task(
            send_email_with_sendgrid,
            api_key=settings.sendgrid_api_key,
            from_email=settings.source_email,
            to_emails=[user.email],
            subject='Reset your password',
            content=content,
        )

    def reset_password(self, token: str, password: str, db: Session):
        statement = select(User).where(User.password_reset_token == token)
        results = db.exec(statement)
        user = results.first()

        if user is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Token not found')

        user_to_update = UpdateUserData(username=user.username, password=password)
        self.update_user(db, user=user_to_update, current_user=user)

        return user

    def create_session(self, user: User, expires_date: datetime, db: Session):
        try:
            token_version = uuid4()
            auth_session = AuthSession(
                expires_date=expires_date,
                token_version=token_version,
                user=user,
            )

            db.add(auth_session)
            db.commit()
            db.refresh(auth_session)

            return auth_session
        except Exception as err:
            raise HTTPException(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to create session'
            ) from err

    def update_session(
        self,
        auth_session: AuthSession,
        db: Session,
        expires_date: datetime | None = None,
        is_ended: bool = False,
    ):
        try:
            if expires_date is None:
                expires_date = datetime.now(UTC)

            if is_ended:
                auth_session.is_ended = True
            else:
                token_version = str(uuid4())
                auth_session.expires_date = expires_date
                auth_session.token_version = token_version

            db.add(auth_session)
            db.commit()
            db.refresh(auth_session)
        except Exception as err:
            raise HTTPException(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to update session'
            ) from err


user_service = UserService()
