from collections import defaultdict
from datetime import datetime

from app.models.traffic_data import TrafficData


def _mean(buckets: dict[str, list[int]]) -> dict[str, float]:
    return {k: round(sum(v) / len(v), 2) for k, v in buckets.items() if v}


def build_analytics(rows: list[TrafficData]) -> dict[str, dict[str, float]]:
    hourly = defaultdict(list)
    daily = defaultdict(list)
    weekly = defaultdict(list)
    monthly = defaultdict(list)

    for row in rows:
        ts: datetime = row.timestamp
        hourly[str(ts.hour)].append(row.traffic_volume)
        daily[str(ts.date())].append(row.traffic_volume)
        weekly[str(ts.isocalendar().week)].append(row.traffic_volume)
        monthly[f"{ts.year}-{ts.month:02d}"].append(row.traffic_volume)

    return {
        "hourly": _mean(hourly),
        "daily": _mean(daily),
        "weekly": _mean(weekly),
        "monthly": _mean(monthly),
    }
