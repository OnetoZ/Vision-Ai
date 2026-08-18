import asyncio
from database import init_db, async_session
from sqlalchemy import select
from models.competitor import Competitor
from models.user import User
from crawler.crawler import run_crawl
import uuid

async def main():
    async with async_session() as db:
        # Create user if needed
        user = (await db.execute(select(User))).scalars().first()
        if not user:
            user = User(id="default-user", email="test@example.com", password_hash="dummy")
            db.add(user)
            await db.commit()
            
        c = Competitor(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="onetoz",
            url="https://www.onetoztechnologies.com/",
            status="active"
        )
        db.add(c)
        await db.commit()
        
        print(f"Crawling {c.name}...")
        crawl_id = str(uuid.uuid4())
        await run_crawl(c.id, crawl_id, lambda: async_session())
        print(f"Done crawling {c.name}.")

if __name__ == "__main__":
    asyncio.run(main())
