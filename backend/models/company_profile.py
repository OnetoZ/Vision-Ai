import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from database import Base


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id"), nullable=True)
    
    # Phase 2 - Brand Identification
    brand_name = Column(String, nullable=True)
    legal_name = Column(String, nullable=True)
    website_domain = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    country = Column(String, nullable=True)
    primary_market = Column(String, nullable=True)
    description = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    value_proposition = Column(String, nullable=True)
    
    # Phase 3 - Business Understanding
    business_model = Column(String, nullable=True)
    target_customers = Column(JSON, nullable=True) # list
    target_industries = Column(JSON, nullable=True) # list
    primary_problems_solved = Column(JSON, nullable=True) # list
    business_categories = Column(JSON, nullable=True) # list
    
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
