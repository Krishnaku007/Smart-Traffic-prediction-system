from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas import PredictRequest, PredictResponse
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

    prediction = Prediction(
        road_id=payload.road_id,
        predicted_volume=int(predicted_volume),
        prediction_time=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()

    return PredictResponse(
        road_id=payload.road_id,
        predicted_volume=round(predicted_volume, 2),
        congestion_level=classify_congestion(predicted_volume),
        estimated_travel_time_min=estimate_travel_time(predicted_volume),
        prediction_time=prediction.prediction_time,
    )


@router.get("/predictions")
def list_predictions(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    items = db.query(Prediction).order_by(desc(Prediction.prediction_time)).limit(100).all()
    return items
