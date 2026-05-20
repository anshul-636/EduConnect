from fastapi import APIRouter
from app.services.ingestion import search_similar

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

@router.get("/resources")
async def recommend_resources(query: str, limit: int = 5):
    try:
        results = search_similar(query, top_k=limit)
        return {
            "success": True,
            "recommendations": [
                {
                    "resource_id": r["metadata"].get("resource_id"),
                    "title": r["metadata"].get("title"),
                    "preview": r["text"][:200],
                    "score": round(r["score"], 3)
                }
                for r in results
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
