"""
rag_service.py — FIXED: sessions now persist to DB via ChatSession model.

Instead of the in-memory _sessions = {} dict (wiped on restart),
we load/save from the PostgreSQL ChatSession table through the Node backend.
"""

import asyncio
from importlib import import_module

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from app.services.ingestion import search_similar
from app.services.session_store import SessionStore
from typing import List, Optional
import json
import importlib

try:
    ChatGroq = import_module("langchain_groq").ChatGroq
except ImportError:
    ChatGroq = None

# Initialise the DB-backed session store (shared across rag + bot services)
_store = SessionStore()


def get_llm():
    if settings.GEMINI_API_KEY:
        try:
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2,
            )
        except Exception:
            pass
    if settings.GROQ_API_KEY and ChatGroq is not None:
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2,
        )
    raise RuntimeError("No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.")


def _is_quota_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(token in message for token in ["resource_exhausted", "quota", "429", "rate limit"])


async def get_session(session_id: str, student_id: Optional[str] = None, resource_id: Optional[str] = None) -> List:
    """Load message history from DB. Falls back to [] on error."""
    return await _store.load(session_id, bot_type="RAG", student_id=student_id, resource_id=resource_id)


async def save_session(session_id: str, history: List):
    """Persist updated history to DB."""
    await _store.save(session_id, history)


async def clear_session(session_id: str):
    await _store.clear(session_id)


async def rag_chat(
    question: str,
    session_id: str,
    resource_id: Optional[str] = None,
    role: Optional[str] = None,
    student_id: Optional[str] = None,
) -> dict:
    try:
        # Search for relevant chunks in ChromaDB; keep it small to reduce latency.
        chunks = await asyncio.to_thread(
            search_similar,
            question,
            resource_id=resource_id,
            top_k=2,
        ) if resource_id else await asyncio.to_thread(search_similar, question, top_k=2)
        if not chunks and resource_id:
            chunks = search_similar(question, top_k=4)

        if not chunks:
            context = "No uploaded documents matched this query. Use your general education knowledge."
        else:
            context = "\n\n".join([f"[Source {i+1}]: {c['text']}" for i, c in enumerate(chunks)])

        ELITE_FORMATS = """

    STRICT RESPONSE STRUCTURE:
    1. One short answer first.
    2. Then up to 2 concise bullet points.
    3. End with one practical tip.

    FORMATTING RULES:
    - Keep it brief.
    - Avoid large tables unless the user explicitly asks for them.
    - Be precise and direct."""

        STRICT_RULES = """

Strict Rules:
1. Only answer questions related to the provided educational context or EduConnect platform.
2. Absolutely NO abusive or inappropriate language."""

        if role == "TEACHER":
            persona = "You are a Master Curriculum Architect for EduConnect. Help teachers with syllabus and assessment structure."
        elif role == "SCHOOL":
            persona = "You are an Institutional Strategist for EduConnect. Help principals with operational excellence."
        elif role == "ADMIN":
            persona = "You are a Lead Systems Auditor for EduConnect. Help admins with technical precision."
        else:
            persona = "You are an Elite Study Performance Coach for EduConnect. Help students master complex topics."

        system_prompt = f"{persona}{ELITE_FORMATS}{STRICT_RULES}\n\nContext for this session:\n{context}"

        # Load history from DB
        history = await get_session(session_id, student_id=student_id, resource_id=resource_id)

        messages: List[BaseMessage] = [SystemMessage(content=system_prompt)]
        for msg in history[-4:]:
            messages.append(msg)

        full_prompt = f"Context from study materials:\n{context}\n\nQuestion: {question}\n\nAnswer based on the context above."
        messages.append(HumanMessage(content=full_prompt))

        llm = get_llm()
        try:
            response = await llm.ainvoke(messages)
        except Exception as exc:
            if settings.GEMINI_API_KEY and _is_quota_error(exc) and settings.GROQ_API_KEY and ChatGroq is not None:
                fallback_llm = ChatGroq(
                    model="llama-3.3-70b-versatile",
                    groq_api_key=settings.GROQ_API_KEY,
                    temperature=0.2,
                )
                response = await fallback_llm.ainvoke(messages)
            else:
                raise
        answer = response.content

        # Save to DB (append user + AI turns)
        history.append(HumanMessage(content=question))
        history.append(AIMessage(content=answer))
        await save_session(session_id, history)

        sources = [
            {
                "text": c["text"][:200] + "...",
                "resource_id": c["metadata"].get("resource_id"),
                "title": c["metadata"].get("title"),
                "score": round(c["score"], 3),
            }
            for c in chunks[:3]
        ]

        return {"answer": answer, "sources": sources, "session_id": session_id}

    except Exception as e:
        return {"answer": f"Error: {str(e)}", "sources": [], "session_id": session_id}
