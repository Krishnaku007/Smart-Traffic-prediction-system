from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import ask_gemini

router = APIRouter(prefix="/api", tags=["assistant"])


@router.post("/assistant", response_model=ChatResponse)
async def assistant(payload: ChatRequest, _user: User = Depends(get_current_user)):
    context = "Traffic prediction system with congestion and travel-time analytics"
    answer = await ask_gemini(payload.question, context)
    return ChatResponse(answer=answer)
