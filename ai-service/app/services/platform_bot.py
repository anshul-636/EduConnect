from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from app.services.ingestion import search_similar
import httpx
from typing import List

def get_llm():
    if settings.GROQ_API_KEY:
        # pyrefly: ignore [missing-import]
        from langchain_groq import ChatGroq
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.5,
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.5,
    )

_sessions = {}

def get_session(session_id: str) -> List:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]

async def fetch_platform_data(query: str) -> str:
    try:
        clean_query = query.strip()
        
        async with httpx.AsyncClient() as client:
            # 1. Fetch Events
            events_res = await client.get(f"{settings.NODE_BACKEND_URL}/api/v1/events?search={clean_query}", timeout=5)
            events = []
            if events_res.status_code == 200:
                events = events_res.json().get("data", [])
            
            # If search returns no events, fallback to fetching all events
            if not events:
                all_events_res = await client.get(f"{settings.NODE_BACKEND_URL}/api/v1/events", timeout=5)
                if all_events_res.status_code == 200:
                    events = all_events_res.json().get("data", [])
            
            # 2. Fetch Resources
            resources_res = await client.get(f"{settings.NODE_BACKEND_URL}/api/v1/resources?search={clean_query}", timeout=5)
            resources = []
            if resources_res.status_code == 200:
                resources = resources_res.json().get("data", [])
            
            # If search returns no resources, fallback to fetching all resources
            if not resources:
                all_resources_res = await client.get(f"{settings.NODE_BACKEND_URL}/api/v1/resources", timeout=5)
                if all_resources_res.status_code == 200:
                    resources = all_resources_res.json().get("data", [])
            
            # 3. Fetch Leaderboard
            leaderboard_res = await client.get(f"{settings.NODE_BACKEND_URL}/api/v1/leaderboard", timeout=5)
            leaders = []
            if leaderboard_res.status_code == 200:
                leaders = leaderboard_res.json().get("data", [])

        data_parts = []

        # Format Events with high details
        if events:
            event_strings = []
            for e in events[:15]:
                deadline = e.get('regDeadline')
                deadline_str = deadline[:10] if deadline else 'None'
                event_strings.append(
                    f"- **{e['title']}** (Category: {e.get('category', 'OTHER')})\n"
                    f"  * Status: {e['status']}\n"
                    f"  * Date: {e['eventDate'][:10]}\n"
                    f"  * Deadline: {deadline_str}\n"
                    f"  * Target Class: {e.get('targetClass', 'All')}\n"
                    f"  * Location: {e.get('location', 'TBA')}\n"
                    f"  * Prize Pool: {e.get('prizePool', 'None')}\n"
                    f"  * Description: {e.get('description', '')}"
                )
            data_parts.append("AVAILABLE EVENTS CALENDAR:\n" + "\n".join(event_strings))

        # Format Resources with high details
        if resources:
            res_strings = []
            for r in resources[:15]:
                res_strings.append(
                    f"- **{r['title']}** ({r.get('type', 'PDF')})\n"
                    f"  * Subject: {r.get('subject') or 'General'}\n"
                    f"  * Topic: {r.get('topic') or 'General'}\n"
                    f"  * Difficulty: {r.get('difficulty', 'BEGINNER')}\n"
                    f"  * Description: {r.get('description') or 'No description'}\n"
                    f"  * File URL: {r.get('fileUrl') or 'No file'}"
                )
            data_parts.append("AVAILABLE ACADEMIC RESOURCES:\n" + "\n".join(res_strings))

        # Format Leaderboard
        if leaders:
            lead_list = "\n".join([f"- Rank {i+1}: {l['student']['name']} ({l['school']['name']}) - Score: {l['score']}" for i, l in enumerate(leaders[:5])])
            data_parts.append(f"LEADERBOARD TOP RANKINGS:\n{lead_list}")

        return "\n\n".join(data_parts) if data_parts else "No active platform data available."
    except Exception as e:
        return f"Could not fetch platform data: {str(e)}"

async def platform_chat(message: str, session_id: str) -> dict:
    try:
        platform_data = await fetch_platform_data(message)

        semantic_results = search_similar(message, top_k=2)
        semantic_context = ""
        if semantic_results:
            semantic_context = "\nRELATED STUDY MATERIALS:\n" + "\n".join([f"- {c['text'][:150]}" for c in semantic_results])

        system_prompt = """You are a helpful assistant for the EduConnect school collaboration platform.
You help students, teachers, and school admins navigate the platform, find events, resources, and information.
Respond ONLY with concise, to-the-point answers and strict bullet points where applicable. NEVER use long, verbose paragraphs or filler text. Give only the exact information requested.
Use the platform data provided to give accurate answers.

Strict Rules:
1. Do NOT answer off-topic questions. If the user asks about anything unrelated to education, studies, or the EduConnect platform, politely decline to answer.
2. Under no circumstances should you generate or tolerate abusive, harmful, or inappropriate language.
3. If asked about something not in the data but is education/platform related, provide brief, direct guidance."""

        history = get_session(session_id)
        messages = [SystemMessage(content=system_prompt)]
        for msg in history[-8:]:
            messages.append(msg)

        full_message = f"""Platform Data:
{platform_data}
{semantic_context}

User Question: {message}"""

        messages.append(HumanMessage(content=full_message))

        llm = get_llm()
        response = await llm.ainvoke(messages)
        reply = response.content

        history.append(HumanMessage(content=message))
        history.append(AIMessage(content=reply))

        return {
            "reply": reply,
            "session_id": session_id
        }
    except Exception as e:
        return {"reply": f"Sorry, I encountered an error: {str(e)}", "session_id": session_id}
