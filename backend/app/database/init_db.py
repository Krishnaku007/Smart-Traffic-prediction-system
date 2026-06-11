from datetime import datetime, timedelta

from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models.road import Road
from app.models.traffic_data import TrafficData
from app.models.user import User
from app.security import hash_password


def seed_data() -> None:
    db = SessionLocal()
    try:
        if not db.query(User).first():
            db.add(
                User(
                    name="Admin",
                    email="admin@traffic.local",
                    password=hash_password("Admin@12345"),
                    role="admin",
                )
            )

        if not db.query(Road).first():
            roads = [
                Road(road_id=1, road_name="Main St", latitude=12.9716, longitude=77.5946),
                Road(road_id=2, road_name="Ring Rd", latitude=12.9616, longitude=77.6046),
                Road(road_id=3, road_name="Airport Rd", latitude=12.9999, longitude=77.7066),
                Road(road_id=4, road_name="Market Rd", latitude=12.9316, longitude=77.5846),
                Road(road_id=5, road_name="Lake Rd", latitude=12.9416, longitude=77.6246),
                Road(road_id=6, road_name="Tech Park Rd", latitude=12.9516, longitude=77.6546),
            ]
            db.add_all(roads)

        if not db.query(TrafficData).first():
            now = datetime.utcnow()
            rows = []
            for i in range(1, 7):
                for h in range(0, 48):
                    ts = now - timedelta(hours=h)
                    volume = 80 + (i * 12) + (ts.hour * 3)
                    rows.append(
                        TrafficData(road_id=i, traffic_volume=volume, timestamp=ts)
                    )
            db.add_all(rows)

        db.commit()
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_data()
