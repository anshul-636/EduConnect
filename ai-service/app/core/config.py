import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str

    
    GEMINI_API_KEY: str = ""

    CHROMA_PERSIST_DIR: str = "./chroma_db"
    NODE_BACKEND_URL: str = "http://localhost:3000"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

if not settings.GEMINI_API_KEY:
    settings.GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "")