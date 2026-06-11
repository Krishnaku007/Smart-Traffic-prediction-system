import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

from app.ml.preprocess import clean_data, feature_engineering

FEATURES = [
    "hour",
    "day",
    "month",
    "year",
    "temperature",
    "holiday",
    "weekday",
    "weather",
    "is_weekend",
    "rush_hour",
]
TARGET = "traffic_volume"


def train_models(input_csv: str, model_output: str, metrics_output: str):
    df = pd.read_csv(input_csv)
    df = feature_engineering(clean_data(df))

    x = df[FEATURES]
    y = df[TARGET]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    baseline = RandomForestRegressor(n_estimators=200, random_state=42)
    baseline.fit(x_train, y_train)

    model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
    )
    model.fit(x_train, y_train)

    preds = model.predict(x_test)
    metrics = {
        "mae": round(float(mean_absolute_error(y_test, preds)), 4),
        "rmse": round(float(mean_squared_error(y_test, preds) ** 0.5), 4),
        "r2": round(float(r2_score(y_test, preds)), 4),
    }

    Path(model_output).parent.mkdir(parents=True, exist_ok=True)
    Path(metrics_output).parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, model_output)
    Path(metrics_output).write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    return metrics


if __name__ == "__main__":
    m = train_models(
        input_csv="ml/training/traffic_dataset.csv",
        model_output="ml/models/xgb_traffic_model.joblib",
        metrics_output="ml/models/model_metrics.json",
    )
    print(m)
