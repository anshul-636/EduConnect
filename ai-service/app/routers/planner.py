from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.agents.study_planner.graph import study_planner

router = APIRouter(prefix="/planner", tags=["Study Planner"])

class PlanRequest(BaseModel):
    student_id: str
    student_name: str
    event_id: str
    role: Optional[str] = None

@router.post("/generate")
async def generate_plan(req: PlanRequest):
    try:
        initial_state = {
            "student_id": req.student_id,
            "event_id": req.event_id,
            "student_name": req.student_name,
            "event_title": "",
            "event_date": "",
            "event_category": "",
            "weak_areas": [],
            "resources": [],
            "study_plan": None,
            "days_until_event": 7,
            "error": None,
            "role": req.role,
        }
        result = await study_planner.ainvoke(initial_state)
        return {
            "success": True,
            "plan": result.get("study_plan"),
            "event": result.get("event_title"),
            "days": result.get("days_until_event"),
            "resources": result.get("resources", []),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
