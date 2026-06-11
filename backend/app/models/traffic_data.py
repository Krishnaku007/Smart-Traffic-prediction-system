from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class TrafficData(Base):
    __tablename__ = "traffic_data"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    road_id: Mapped[int] = mapped_column(ForeignKey("roads.road_id"), index=True)
    traffic_volume: Mapped[int] = mapped_column(Integer)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
