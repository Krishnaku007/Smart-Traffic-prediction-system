import asyncio
import json
from datetime import datetime

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.road import Road
from app.models.traffic_data import TrafficData
from app.services.traffic_service import current_traffic_snapshot
from app.websocket.manager import connection_manager


async def stream_traffic_updates():
    while True:
        db = SessionLocal()
        try:
            roads = db.execute(select(Road)).scalars().all()
            rows = db.execute(select(TrafficData)).scalars().all()
            payload = {
                "timestamp": datetime.utcnow().isoformat(),
                "traffic": current_traffic_snapshot(roads, rows),
            }
            await connection_manager.broadcast(json.dumps(payload, default=str))
        finally:
            db.close()
        await asyncio.sleep(10)
