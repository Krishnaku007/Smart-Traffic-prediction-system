from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Traffic Prediction API"
    environment: str = "development"
    secret_key: str = Field(default="change_me_in_production", min_length=16)
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"

    database_url: str = "postgresql+psycopg2://traffic:traffic@postgres:5432/traffic_db"
    redis_url: str = "redis://redis:6379/0"

    cors_origins: str = "http://localhost:3000"
    weather_api_url: str = "https://api.open-meteo.com/v1/forecast"
    gemini_api_key: str = ""

    model_path: str = "ml/models/xgb_traffic_model.joblib"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
    )


settings = Settings()
