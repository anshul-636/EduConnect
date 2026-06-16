"""

LLM priority: Groq (primary) → Gemini (fallback if quota hit and key present).
Sessions persist to PostgreSQL via the Node backend's /internal/sessions/* API.
"""

import asyncio
from importlib import import_module
from typing import List, Optional

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from app.services.ingestion import search_similar
from app.services.session_store import SessionStore

# ── LLM imports ───────────────────────────────────────────────────────────────
try:
    from langchain_groq import ChatGroq
except ImportError:
    ChatGroq = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None

# Shared DB-backed session store
_store = SessionStore()


# ── LLM factory ───────────────────────────────────────────────────────────────
def get_llm():
    """Return Groq (primary). Falls back to Gemini if available."""
    if settings.GROQ_API_KEY and ChatGroq is not None:
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2,
        )
    if settings.GEMINI_API_KEY and ChatGoogleGenerativeAI is not None:
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )
    raise RuntimeError(
        "No AI provider configured. Set GROQ_API_KEY (or GEMINI_API_KEY) in your .env file."
    )


def _get_gemini_fallback():
    """Return a Gemini LLM if configured, else None."""
    if settings.GEMINI_API_KEY and ChatGoogleGenerativeAI is not None:
        try:
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2,
            )
        except Exception:
            pass
    return None


def _is_quota_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(token in message for token in ["resource_exhausted", "quota", "429", "rate limit"])


# ── Session helpers ────────────────────────────────────────────────────────────
async def get_session(
    session_id: str,
    student_id: Optional[str] = None,
    resource_id: Optional[str] = None,
) -> List:
    return await _store.load(session_id, bot_type="RAG", student_id=student_id, resource_id=resource_id)


async def save_session(session_id: str, history: List):
    await _store.save(session_id, history)


async def clear_session(session_id: str):
    await _store.clear(session_id)


# ── Main chat function ─────────────────────────────────────────────────────────
async def rag_chat(
    question: str,
    session_id: str,
    resource_id: Optional[str] = None,
    role: Optional[str] = None,
    student_id: Optional[str] = None,
) -> dict:
    try:
        # Retrieve relevant chunks from ChromaDB
        if resource_id:
            chunks = await asyncio.to_thread(search_similar, question, resource_id=resource_id, top_k=2)
            if not chunks:
                chunks = await asyncio.to_thread(search_similar, question, top_k=4)
        else:
            chunks = await asyncio.to_thread(search_similar, question, top_k=2)

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

        history = await get_session(session_id, student_id=student_id, resource_id=resource_id)

        messages: List[BaseMessage] = [SystemMessage(content=system_prompt)]
        for msg in history[-4:]:
            messages.append(msg)

        full_prompt = (
            f"Context from study materials:\n{context}\n\n"
            f"Question: {question}\n\nAnswer based on the context above."
        )
        messages.append(HumanMessage(content=full_prompt))

        llm = get_llm()
        try:
            response = await llm.ainvoke(messages)
        except Exception as exc:
            # If Groq quota is hit, try Gemini as fallback
            if _is_quota_error(exc):
                fallback = _get_gemini_fallback()
                if fallback is not None:
                    response = await fallback.ainvoke(messages)
                else:
                    raise
            else:
                raise

        answer = response.content

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