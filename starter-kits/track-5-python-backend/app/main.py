from fastapi import FastAPI
from app.routes import items, health
from app.models.database import engine, Base

app = FastAPI(title="Python Backend Starter", version="0.1.0")

app.include_router(health.router, tags=["health"])
app.include_router(items.router, prefix="/api/v1/items", tags=["items"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
