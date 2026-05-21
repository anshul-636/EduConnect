from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.services.ingestion import search_similar
from typing import List

def get_llm():
    if settings.GROQ_API_KEY:
        # pyrefly: ignore [missing-import]
        from langchain_groq import ChatGroq
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.3,
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
    )

# In-memory chat history per session
_sessions = {}

def get_session(session_id: str) -> List:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]

def clear_session(session_id: str):
    if session_id in _sessions:
        del _sessions[session_id]

async def rag_chat(question: str, session_id: str, resource_id: str = None, role: str = None) -> dict:
    try:
        # Search for relevant chunks
        chunks = search_similar(question, resource_id=resource_id, top_k=4)

        # Fallback: if no chunks for this specific resource, try all resources
        if not chunks and resource_id:
            chunks = search_similar(question, resource_id=None, top_k=4)

        if not chunks:
            context = "No uploaded documents matched this query. Use your general education knowledge to help the user."
        else:
            context = "\n\n".join([f"[Source {i+1}]: {c['text']}" for i, c in enumerate(chunks)])

        # Build prompt
        # Premium Formatting & Security Core
        ELITE_FORMATS = """\n\nSTRICT RESPONSE STRUCTURE:
1. ### 🎯 Executive Summary (1-sentence concise context)
2. ### 📊 Structured Intelligence (Use Markdown TABLES or BOLDED LISTS only)
3. ### 💡 Expert Pro-Tip (A specific, actionable strategy)

FORMATTING RULES:
- Use ### for headers.
- Use | Tables | for data/schedules.
- Use **Bold** for terminology.
- Avoid vague conversational filler. Be precise and institutional."""

        STRICT_RULES = """\n\nStrict Rules:
1. You must ONLY answer questions related to the provided educational context or the EduConnect platform. If a question is off-topic, decline to answer.
2. Absolutely NO abusive or inappropriate language."""

        # Role-specific persona tailoring
        if role == "TEACHER":
            persona = "You are a Master Curriculum Architect for EduConnect. Help teachers with high-level syllabus and assessment structure."
        elif role == "SCHOOL":
            persona = "You are an Institutional Strategist for EduConnect. Help principals with operational excellence and stakeholder alignment."
        elif role == "ADMIN":
            persona = "You are a Lead Systems Auditor for EduConnect. Help admins with technical precision and safety protocols."
        else: # STUDENT (Default)
            persona = "You are an Elite Study Performance Coach for EduConnect. Help students master complex topics with high-efficiency strategies."

        system_prompt = f"{persona}{ELITE_FORMATS}{STRICT_RULES}\n\nContext for this session:\n{context}"

        history = get_session(session_id)

        messages = [SystemMessage(content=system_prompt)]
        for msg in history[-6:]:  # keep last 6 messages
            messages.append(msg)

        full_prompt = f"""Context from study materials:
{context}

Question: {question}

Please answer based on the context above."""

        messages.append(HumanMessage(content=full_prompt))

        llm = get_llm()
        response = await llm.ainvoke(messages)
        answer = response.content

        # Save to history
        history.append(HumanMessage(content=question))
        from langchain_core.messages import AIMessage
        history.append(AIMessage(content=answer))

        # Format sources
        sources = []
        for c in chunks[:3]:
            sources.append({
                "text": c["text"][:200] + "...",
                "resource_id": c["metadata"].get("resource_id"),
                "title": c["metadata"].get("title"),
                "score": round(c["score"], 3)
            })

        return {
            "answer": answer,
            "sources": sources,
            "session_id": session_id
        }
    except Exception as e:
        return {"answer": f"Error: {str(e)}", "sources": [], "session_id": session_id}
