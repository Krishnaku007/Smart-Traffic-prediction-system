from datetime import datetime

from app.models.road import Road
from app.models.traffic_data import TrafficData
from app.services.prediction_service import classify_congestion


def current_traffic_snapshot(roads: list[Road], rows: list[TrafficData]):
    latest_by_road: dict[int, TrafficData] = {}
    for row in rows:
        existing = latest_by_road.get(row.road_id)
        if existing is None or row.timestamp > existing.timestamp:
            latest_by_road[row.road_id] = row

    payload = []
    now = datetime.utcnow()
    for road in roads:
        data = latest_by_road.get(road.road_id)
        volume = data.traffic_volume if data else 0
        payload.append(
            {
                "road_id": road.road_id,
                "road_name": road.road_name,
                "latitude": road.latitude,
                "longitude": road.longitude,
                "traffic_volume": volume,
                "congestion_level": classify_congestion(volume),
                "timestamp": data.timestamp if data else now,
            }
        )
    return payload
