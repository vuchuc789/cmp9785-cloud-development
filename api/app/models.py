from sqlmodel import Field, SQLModel


class Hero(SQLModel, table=True):
    __tablename__ = "heroes"
    __table_args__ = {'extend_existing': True}

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)
    secret_name: str
