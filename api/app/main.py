from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import media, users
from app.core.config import get_settings
from app.core.database import run_migrations

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield run_migrations()


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
    return {'message': 'Hello World'}


app.include_router(users.router, prefix='/users', tags=['users'])
app.include_router(media.router, prefix='/media', tags=['media'])

if __name__ == '__main__':
    reload = settings.env == 'dev'

    uvicorn.run(
        'app.main:app',
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level,
        reload=reload,
    )
