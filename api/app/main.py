from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import files, media, users
from app.core.config import ServerMode, get_settings
from app.core.database import run_migrations
from app.core.stream import get_consume_thread, producer
from app.schemas.stream import Topic
from app.services.file_service import file_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()

    # Start file worker
    if settings.server_mode == ServerMode.file_worker:
        start_consuming, stop_consuming = get_consume_thread(
            [Topic.files.value], file_service.process_file
        )
        start_consuming()

    yield

    producer.flush()
    if settings.server_mode == ServerMode.file_worker:
        stop_consuming()


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
    app.include_router(media.router, prefix='/media', tags=['media'])
    app.include_router(files.router, prefix='/files', tags=['files'])

if __name__ == '__main__':
    reload = settings.env == 'dev'

    uvicorn.run(
        'app.main:app',
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level,
        reload=reload,
    )
