import asyncio
import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.road import Road
from app.models.traffic_data import TrafficData
from app.services.traffic_service import current_traffic_snapshot
from app.websocket.manager import connection_manager

logger = logging.getLogger(__name__)


async def stream_traffic_updates() -> None:
    """Broadcast the latest traffic snapshot to all WebSocket clients every 10 s.

    Errors are caught and logged so the stream never dies silently.
    """
    while True:
        try:
            db = SessionLocal()
            try:
                roads = db.execute(select(Road)).scalars().all()
                rows = db.execute(select(TrafficData)).scalars().all()
                payload = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "traffic": current_traffic_snapshot(roads, rows),
                }
                await connection_manager.broadcast(json.dumps(payload))
            finally:
                db.close()
        except Exception:
            logger.exception("Error in traffic stream loop; retrying in 10 s.")
        await asyncio.sleep(10)
