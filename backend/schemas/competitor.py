from pydantic import BaseModel
from datetime import datetime


class CompetitorCreate(BaseModel):
    name: str
    url: str
    industry: str = "General"
    competitor_type: str = "direct"


class CompetitorResponse(BaseModel):
    id: str
    user_id: str
    name: str
    url: str
    industry: str | None
    competitor_type: str
    status: str
    scan_frequency: str | None
    last_scanned_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompetitorWithScan(CompetitorResponse):
    latest_crawl_status: str | None = None
    latest_seo_score: int | None = None


class CrawlStatusResponse(BaseModel):
    id: str
    competitor_id: str
    status: str
    pages_discovered: int
    pages_analyzed: int
    pages_failed: int
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
