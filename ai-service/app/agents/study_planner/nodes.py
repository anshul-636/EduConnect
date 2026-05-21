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
            prompt = f"""You are an Expert Curriculum Strategist & Master Educator for the EduConnect platform. 
Create a professional {days}-day Lesson & Curriculum Roadmap for:

Objective: {state.get('event_title', 'Curriculum Syllabus')}
Category: {state.get('event_category', 'Educational Core')}
Educator: {state.get('student_name', 'Teacher')}
Timeline: {days} Days

Reference Blueprint:
{resources_text if resources_text else 'Standard Academic Standards'}

Structure your roadmap using Markdown:
1. ### 🎯 Instructional Goals: Set the primary outcomes for this period.
2. ### 📅 Daily Curriculum Breakdown: Use a table format with | Day | Topic | Classroom Activities | Learning Outcome |
3. ### 💡 Pedagogical Tips: Provide 3 expert strategies for student engagement.
4. ### 📝 Assessment Checkpoints: List specific ways to verify knowledge retention.

Use a professional, encouraging, and authoritative educator tone."""
        elif role == "SCHOOL":
            prompt = f"""You are a Senior Institutional Strategist & School Principal Advisor for the EduConnect platform. 
Create a comprehensive {days}-day Operational Roadmap and Stakeholder Timeline for:

Milestone: {state.get('event_title', 'Operational Objective')}
Institutional Area: {state.get('event_category', 'School Operations')}
School Head: {state.get('student_name', 'Principal')}
Timeline: {days} Days

Operational Context:
{resources_text if resources_text else 'School Policy Frameworks'}

Structure your roadmap using Markdown:
1. ### 🏛️ Strategic Vision: Define the high-level success metrics for this roadmap.
2. ### 🗓️ Operational Timeline: provide a daily schedule with | Day | Operational Priority | Stakeholder Coordination | Deliverable |
3. ### 👥 Staff Directives: List key responsibilities for department heads and support staff.
4. ### 📊 Risk Mitigation: Identify potential bottlenecks and mitigation strategies.

Use a formal, decisive, and highly professional institutional tone."""
        elif role == "ADMIN":
            prompt = f"""You are a Lead Systems Administrator & Security Auditor for the EduConnect platform. 
Create a high-precision {days}-day Platform Deployment & Safety Playbook for:

Technical Goal: {state.get('event_title', 'Systems Milestone')}
Domain: {state.get('event_category', 'Infrastructure & Security')}
Lead Operator: {state.get('student_name', 'Admin')}
Timeline: {days} Days

Technical Baseline:
{resources_text if resources_text else 'Core System Documentation'}

Structure your playbook using Markdown:
1. ### 🛡️ Security Protocol: Define the safety constraints and pre-check requirements.
2. ### 🚀 Deployment Workflow: Provide a technical timeline with | Day | Module/Service | Action Items | Verification Step |
3. ### 🛠️ Technical Stack Checklist: List essential configurations and backup points.
4. ### 🚨 Rollback & Contingency: Outline the immediate recovery steps if tests fail.

Use a hyper-precise, technical, and methodical tone."""
        else: # STUDENT
            prompt = f"""You are an Expert Study Success Coach for the EduConnect platform. 
Create an elite {days}-day Study Mastery Roadmap for:

Goal: {state.get('event_title', 'Exam/Event Preparation')}
Category: {state.get('event_category', 'Academic Milestone')}
Student: {state.get('student_name', 'Scholar')}
Timeline: {days} Days

Study Base:
{resources_text if resources_text else 'Targeted Learning Materials'}

Structure your roadmap using Markdown:
1. ### 🚀 Success Mission: A motivating summary of the study goal.
2. ### 📅 Mastery Schedule: Provide a structured table with | Day | Focus Topic | Study Activities | Mastery Goal |
3. ### 🧠 Cognitive Tips: Suggest 3 specific memory or focus técnicas (e.g., Active Recall, Pomodoro).
4. ### ✅ Verification: A final checklist to ensure event readiness.

Use a friendly, expert, and highly motivating coaching tone."""

        llm = get_llm()
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return {**state, "study_plan": response.content}
    except Exception as e:
        return {**state, "error": str(e), "study_plan": "Could not generate plan."}
