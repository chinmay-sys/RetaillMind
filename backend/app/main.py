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
    """Startup: create tables and run seed with real Kaggle dataset."""
    logger.info("🚀 Initializing RetailMind AI database...")
    init_db()
    db = SessionLocal()
    try:
        from app.models.models import Product
        # Check if old mock data exists (GLP-X1) or if database is empty
        old_mock = db.query(Product).filter(Product.sku == "GLP-X1-001").first()
        no_products = db.query(Product).first() is None
        
        if old_mock or no_products:
            logger.info("🌱 Seeding database with real Kaggle Retail dataset...")
            try:
                from app.seed import seed
                seed(force=True)
                logger.info("✅ Database seeded with Kaggle dataset successfully")
            except Exception as se:
                logger.warning(f"⚠️ Seeding notice: {se}")
        else:
            logger.info("✅ Database already initialized with Kaggle dataset")
    except Exception as e:
        logger.warning(f"⚠️ Lifespan initialization notice: {e}")
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

@app.post("/api/v1/datasets/kaggle/sync")
@app.get("/api/v1/datasets/kaggle/sync")
def sync_kaggle_dataset(dataset: str = "ahmdayman/retail-sales-dataset"):
    """Re-seeds database with local dataset or Kaggle download."""
    try:
        from app.seed import seed
        seed(force=True)
        return {
            "status": "success",
            "message": "Database re-seeded successfully with retail dataset",
            "dataset": dataset,
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "detail": traceback.format_exc()
        }




if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
