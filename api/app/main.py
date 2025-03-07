from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app.api.routes import users
from app.core.config import get_settings
from app.core.database import run_migrations


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield run_migrations()


app = FastAPI(root_path='/api/v1', lifespan=lifespan)


@app.get('/')
async def root():
    return {'message': 'Hello World'}


app.include_router(users.router, prefix='/users', tags=['users'])

if __name__ == '__main__':
    settings = get_settings()
    reload = settings.env == 'dev'

    uvicorn.run(
        'app.main:app',
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level,
        reload=reload,
    )
