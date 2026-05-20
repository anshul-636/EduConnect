from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ingestion import ingest_pdf, ingest_text

router = APIRouter(prefix="/embed", tags=["Embedding"])

@router.post("/pdf")
async def embed_pdf(
    file: UploadFile = File(...),
    resource_id: str = Form(...),
    title: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported.")
    file_bytes = await file.read()
    result = await ingest_pdf(file_bytes, resource_id, title)
    return result

@router.post("/text")
async def embed_text(data: dict):
    result = await ingest_text(
        text=data.get("text", ""),
        resource_id=data.get("resource_id", ""),
        title=data.get("title", "")
    )
    return result

@router.delete("/{resource_id}")
async def delete_embeddings(resource_id: str):
    from app.core.database import get_or_create_collection
    collection = get_or_create_collection("resources")
    results = collection.get(where={"resource_id": resource_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])
    return {"success": True, "deleted": len(results["ids"])}
