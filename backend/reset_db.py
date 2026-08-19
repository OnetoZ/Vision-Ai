import asyncio
import os
from database import init_db, engine, Base
from models import * # to ensure all models are registered

async def reset():
    # Remove old DB file to start fresh
    if os.path.exists("vision_ai.db"):
        os.remove("vision_ai.db")
    print("Old DB removed.")
    
    # Initialize new DB
    await init_db()
    print("New DB initialized with all tables.")

if __name__ == "__main__":
    asyncio.run(reset())
