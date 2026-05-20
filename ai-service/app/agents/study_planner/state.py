from typing import TypedDict, List, Optional

class StudyPlanState(TypedDict):
    student_id: str
    event_id: str
    event_title: str
    event_date: str
    event_category: str
    student_name: str
    weak_areas: List[str]
    resources: List[dict]
    study_plan: Optional[str]
    days_until_event: int
    error: Optional[str]
    role: Optional[str]
