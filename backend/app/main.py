import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api import admin, analytics, assistant, auth, predict, routes, traffic
from app.config import settings
from app.database.init_db import init_db
from app.websocket.manager import connection_manager
from app.websocket.traffic_stream import stream_traffic_updates

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown logic."""
    logger.info("Starting up Smart Traffic API…")
    try:
        init_db()
        logger.info("Database initialised and seeded.")
    except Exception:
        logger.exception("Database initialisation failed.")
    task = asyncio.create_task(stream_traffic_updates())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    logger.info("Shutting down Smart Traffic API.")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Real-time traffic monitoring, ML prediction, route optimisation, and AI insights.",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


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


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": settings.app_name, "version": "1.0.0"}


@app.websocket("/ws/traffic")
async def websocket_traffic(ws: WebSocket):
    await connection_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except Exception:
        connection_manager.disconnect(ws)
