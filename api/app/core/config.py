from functools import lru_cache

from pydantic import AliasChoices, EmailStr, Field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str
    server_host: str
    server_port: int
    log_level: str = 'info'

    db_host: str = Field(validation_alias=AliasChoices('db_host', 'azure_postgresql_host'))
    db_port: int = Field(validation_alias=AliasChoices('db_port', 'azure_postgresql_port'))
    db_database: str = Field(
        validation_alias=AliasChoices('db_database', 'azure_postgresql_database')
    )
    db_username: str = Field(
        validation_alias=AliasChoices('db_username', 'azure_postgresql_username')
    )
    db_password: str = Field(
        validation_alias=AliasChoices('db_password', 'azure_postgresql_password')
    )
    db_pool_size: int = 10
    db_max_overflow: int = 20

    auth_token_secret_key: str  # openssl rand -hex 32
    auth_token_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30

    cors_origins: list[str] = ['*']

    sendgrid_api_key: str
    source_email: EmailStr
    frontend_url: HttpUrl

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')


@lru_cache
def get_settings():
    return Settings()  # type: ignore
