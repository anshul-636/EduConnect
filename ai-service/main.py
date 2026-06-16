import asyncio
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat, embed, planner, recommend

app = FastAPI(
    title="EduConnect AI Service",
    description="AI features: RAG, Platform Bot, Study Planner, Recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1")
app.include_router(embed.router, prefix="/api/v1")
app.include_router(planner.router, prefix="/api/v1")
app.include_router(recommend.router, prefix="/api/v1")


@app.on_event("startup")
async def preload_embedding_model():
    """
    Pre-load the sentence-transformers model at startup so the first real
    request is not blocked by the ~90 MB download / load time.
    """
    from app.services.ingestion import get_embedding_model
    print("[startup] Loading embedding model...")
    await asyncio.to_thread(get_embedding_model)
    print("[startup] Embedding model ready.")


@app.get("/health")
def health():
    return {"status": "ok", "service": "EduConnect AI Service"}

if __name__ == "__main__":
    import uvicorn
    # This prevents the RuntimeError on Windows during --reload 
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)