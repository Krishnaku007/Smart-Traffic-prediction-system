import asyncio

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api import admin, analytics, assistant, auth, predict, routes, traffic
from app.config import settings
from app.database.init_db import init_db
from app.websocket.manager import connection_manager
from app.websocket.traffic_stream import stream_traffic_updates

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title=settings.app_name)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(analytics.router)
app.include_router(traffic.router)
app.include_router(routes.router)
app.include_router(admin.router)
app.include_router(assistant.router)


@app.on_event("startup")
async def startup_event():
    init_db()
    asyncio.create_task(stream_traffic_updates())


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


@app.websocket("/ws/traffic")
async def websocket_traffic(ws: WebSocket):
    await connection_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except Exception:
        connection_manager.disconnect(ws)
