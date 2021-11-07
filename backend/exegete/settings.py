import sqlalchemy
from pydantic import (
    BaseSettings,
    PostgresDsn,
    EmailStr,
)


class Settings(BaseSettings):
    pg_dsn: PostgresDsn = "postgres://user:pass@localhost:5432/exegete"
    mailgun_api_key: str
    mailgun_sender_domain: str
    mailgun_from_email: EmailStr
    token_secret: str
    recaptcha_site_key: str
    recaptcha_secret_key: str
    redis_location: str
    base_url: str

    def create_engine(self, **kwargs):
        return sqlalchemy.create_engine(
            self.pg_dsn,
            future=True,
            **kwargs,
        )


settings = Settings()
