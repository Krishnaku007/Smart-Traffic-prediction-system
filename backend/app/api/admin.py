from datetime import datetime

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database.session import get_db
from app.models.prediction import Prediction
from app.models.traffic_data import TrafficData
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(content))
    required_cols = {"road_id", "traffic_volume", "timestamp"}
    if not required_cols.issubset(set(df.columns)):
        raise HTTPException(status_code=400, detail="Invalid dataset schema")

    for _, row in df.iterrows():
        db.add(
            TrafficData(
                road_id=int(row["road_id"]),
                traffic_volume=int(row["traffic_volume"]),
                timestamp=datetime.fromisoformat(str(row["timestamp"])),
            )
        )
    db.commit()
    return {"message": "Dataset uploaded", "rows": len(df)}


@router.get("/predictions")
def monitor_predictions(
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    rows = (
        db.query(Prediction)
        .order_by(Prediction.prediction_time.desc())
        .limit(200)
        .all()
    )
    return rows


@router.get("/users")
def manage_users(
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    users = db.query(User).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role}
        for u in users
    ]


@router.get("/traffic-logs")
def traffic_logs(
    db: Session = Depends(get_db),
    _user: User = Depends(require_admin),
):
    rows = db.query(TrafficData).order_by(TrafficData.timestamp.desc()).limit(500).all()
    return rows
