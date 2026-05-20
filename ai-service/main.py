from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, embed, planner, recommend

app = FastAPI(
    title="EduConnect AI Service",
    description="AI features: RAG, Platform Bot, Study Planner, Recommendations",
    version="1.0.0"
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

@app.get("/health")
def health():
    return {"status": "ok", "service": "EduConnect AI Service"}
