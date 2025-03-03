import os
import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI
from contextlib import asynccontextmanager

from database import run_migrations

from routers import heroes

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(heroes.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    HOST = os.environ.get("SERVER_HOST", "127.0.0.1")
    PORT = int(os.environ.get("SERVER_PORT", "5000"))
    RELOAD = os.environ.get("ENV") == "dev"

    uvicorn.run("main:app",
                host=HOST,
                port=PORT,
                reload=RELOAD,
                log_level="info")
