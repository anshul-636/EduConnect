# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GROQ_API_KEY: str = ""
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    NODE_BACKEND_URL: str = "http://localhost:3000"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
