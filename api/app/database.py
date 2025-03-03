from os import getenv, path
from sqlmodel import Session, create_engine
from typing import Annotated
from fastapi import Depends
from alembic.config import Config
from alembic import command

DB_HOST = getenv("AZURE_POSTGRESQL_HOST", "localhost")
DB_PORT = getenv("AZURE_POSTGRESQL_PORT", "5432")
DB_DATABASE = getenv("AZURE_POSTGRESQL_DATABASE", "postgres")
DB_USERNAME = getenv("AZURE_POSTGRESQL_USERNAME", "cmp9134")
DB_PASSWORD = getenv(
    "AZURE_POSTGRESQL_PASSWORD",
    "abcd1234")  # default password as defined in docker-compose.yml

DB_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

# Create the engine
engine = create_engine(DB_URL)


def run_migrations():
    script_path = path.abspath(path.join("app", "migrations"))
    ini_path = path.abspath(path.join("alembic.ini"))

    config = Config(ini_path)
    config.set_main_option("script_location", script_path)
    config.set_main_option("sqlalchemy.url", DB_URL)

    command.upgrade(config, "head")


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
