from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class OpenverseToken(SQLModel, table=True):
    __tablename__ = 'openverse_tokens'
    __table_args__ = ({'extend_existing': True},)

    id: int | None = Field(default=None, primary_key=True)
    access_token: str
    expires_in: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))
