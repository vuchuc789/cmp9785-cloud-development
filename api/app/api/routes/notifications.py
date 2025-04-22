from fastapi import APIRouter, WebSocket

from app.api.dependencies import CurrentWebSocketUserDep
from app.services.notification_service import notification_service

router = APIRouter()


@router.websocket('/ws')
async def notification_endpoint(
    websocket: WebSocket,
    current_user: CurrentWebSocketUserDep,
):
    await notification_service.push_notifications(
        websocket=websocket,
        user=current_user,
    )
