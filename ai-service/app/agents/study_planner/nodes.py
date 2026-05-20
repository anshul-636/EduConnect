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
        return {**state, "error": str(e)}
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
            prompt = f"""Create a detailed {days}-day lesson curriculum plan and educator schedule for a teacher preparing for class activities related to:

Class Event/Objective: {state.get('event_title', 'Curriculum Syllabus')}
Category: {state.get('event_category', 'Educational Core')}
Days available: {days}
Educator Name: {state.get('student_name', 'Teacher')}

Syllabus guidelines and resource hints:
{resources_text if resources_text else 'Syllabus reference blueprints'}

Create a structured day-by-day lesson outline that:
1. Covers vital curriculum topics for this module
2. Includes specific classroom lecture goals and study topics
3. Recommends engaging in-class activities or pop quiz checkpoints
4. Integrates clear review segments before the final date

Format as:
DAY 1: [Curriculum Unit] - [Class Activities & Resources] - [Lesson Goal]
DAY 2: [Curriculum Unit] - [Class Activities & Resources] - [Lesson Goal]
...and so on

End with educator guidance tips to maximize classroom engagement."""
        elif role == "SCHOOL":
            prompt = f"""Create a detailed {days}-day administrative planning roadmap and timeline calendar for a school operator/head preparing for:

School Milestone/Objective: {state.get('event_title', 'Operational Audit')}
Category: {state.get('event_category', 'Administrative Operations')}
Days available: {days}
School Head Name: {state.get('student_name', 'School Head')}

Available resource references:
{resources_text if resources_text else 'Standard operating procedures'}

Create a day-by-day operations calendar that:
1. Covers key logistics and coordination metrics
2. Sets daily operational priorities and staff responsibilities
3. Outlines parent-teacher meeting checkpoints or administrative milestones
4. Includes contingency and review periods before the event date

Format as:
DAY 1: [Operations Segment] - [Staff Directives & Activities] - [Target Milestone]
DAY 2: [Operations Segment] - [Staff Directives & Activities] - [Target Milestone]
...and so on

End with key operational advice for smooth execution."""
        elif role == "ADMIN":
            prompt = f"""Create a detailed {days}-day platform deployment schedule and server health playbook for a platform admin preparing for:

System Objective: {state.get('event_title', 'Platform Safety Audit')}
Category: {state.get('event_category', 'Systems & Policies')}
Days available: {days}
System Operator: {state.get('student_name', 'Platform Admin')}

Platform security documentation and configuration hints:
{resources_text if resources_text else 'Platform default configurations'}

Create a day-by-day playbook that:
1. Outlines server audit routines and safety policy updates
2. Details systems configuration checkpoints or platform backups
3. Suggests code-level testing parameters or integration checks
4. Builds testing and safety margins before release

Format as:
DAY 1: [Platform Domain] - [Audit Steps & Config Actions] - [Systems Goal]
DAY 2: [Platform Domain] - [Audit Steps & Config Actions] - [Systems Goal]
...and so on

End with critical security rules for platform operations."""
        else: # STUDENT
            prompt = f"""Create a detailed {days}-day study plan for a student preparing for:

Event: {state.get('event_title', 'Competition')}
Category: {state.get('event_category', 'General')}
Days available: {days}
Student: {state.get('student_name', 'Student')}

Available study resources:
{resources_text if resources_text else 'General study materials'}

Create a day-by-day plan that:
1. Covers key topics for this type of event
2. Includes specific daily goals
3. Suggests practice activities
4. Gets progressively more focused as the event approaches
5. Includes revision time before the event

Format as:
DAY 1: [Topic] - [Activities] - [Goal]
DAY 2: [Topic] - [Activities] - [Goal]
...and so on

End with key tips for the event day."""

        llm = get_llm()
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return {**state, "study_plan": response.content}
    except Exception as e:
        return {**state, "error": str(e), "study_plan": "Could not generate plan."}
