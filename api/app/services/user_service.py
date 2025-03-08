from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import CreateUserData


class UserService:
    def get_user(self, db: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
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
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail='An integrity error occurred'
                ) from err


user_service = UserService()
