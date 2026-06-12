from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas import PredictRequest, PredictResponse, PredictionOut
from app.services.prediction_service import (
    build_features,
    classify_congestion,
    estimate_travel_time,
    predict_volume,
)

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictResponse)
def predict(
    payload: PredictRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    features = build_features(
        payload.date,
        payload.time,
        payload.temperature,
        payload.holiday,
        payload.weekday,
        payload.weather,
    )
    predicted_volume = predict_volume(features)
    now = datetime.now(timezone.utc)

    prediction = Prediction(
        road_id=payload.road_id,
        predicted_volume=int(predicted_volume),
        prediction_time=now,
    )
    db.add(prediction)
    db.commit()

    return PredictResponse(
        road_id=payload.road_id,
        predicted_volume=round(predicted_volume, 2),
        congestion_level=classify_congestion(predicted_volume),
        estimated_travel_time_min=estimate_travel_time(predicted_volume),
        prediction_time=now,
    )


@router.get("/predictions", response_model=list[PredictionOut])
def list_predictions(
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return (
        db.query(Prediction)
        .order_by(desc(Prediction.prediction_time))
        .limit(limit)
        .all()
    )
