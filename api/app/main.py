from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import files, notifications, users
from app.core.cache import close_clients
from app.core.config import ServerMode, get_settings
from app.core.database import run_migrations
from app.core.stream import flush_producer, get_consume_thread
from app.schemas.stream import Topic
from app.services.file_service import file_service
from app.services.notification_service import notification_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    # Start worker
    match settings.server_mode:
        case ServerMode.file_worker:
            start_consuming, stop_consuming = get_consume_thread(
                [Topic.files.value], file_service.process_file
            )
            start_consuming()
        case ServerMode.notification_worker:
            start_consuming, stop_consuming = get_consume_thread(
                [Topic.notifications.value], notification_service.route_notifications
            )
            start_consuming()

    yield

    # Flush all pending Kafka messages
    flush_producer()

    # Stop worker
    if settings.server_mode in [ServerMode.file_worker, ServerMode.notification_worker]:
        stop_consuming()

    # Close all Redis clients
    await close_clients()


app = FastAPI(root_path='/api/v1', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
async def root():
    return {'message': "I'm healthy!!"}


# Enable API endpoints only on api servers
if settings.server_mode == ServerMode.api_server:
    app.include_router(users.router, prefix='/users', tags=['users'])
    app.include_router(files.router, prefix='/files', tags=['files'])
    app.include_router(notifications.router, prefix='/notifications', tags=['notifications'])

if __name__ == '__main__':
    reload = settings.env == 'dev'

    uvicorn.run(
        'app.main:app',
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level,
        reload=reload,
    )
