from datetime import datetime

import numpy as np

from app.ml.model_loader import model_registry


def classify_congestion(volume: float) -> str:
    if volume < 100:
        return "Low"
    if volume < 250:
        return "Medium"
    return "High"


def estimate_travel_time(volume: float) -> float:
    base_time = 12.0
    penalty = min(volume / 40.0, 35.0)
    return round(base_time + penalty, 2)


def build_features(
    date: str,
    time: str,
    temperature: float,
    holiday: int,
    weekday: int,
    weather: int,
) -> np.ndarray:
    dt = datetime.fromisoformat(f"{date}T{time}")
    is_weekend = 1 if weekday >= 5 else 0
    rush_hour = 1 if dt.hour in {7, 8, 9, 17, 18, 19} else 0
    return np.array(
        [
            dt.hour,
            dt.day,
            dt.month,
            dt.year,
            temperature,
            holiday,
            weekday,
            weather,
            is_weekend,
            rush_hour,
        ]
    ).reshape(1, -1)


def predict_volume(features: np.ndarray) -> float:
    model = model_registry.get_model()
    prediction = model.predict(features)[0]
    return float(max(prediction, 0.0))
