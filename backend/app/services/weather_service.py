import httpx

from app.config import settings


async def get_weather(latitude: float, longitude: float) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,weather_code",
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(settings.weather_api_url, params=params)
            response.raise_for_status()
            return response.json().get("current", {})
    except Exception:
        return {"temperature_2m": 26.0, "weather_code": 1}
