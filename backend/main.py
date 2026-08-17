import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db
from routers import auth, competitors, crawls, seo, content, pricing, insights

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB
    await init_db()
    yield

app = FastAPI(
    title="Vision AI API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origin like http://localhost:8080
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(competitors.router, prefix="/api")
app.include_router(crawls.router, prefix="/api")
app.include_router(seo.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")
app.include_router(insights.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
