from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "烟智通 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./yanzhitong.db"
    
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    VL_MODEL: str = "qwen3-vl:8b"
    LLM_MODEL: str = "qwen2.5-coder:7b"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
