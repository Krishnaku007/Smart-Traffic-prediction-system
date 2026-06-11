from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Road(Base):
    __tablename__ = "roads"

    road_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    road_name: Mapped[str] = mapped_column(String(255), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
