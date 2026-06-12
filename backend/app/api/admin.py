import logging
from datetime import datetime
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database.session import get_db
from app.models.prediction import Prediction
from app.models.traffic_data import TrafficData
from app.models.user import User
from app.schemas import PredictionOut, TrafficDataOut, UserOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    if not (file.filename or "").endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}") from exc

    required_cols = {"road_id", "traffic_volume", "timestamp"}
    if not required_cols.issubset(set(df.columns)):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {required_cols}. Got: {set(df.columns)}",
        )

    rows = []
    for _, row in df.iterrows():
        try:
            rows.append(
                TrafficData(
                    road_id=int(row["road_id"]),
                    traffic_volume=int(row["traffic_volume"]),
                    timestamp=datetime.fromisoformat(str(row["timestamp"])),
                )
            )
        except (ValueError, KeyError) as exc:
            raise HTTPException(status_code=400, detail=f"Invalid row data: {exc}") from exc

    db.add_all(rows)
    db.commit()
    logger.info("Admin uploaded dataset with %d rows.", len(df))
    return {"message": "Dataset uploaded successfully", "rows_imported": len(df)}


@router.get("/predictions", response_model=list[PredictionOut])
def monitor_predictions(
    limit: int = 200,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return (
        db.query(Prediction)
        .order_by(Prediction.prediction_time.desc())
        .limit(limit)
        .all()
    )


@router.get("/users", response_model=list[UserOut])
def manage_users(
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return db.query(User).all()


@router.get("/traffic-logs", response_model=list[TrafficDataOut])
def traffic_logs(
    limit: int = 500,
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    return (
        db.query(TrafficData)
        .order_by(TrafficData.timestamp.desc())
        .limit(limit)
        .all()
    )
