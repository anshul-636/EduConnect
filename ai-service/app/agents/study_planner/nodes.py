import httpx
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.services.ingestion import search_similar
from app.agents.study_planner.state import StudyPlanState

def get_llm():
    if settings.GROQ_API_KEY:
        # pyrefly: ignore [missing-import]
        from langchain_groq import ChatGroq
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.7,
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.7,
    )

async def fetch_event_node(state: StudyPlanState) -> StudyPlanState:
    event_id = state.get("event_id", "")
    # Check if event_id is a valid UUID (database record)
    is_uuid = len(event_id) == 36 and "-" in event_id
    
    if not is_uuid:
        # Treat as custom objective (mock ID or direct string)
        return {
            **state,
            "event_title": event_id.replace("mock-", "").replace("-", " ").title(),
            "event_category": state.get("role", "General"),
            "days_until_event": state.get("days_until_event", 7)
        }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{settings.NODE_BACKEND_URL}/api/v1/events/{state['event_id']}",
                timeout=5
            )
        if res.status_code == 200:
            event = res.json()["data"]
            event_date = datetime.fromisoformat(event["eventDate"].replace("Z", "+00:00"))
            days_until = max(1, (event_date - datetime.now(event_date.tzinfo)).days)
            return {
                **state,
                "event_title": event["title"],
                "event_category": event["category"],
                "event_date": event["eventDate"][:10],
                "days_until_event": days_until,
            }
    except Exception as e:
        # Fallback to the ID as title if lookup fails
        return {**state, "event_title": str(event_id).title(), "days_until_event": 7}
    return state

async def find_resources_node(state: StudyPlanState) -> StudyPlanState:
    try:
        query = f"{state.get('event_category', '')} {state.get('event_title', '')} study preparation"
        chunks = search_similar(query, top_k=6)
        resources = []
        seen = set()
        for c in chunks:
            rid = c["metadata"].get("resource_id")
            if rid and rid not in seen:
                seen.add(rid)
                resources.append({
                    "title": c["metadata"].get("title", "Resource"),
                    "resource_id": rid,
                    "preview": c["text"][:200]
                })
        return {**state, "resources": resources}
    except Exception as e:
        return {**state, "resources": [], "error": str(e)}

async def build_plan_node(state: StudyPlanState) -> StudyPlanState:
    try:
        days = state.get("days_until_event", 7)
        resources_text = "\n".join([f"- {r['title']}: {r['preview'][:100]}" for r in state.get("resources", [])])
        role = state.get("role", "STUDENT")

        if role == "TEACHER":
            prompt = f"""You are a Master Curriculum Architect for EduConnect. 
Generate a comprehensive {days}-day Lesson & Syllabus Roadmap.
TARGET: {state.get('event_title', 'Curriculum Syllabus')}
DATE: {state.get('event_date', 'TBA')}
PLANNER: {state.get('student_name', 'Teacher')}

STRICT FORMATTING REQUIREMENTS:
1. Use ### for main section headers.
2. Use **Bold** for critical pedagogical terms.
3. PROVIDE A FULL TABLE for the daily schedule.
4. DO NOT BE VAGUE. Specify actual topics and classroom methods.

EXAMPLE STRUCTURE:
### 🎯 Executive Learning Objectives
- Define the 3 core competencies...

### 📅 Curriculum Execution Timeline
| Day | Core Topic | Classroom Methodology | Student Resource | Milestone |
|---|---|---|---|---|
| 1 | Unit A | Socratic Seminar | PDF X | Recap Quiz |

### 💡 Expert Educator Insights
- Pro-tip for classroom management...
"""
        elif role == "SCHOOL":
            prompt = f"""You are a Senior Institutional Strategist for EduConnect. 
Generate a professional {days}-day Operational & Logistics Roadmap.
TARGET: {state.get('event_title', 'Operational Objective')}
DATE: {state.get('event_date', 'TBA')}
LEAD: {state.get('student_name', 'Principal')}

STRICT FORMATTING REQUIREMENTS:
1. Professional Institutional Tone.
2. Detailed Markdown Tables.
3. Focus on Stakeholders and Resource Allocation.

EXAMPLE STRUCTURE:
### 🏛️ Institutional Strategic Vision
- High-level KPIs...

### 🗓️ Operational Roadmap
| Day | Priority | Stakeholder Coordination | Resource Alignment | Target |
|---|---|---|---|---|

### 👥 Leadership Directives
- Tasks for HODs...
"""
        elif role == "ADMIN":
            prompt = f"""You are a Lead Platform Architect & Security Auditor for EduConnect. 
Generate a high-precision {days}-day Systems Deployment & Rollout Playbook.
SYSTEM GOAL: {state.get('event_title', 'Systems Milestone')}
DATE: {state.get('event_date', 'TBA')}
ENGINEER: {state.get('student_name', 'Admin')}

STRICT FORMATTING REQUIREMENTS:
1. Technical, Precise Methodology.
2. Security-First Protocols.
3. Verification/Test Case tables.

EXAMPLE STRUCTURE:
### 🛡️ Pre-Flight Security Constraints
- Check binary integrity...

### 🚀 Technical Rollout Timeline
| Day | System Domain | Action Plan | Verification Log | Status |
|---|---|---|---|---|

### 🚨 Failover & Recovery
- Step-by-step rollback...
"""
        else: # STUDENT
            prompt = f"""You are an Elite Study Performance Coach for EduConnect. 
Generate a personalized {days}-day High-Performance Study Roadmap.
GOAL: {state.get('event_title', 'Learning Objective')}
STUDENT: {state.get('student_name', 'Scholar')}
DAYS TO GO: {days}

STRICT FORMATTING REQUIREMENTS:
1. Motivational yet Scientifically Grounded.
2. Focus on Active Recall & Spaced Repetition.
3. Daily Focus Blocks in a Table.

EXAMPLE STRUCTURE:
### 🚀 Mission Success Brief
- Why this matters...

### 📅 Daily Mastery Blocks
| Day | Focus Topic | Active Study Strategy | Success Marker | Intensity |
|---|---|---|---|---|

### 🧠 Expert Coaching Tips
- Technique X for deep work...
"""


        llm = get_llm()
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return {**state, "study_plan": response.content}
    except Exception as e:
        return {**state, "error": str(e), "study_plan": "Could not generate plan."}
