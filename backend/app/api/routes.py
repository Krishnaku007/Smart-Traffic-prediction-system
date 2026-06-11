from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas import RouteResponse
from app.services.routing_service import build_demo_graph, dijkstra

router = APIRouter(prefix="/api", tags=["routes"])


@router.get("/routes", response_model=RouteResponse)
def get_route(
    source_road_id: int = Query(...),
    destination_road_id: int = Query(...),
    _user: User = Depends(get_current_user),
):
    graph = build_demo_graph()
    distance, path = dijkstra(graph, source_road_id, destination_road_id)
    speed_kmph = 28.0
    time_min = (distance / speed_kmph) * 60.0 if distance != float("inf") else 0.0
    return RouteResponse(
        shortest_distance_km=round(distance, 2) if distance != float("inf") else 0.0,
        fastest_time_min=round(time_min, 2),
        route_path=path,
    )
