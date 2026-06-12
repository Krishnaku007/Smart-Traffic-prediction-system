from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Prediction ───────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    road_id: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM or HH:MM:SS
    temperature: float
    holiday: int = Field(ge=0, le=1)
    weekday: int = Field(ge=0, le=6)  # 0=Monday … 6=Sunday (ISO)
    weather: int = Field(ge=0, le=3)


class PredictResponse(BaseModel):
    road_id: int
    predicted_volume: float
    congestion_level: Literal["Low", "Medium", "High"]
    estimated_travel_time_min: float
    prediction_time: datetime

    model_config = {"from_attributes": True}


class PredictionOut(BaseModel):
    id: int
    road_id: int
    predicted_volume: int
    prediction_time: datetime

    model_config = {"from_attributes": True}


# ─── Traffic ─────────────────────────────────────────────────────────────────

class TrafficPoint(BaseModel):
    road_id: int
    road_name: str
    latitude: float
    longitude: float
    traffic_volume: int
    congestion_level: Literal["Low", "Medium", "High"]
    timestamp: datetime


class TrafficDataOut(BaseModel):
    id: int
    road_id: int
    traffic_volume: int
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─── Routes ───────────────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    source_road_id: int
    destination_road_id: int


class RouteResponse(BaseModel):
    shortest_distance_km: float
    fastest_time_min: float
    route_path: list[int]


# ─── Analytics ───────────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    hourly: dict[str, float]
    daily: dict[str, float]
    weekly: dict[str, float]
    monthly: dict[str, float]


# ─── Admin ────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


# ─── AI Assistant ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
