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
    if os.environ["ENV"] == "dev":
        uvicorn.run("main:app", port=5000, log_level="info", reload=True)
    else:
        uvicorn.run("main:app", port=5000, log_level="warning")
