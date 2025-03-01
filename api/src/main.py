import os
import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

app = FastAPI()


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
