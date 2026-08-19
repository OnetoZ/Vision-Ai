import asyncio
from database import init_db, async_session
from sqlalchemy import select
from models.competitor import Competitor
from crawler.crawler import run_crawl
import uuid
import os

async def main():
    await init_db()
    async with async_session() as db:
        stmt = select(Competitor)
        competitors = (await db.execute(stmt)).scalars().all()
        
    for c in competitors:
        print(f"Crawling {c.name}...")
        crawl_id = str(uuid.uuid4())
        await run_crawl(c.id, crawl_id, lambda: async_session())
        print(f"Done crawling {c.name}.")

if __name__ == "__main__":
    asyncio.run(main())
