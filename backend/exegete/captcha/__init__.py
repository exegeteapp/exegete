import aiohttp
from exegete.settings import settings


async def recaptcha_check(recaptcha_token: str):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": settings.recaptcha_secret_key, "response": recaptcha_token},
        ) as response:
            return await response.json()
