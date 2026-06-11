from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


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


class PredictRequest(BaseModel):
    road_id: int
    date: str
    time: str
    temperature: float
    holiday: int = Field(ge=0, le=1)
    weekday: int = Field(ge=0, le=6)
    weather: int = Field(ge=0, le=3)


class PredictResponse(BaseModel):
    road_id: int
    predicted_volume: float
    congestion_level: Literal["Low", "Medium", "High"]
    estimated_travel_time_min: float
    prediction_time: datetime


class TrafficPoint(BaseModel):
    road_id: int
    road_name: str
    latitude: float
    longitude: float
    traffic_volume: int
    congestion_level: Literal["Low", "Medium", "High"]
    timestamp: datetime


class RouteRequest(BaseModel):
    source_road_id: int
    destination_road_id: int


class RouteResponse(BaseModel):
    shortest_distance_km: float
    fastest_time_min: float
    route_path: list[int]


class AnalyticsResponse(BaseModel):
    hourly: dict[str, float]
    daily: dict[str, float]
    weekly: dict[str, float]
    monthly: dict[str, float]


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
