import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.routers import (
    auth, sales, inventory, forecast, pricing,
    suppliers, ai_center, chat, reports, audit
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retailmind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and run seed if DB is empty."""
    logger.info("🚀 Initializing RetailMind AI database...")
    init_db()
    # Auto-seed on first run
    db = SessionLocal()
    try:
        from app.models.models import Role
        if not db.query(Role).first():
            logger.info("🌱 Empty database detected — running seed...")
            from app.seed import seed
            seed()
            logger.info("✅ Database seeded successfully")
        else:
            logger.info("✅ Database already initialized")
    finally:
        db.close()
    yield
    logger.info("🛑 Shutting down RetailMind AI")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend Decision Intelligence API for RetailMind AI",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(sales.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(pricing.router, prefix=settings.API_V1_STR)
app.include_router(suppliers.router, prefix=settings.API_V1_STR)
app.include_router(ai_center.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Real health check — actually tests DB connectivity."""
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )
        db_ok = True
        db.close()
    except Exception:
        pass

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": settings.VERSION,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
