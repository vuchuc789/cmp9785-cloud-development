# AI-Powered Content Description App

[![Deploy Api](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/build-api.yml/badge.svg)](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/build-api.yml)
[![Deploy App](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/build-app.yml/badge.svg)](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/build-app.yml)
[![Provision Resources](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/provision-resources.yml/badge.svg)](https://github.com/vuchuc789/cmp9785-cloud-development/actions/workflows/provision-resources.yml)

> `Provision Resources` might fail because I disabled it to save money. Want to see it live? Just ask and I’ll fire it up!

## System Architecture

![system architecture](system-architecture.svg)

This project is to build a website that describes files using the Gemini API. It might be like bringing a tank to a knife fight when implementing the most modern and up-to-date stuff like microservices, orchestration, IaC, and blah blah... into the game. But I just like it and never regret it.

## Development

Here are steps that you can follow to run this project in your local machine:

### Environment Variables

Walk through the two .env.example files in the `/api` and `/app` directories. Create your own API keys (e.g., Gemini API Key, SendGrid API Key) as needed. Then, copy each `.env.example` file to a `.env` file in the same directory, and fill them in with the keys and credentials you’ve created.

### Front-End

```
cd app/
npm install
npm run dev
```

### Back-End

You may need 3 separate terminals for this back-end.

```
python -m venv .venv
source .venv/bin/activate
cd api/

# run components for local development
docker compose up -d

pip install -r requirements.txt

# run this command for the main api server
python -m app.main

# or this command for file worker
SERVER_PORT=8001 SERVER_MODE=file-worker python -m app.main

# or this command for notification worker
SERVER_PORT=8002 SERVER_MODE=notification-worker python -m app.main
```

## License

MIT License
