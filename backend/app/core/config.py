import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NoteForge"
    API_V1_STR: str = "/api/v1"
    
    # Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    UPLOAD_DIR: str = os.path.join(DATA_DIR, "uploads")
    DB_PATH: str = os.path.join(DATA_DIR, "db", "noteforge.db")
    
    # Ollama settings
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    DEFAULT_MODEL: str = "gemma2"
    FALLBACK_MODEL: str = "gemma2:2b"
    REQUEST_TIMEOUT: float = 120.0

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DB_PATH), exist_ok=True)
