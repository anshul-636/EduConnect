from langgraph.graph import StateGraph, END
from app.agents.study_planner.state import StudyPlanState
from app.agents.study_planner.nodes import fetch_event_node, find_resources_node, build_plan_node

def build_study_planner_graph():
    graph = StateGraph(StudyPlanState)

    graph.add_node("fetch_event", fetch_event_node)
    graph.add_node("find_resources", find_resources_node)
    graph.add_node("build_plan", build_plan_node)

    graph.set_entry_point("fetch_event")
    graph.add_edge("fetch_event", "find_resources")
    graph.add_edge("find_resources", "build_plan")
    graph.add_edge("build_plan", END)

    return graph.compile()

study_planner = build_study_planner_graph()
