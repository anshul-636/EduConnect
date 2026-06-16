"""
session_store.py — DB-backed chat session persistence.

Calls the Node.js backend's /internal/sessions/* endpoints to load/save
chat history in the ChatSession Prisma model.

If the Node backend is unreachable, every method silently returns a safe
fallback so the AI service never crashes.
"""

import httpx
import json
from typing import List, Optional
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from app.core.config import settings


def _serialise(messages: List[BaseMessage]) -> list:
    """LangChain message objects → plain dicts for JSON storage."""
    result = []
    for m in messages:
        if isinstance(m, HumanMessage):
            result.append({"role": "user",      "content": m.content})
        elif isinstance(m, AIMessage):
            result.append({"role": "assistant", "content": m.content})
    return result


def _deserialise(raw: list) -> List[BaseMessage]:
    """Plain dicts → LangChain message objects."""
    messages: List[BaseMessage] = []
    for m in raw:
        if not isinstance(m, dict):
            continue
        role    = m.get("role", "")
        content = m.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    return messages


class SessionStore:
    """
    Thin HTTP client that calls the Node backend's internal session API.

    Node endpoints (mounted under /internal, localhost-only):
      POST /internal/sessions/load   { session_id, bot_type, student_id?, resource_id? }
      POST /internal/sessions/save   { session_id, messages }
      POST /internal/sessions/clear  { session_id }
    """

    def __init__(self):
        self._base    = getattr(settings, "NODE_BACKEND_URL", "http://localhost:3000")
        self._timeout = 5.0

    async def load(
        self,
        session_id:  str,
        bot_type:    str  = "RAG",
        student_id:  Optional[str]  = None,
        resource_id: Optional[str] = None,
    ) -> List[BaseMessage]:
        """Load session history from DB. Returns [] on any error."""
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"{self._base}/internal/sessions/load",
                    json={
                        "session_id":  session_id,
                        "bot_type":    bot_type,
                        "student_id":  student_id,
                        "resource_id": resource_id,
                    },
                    timeout=self._timeout,
                )
                if res.status_code == 200:
                    raw = res.json().get("messages", [])
                    return _deserialise(raw)
        except Exception as exc:
            print(f"[SessionStore.load] {exc}")
        return []

    async def save(self, session_id: str, history: List[BaseMessage]) -> None:
        """Persist updated history. Silently swallows errors."""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self._base}/internal/sessions/save",
                    json={
                        "session_id": session_id,
                        "messages":   _serialise(history),
                    },
                    timeout=self._timeout,
                )
        except Exception as exc:
            print(f"[SessionStore.save] {exc}")

    async def clear(self, session_id: str) -> None:
        """Delete or reset session. Silently swallows errors."""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self._base}/internal/sessions/clear",
                    json={"session_id": session_id},
                    timeout=self._timeout,
                )
        except Exception as exc:
            print(f"[SessionStore.clear] {exc}")