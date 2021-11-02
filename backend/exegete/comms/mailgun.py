import aiohttp
from exegete.settings import settings
from exegete.api.models import UserDB
from exegete.api.redis import redis
from hashlib import sha1
import logging


logger = logging.getLogger(__name__)


async def okay_to_send(to, typ):
    key = sha1("{}:{}".format(to, typ).encode("utf8")).hexdigest()
    async with redis.pipeline(transaction=True) as pipe:
        nx, _ = await (pipe.setnx(key, "1").expire(key, 5 * 60)).execute()
    return nx


async def mailgun_send(message):
    mailgun_endpoint = (
        f"https://api.mailgun.net/v3/{settings.mailgun_sender_domain}/messages"
    )
    auth = aiohttp.BasicAuth("api", settings.mailgun_api_key)
    async with aiohttp.ClientSession() as session:
        async with session.post(mailgun_endpoint, data=message, auth=auth) as response:
            return (response.status, response.text)


async def registration_email(user: UserDB, token: str):
    # prevent against abuse by limiting the rate we email any particular address
    if not await okay_to_send(user.email, "registration"):
        logger.info("suppressed registration email to `{}'".format(user.email))
        return
    return await mailgun_send(
        {
            "from": settings.mailgun_from_email,
            "to": user.email,
            "subject": "Welcome to exegete.app",
            "text": f"""
Dear {user.name},

Welcome to exegete.app.

Please verify your email address by clicking the link below:
{settings.base_url}/#/verify/{token}

We hope you enjoy using exegete.app!
""",
        }
    )


async def forgot_password_email(user: UserDB, token: str):
    # prevent against abuse by limiting the rate we email any particular address
    if not await okay_to_send(user.email, "forgotpw"):
        logger.info("suppressed password reset email to `{}'".format(user.email))
        return
    return await mailgun_send(
        {
            "from": settings.mailgun_from_email,
            "to": user.email,
            "subject": "exegete.app: reset password",
            "text": f"""
Dear {user.first_name},

Welcome to exegete.app.

To reset your password, please click the link below:
{settings.base_url}/#/resetpassword/{token}

If you did not request a password reset, please ignore this email.
""",
        }
    )
