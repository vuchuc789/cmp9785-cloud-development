import asyncio

import redis.asyncio as redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

from app.api.dependencies import CurrentWebSocketUserDep
from app.core.logging import logger

router = APIRouter()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var ws = new WebSocket("ws://localhost:8000/notifications/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2dWNodWM3ODkiLCJzZXNzaW9uX2lkIjoiN2QyMDUwN2UtNDdjZi00ZWFmLWI5ZjYtNGYyZGQzYWUwMGM4IiwianRpIjoiNTU1MWMwNTktMGE4OC00ZTlmLTkyMDYtOTUwNjhhYzYzMWFiIiwiaWF0IjoxNzQ1MTY0NjQxLCJleHAiOjE3NDUxNjY0NDF9.z-iNeOqlEzrtjN_JmUr1p_7ZT1mWC2YZcX43FBo7WWU");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@router.get('/html')
async def get():
    return HTMLResponse(html)


@router.websocket('/ws')
async def notification_endpoint(
    websocket: WebSocket,
    current_user: CurrentWebSocketUserDep,
):
    async def handler(msg):
        await websocket.send_text(msg['data'])

    await websocket.accept()
    logger.debug(f'"{current_user.full_name or "An user"}" has joined')

    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    p = r.pubsub()

    await p.subscribe(**{f'noti:{current_user.id}': handler})
    task = asyncio.create_task(p.run())

    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f'User sent: {data}')
    except WebSocketDisconnect:
        logger.debug(f'"{current_user.full_name or "An user"}" has left')
    finally:
        task.cancel()
        await p.unsubscribe(str(current_user.id))
        await p.close()
