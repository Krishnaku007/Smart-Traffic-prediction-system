import httpx

from app.config import settings


async def ask_gemini(question: str, context: str) -> str:
    if not settings.gemini_api_key:
        return (
            "Gemini API key is not configured. "
            "Based on historical trends, avoid rush hours (7-9 AM and 5-8 PM)."
        )

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "You are an AI traffic assistant. "
                            f"Context: {context}. User question: {question}"
                        )
                    }
                ]
            }
        ]
    }
    params = {"key": settings.gemini_api_key}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(endpoint, params=params, json=payload)
            response.raise_for_status()
            body = response.json()
            return body["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return "Unable to reach Gemini right now. Please try again shortly."
