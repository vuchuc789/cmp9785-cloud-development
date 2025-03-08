from os import path

from alembic import command
from alembic.config import Config
from sqlmodel import Session, create_engine

from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()

db_url = f'postgresql://{settings.db_username}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_database}'
# Create the engine
print_queries = settings.env == 'dev'
engine = create_engine(
    db_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    echo=print_queries,
)


def get_session():
    with Session(engine) as session:
        yield session


def run_migrations():
    try:
        script_path = path.abspath(path.join('app', 'migrations'))
        ini_path = path.abspath(path.join('alembic.ini'))

        config = Config(ini_path)
        config.set_main_option('script_location', script_path)
        config.set_main_option('sqlalchemy.url', db_url)

        command.upgrade(config, 'head')
    except Exception as e:
        logger.error(f'Migration failed: {e}')
