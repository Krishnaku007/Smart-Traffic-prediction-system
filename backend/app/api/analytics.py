from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.traffic_data import TrafficData
from app.models.user import User
from app.schemas import AnalyticsResponse
from app.services.analytics_service import build_analytics

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    rows = db.query(TrafficData).all()
    return build_analytics(rows)
