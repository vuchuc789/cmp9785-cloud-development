import redis as redis_sync
import redis.asyncio as redis

from app.core.config import get_settings

settings = get_settings()

sync_client: redis_sync.Redis | None = None
client: redis.Redis | None = None


def get_sync_client():
    global sync_client
    if sync_client is None:
        sync_client = redis_sync.Redis(
            host=settings.redis_host, port=settings.redis_port, decode_responses=True
        )
    return sync_client


def get_client():
    global client
    if client is None:
        client = redis.Redis(
            host=settings.redis_host, port=settings.redis_port, decode_responses=True
        )
    return client


async def close_clients():
    if sync_client is not None:
        sync_client.close()
    if client is not None:
        await client.aclose()
