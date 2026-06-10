"""
platform_bot.py  —  Fixed version.

Errors corrected:
 1. Return key changed back to "reply" (matches router + frontend)
 2. Function signature restored to (message, session_id) — matches router call
 3. search_similar is now actually used (like original) — import no longer dead
 4. session_store imported safely with try/except fallback to in-memory
 5. clear_session kept synchronous so router can call it without await
 6. Loop variables renamed (ev, res_item, lead_item) — no more 'e' conflict
 7. _store created inside try/except — bad import no longer crashes startup
"""

import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from app.services.ingestion import search_similar   # still used below ✓
from typing import List
import httpx

# ── Session store — DB-backed with safe in-memory fallback ────────────────────
try:
    from app.services.session_store import SessionStore
    _store = SessionStore()
    _USE_DB_SESSIONS = True
except (ImportError, Exception):
    # session_store.py not deployed yet — fall back to in-memory
    _store = None
    _USE_DB_SESSIONS = False

# Fallback in-memory store (original behaviour)
_sessions: dict = {}


# ── LLM factory ───────────────────────────────────────────────────────────────
def get_llm():
    if settings.GEMINI_API_KEY:
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )
    if settings.GROQ_API_KEY:
        try:
            import importlib
            _mod = importlib.import_module("langchain_groq")
            ChatGroq = getattr(_mod, "ChatGroq")
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=settings.GROQ_API_KEY,
                temperature=0.2,
            )
        except ImportError:
            pass
    raise RuntimeError("No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.")


# ── Session helpers ───────────────────────────────────────────────────────────
async def _load_session(session_id: str) -> List:
    """Load history from DB if available, else from in-memory dict."""
    if _USE_DB_SESSIONS and _store:
        try:
            return await _store.load(session_id, bot_type="PLATFORM")
        except Exception:
            pass
    # Fallback
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


async def _save_session(session_id: str, history: List) -> None:
    """Persist history to DB if available, else keep in-memory."""
    if _USE_DB_SESSIONS and _store:
        try:
            await _store.save(session_id, history)
            return
        except Exception:
            pass
    # Fallback
    _sessions[session_id] = history


# FIX 5 — clear_session stays synchronous so router can call without await
def clear_session(session_id: str) -> None:
    """Clear session (sync — compatible with existing router)."""
    _sessions.pop(session_id, None)
    if _USE_DB_SESSIONS and _store:
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(_store.clear(session_id))
            else:
                loop.run_until_complete(_store.clear(session_id))
        except Exception:
            pass


# ── Live platform data ─────────────────────────────────────────────────────────
async def fetch_platform_data(query: str) -> str:
    try:
        clean_query = query.strip()

        async with httpx.AsyncClient() as client:
            # Fetch the platform sources in parallel to keep chat responses snappy.
            events_task = client.get(
                f"{settings.NODE_BACKEND_URL}/api/v1/events?search={clean_query}",
                timeout=4,
            )
            resources_task = client.get(
                f"{settings.NODE_BACKEND_URL}/api/v1/resources?search={clean_query}",
                timeout=4,
            )
            leaderboard_task = client.get(
                f"{settings.NODE_BACKEND_URL}/api/v1/leaderboard",
                timeout=4,
            )
            events_res, res_response, lb_response = await asyncio.gather(
                events_task, resources_task, leaderboard_task
            )

            events: list = []
            if events_res.status_code == 200:
                payload = events_res.json().get("data", [])
                # Handle both paginated {items:[]} and legacy [] shapes
                events = payload if isinstance(payload, list) else payload.get("items", [])

            if not events:
                fallback = await client.get(
                    f"{settings.NODE_BACKEND_URL}/api/v1/events", timeout=4
                )
                if fallback.status_code == 200:
                    payload = fallback.json().get("data", [])
                    events = payload if isinstance(payload, list) else payload.get("items", [])

            resources: list = []
            if res_response.status_code == 200:
                payload = res_response.json().get("data", [])
                resources = payload if isinstance(payload, list) else payload.get("items", [])

            if not resources:
                fallback = await client.get(
                    f"{settings.NODE_BACKEND_URL}/api/v1/resources", timeout=4
                )
                if fallback.status_code == 200:
                    payload = fallback.json().get("data", [])
                    resources = payload if isinstance(payload, list) else payload.get("items", [])

            leaders: list = []
            if lb_response.status_code == 200:
                leaders = lb_response.json().get("data", [])

        data_parts: List[str] = []

        # FIX 6 — renamed loop vars to avoid shadowing 'e' in except block
        if events:
            event_strings = []
            for ev in events[:15]:
                deadline = ev.get("regDeadline")
                event_strings.append(
                    f"- **{ev['title']}** (Category: {ev.get('category', 'OTHER')})\n"
                    f"  * Status: {ev['status']}\n"
                    f"  * Date: {ev['eventDate'][:10]}\n"
                    f"  * Deadline: {deadline[:10] if deadline else 'None'}\n"
                    f"  * Target Class: {ev.get('targetClass', 'All')}\n"
                    f"  * Location: {ev.get('location', 'TBA')}\n"
                    f"  * Prize Pool: {ev.get('prizePool', 'None')}\n"
                    f"  * Description: {ev.get('description', '')}"
                )
            data_parts.append("AVAILABLE EVENTS CALENDAR:\n" + "\n".join(event_strings))

        if resources:
            res_strings = []
            for res_item in resources[:15]:         # FIX 6 — was 'r'
                res_strings.append(
                    f"- **{res_item['title']}** ({res_item.get('type', 'PDF')})\n"
                    f"  * Subject: {res_item.get('subject') or 'General'}\n"
                    f"  * Topic: {res_item.get('topic') or 'General'}\n"
                    f"  * Difficulty: {res_item.get('difficulty', 'BEGINNER')}\n"
                    f"  * Description: {res_item.get('description') or 'No description'}\n"
                    f"  * File URL: {res_item.get('fileUrl') or 'No file'}"
                )
            data_parts.append("AVAILABLE ACADEMIC RESOURCES:\n" + "\n".join(res_strings))

        if leaders:
            lead_lines = []
            for lead_item in leaders[:5]:           # FIX 6 — was 'l'
                name   = lead_item.get("student", {}).get("name", "Unknown")
                school = lead_item.get("school",  {}).get("name", "")
                score  = lead_item.get("score", 0)
                rank   = lead_item.get("rank", "?")
                lead_lines.append(f"- #{rank} {name} ({school}) — Score: {score}")
            data_parts.append("LEADERBOARD TOP RANKINGS:\n" + "\n".join(lead_lines))

        return "\n\n".join(data_parts) if data_parts else "No active platform data available."

    # FIX 6 — exception var 'exc' no longer conflicts with loop var 'e'
    except Exception as exc:
        return f"Could not fetch platform data: {str(exc)}"


# ── Main chat function ─────────────────────────────────────────────────────────
# FIX 1 + FIX 2 — signature and return key restored to match router exactly
async def platform_chat(message: str, session_id: str) -> dict:
    """
    Called by router as:  platform_chat(req.message, req.session_id)
    Returns:              {"reply": ..., "session_id": ...}
    """
    try:
        # Live platform data
        platform_data = await fetch_platform_data(message)

        # FIX 3 — search_similar is now actually used (wasn't in the broken version)
        semantic_results = search_similar(message, top_k=2)
        semantic_context = ""
        if semantic_results:
            semantic_context = "\nRELATED STUDY MATERIALS:\n" + "\n".join(
                [f"- {c['text'][:150]}" for c in semantic_results]
            )

        ELITE_FORMATS = """

    STRICT RESPONSE STRUCTURE:
    1. Give a very short answer first.
    2. Use at most 3 bullets.
    3. End with one practical next step.

    FORMATTING RULES:
    - Keep the response short.
    - Avoid tables unless the user explicitly asks.
    - Be direct and actionable."""

        STRICT_RULES = """

Strict Rules:
1. ONLY answer questions related to the EduConnect platform.
2. Absolutely NO abusive or inappropriate language."""

        system_prompt = (
            "You are the Elite EduConnect Strategy Consultant. "
            "Your mission is to help users navigate the platform with world-class precision."
            + ELITE_FORMATS
            + STRICT_RULES
        )

        # Load history (DB if available, else in-memory fallback)
        history = await _load_session(session_id)

        messages: list = [SystemMessage(content=system_prompt)]
        for msg in history[-4:]:
            messages.append(msg)

        full_message = (
            f"Here is the current real-time data from the platform:\n{platform_data}"
            f"\n\nAdditional Academic Context:{semantic_context}"
            f"\n\nUser's Request:\n{message}"
        )
        messages.append(HumanMessage(content=full_message))

        llm = get_llm()
        response = await llm.ainvoke(messages)
        reply = response.content

        # Persist updated history
        history.append(HumanMessage(content=message))
        history.append(AIMessage(content=reply))
        await _save_session(session_id, history)

        # FIX 1 — returns "reply" not "answer"
        return {"reply": reply, "session_id": session_id}

    except Exception as exc:
        return {"reply": f"Sorry, I encountered an error: {str(exc)}", "session_id": session_id}