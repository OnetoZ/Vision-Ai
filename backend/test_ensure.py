import asyncio
from database import async_session
from models.user import User
from models.competitor import Competitor
from sqlalchemy import select
from routers.auth import ensure_self_competitor

async def main():
    async with async_session() as db:
        stmt = select(User).limit(1)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        print("User:", user.email)
        try:
            await ensure_self_competitor(user, db, None)
            print("Successfully ran ensure_self_competitor")
        except Exception as e:
            print("Error:", str(e))
            import traceback
            traceback.print_exc()

asyncio.run(main())
