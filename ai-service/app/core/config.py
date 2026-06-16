from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Groq is the primary provider — required for the service to run.
    GROQ_API_KEY: str

    # Gemini is optional. If provided, used as a fallback when Groq quota is hit.
    GEMINI_API_KEY: str = ""

    CHROMA_PERSIST_DIR: str = "./chroma_db"
    NODE_BACKEND_URL: str = "http://localhost:3000"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()