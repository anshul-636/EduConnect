from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import rag_chat, clear_session
from app.services.platform_bot import platform_chat

router = APIRouter(prefix="/chat", tags=["Chat"])

class RAGChatRequest(BaseModel):
    question: str
    session_id: str
    resource_id: Optional[str] = None
    role: Optional[str] = None

class PlatformChatRequest(BaseModel):
    message: str
    session_id: str

@router.post("/rag")
async def rag_chat_endpoint(req: RAGChatRequest):
    return await rag_chat(req.question, req.session_id, req.resource_id, req.role)

@router.post("/platform")
async def platform_chat_endpoint(req: PlatformChatRequest):
    return await platform_chat(req.message, req.session_id)

@router.delete("/session/{session_id}")
async def clear_chat_session(session_id: str):
    clear_session(session_id)
    return {"success": True, "message": "Session cleared."}
