from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.road import Road
from app.models.traffic_data import TrafficData
from app.models.user import User
from app.services.traffic_service import current_traffic_snapshot

router = APIRouter(prefix="/api", tags=["traffic"])


@router.get("/traffic")
def get_traffic(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    roads = db.query(Road).all()
    rows = db.query(TrafficData).all()
    return current_traffic_snapshot(roads, rows)
