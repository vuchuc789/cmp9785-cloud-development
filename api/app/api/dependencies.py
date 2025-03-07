from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.core.security import get_current_user, oauth2_scheme
from app.models.user import User

SettingsDep = Annotated[Settings, Depends(get_settings)]

# dependency to get DB sessions
SessionDep = Annotated[Session, Depends(get_session)]

# this dependency make sure that user is logged in
# it doesn't query to database to return the user info
TokenDep = Annotated[str, Depends(oauth2_scheme)]

# this dependency make sure that user is logged in
# it returns the user info in database
CurrentUserDep = Annotated[User, Depends(get_current_user)]
