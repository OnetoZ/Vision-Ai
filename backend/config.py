from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./vision_ai.db"
    JWT_SECRET: str = "vision-ai-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24 * 7  # 1 week
    GOOGLE_API_KEY: str = ""
    PAGESPEED_API_KEY: str = ""
    CRAWL_MAX_PAGES: int = 500
    CRAWL_CONCURRENCY: int = 5
    CRAWL_DELAY_SECONDS: float = 1.0
    USER_AGENT: str = "VisionAI-Crawler/1.0 (+https://visionai.app/bot)"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
