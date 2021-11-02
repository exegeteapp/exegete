import aioredis
from exegete.settings import settings

redis = aioredis.from_url(settings.redis_location)
