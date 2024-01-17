import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine
from pydantic import PostgresDsn, EmailStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    pg_dsn: PostgresDsn = "postgres+psycopg2://user:pass@localhost:5432/exegete"
    pg_async_dsn: PostgresDsn = "postgres+asyncpg://user:pass@localhost:5432/exegete"
    mailgun_api_key: str
    mailgun_sender_domain: str
    mailgun_from_email: EmailStr
    token_secret: str
    recaptcha_site_key: str
    recaptcha_secret_key: str
    redis_location: str
    base_url: str

    def create_sync_engine(self, **kwargs):
        return sqlalchemy.create_engine(
            str(self.pg_dsn),
            future=True,
            **kwargs,
        )

    def create_async_engine(self, **kwargs):
        return create_async_engine(
            str(self.pg_async_dsn),
            future=True,
            **kwargs,
        )


settings = Settings()
