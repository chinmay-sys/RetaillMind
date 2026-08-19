import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.routers import (
    auth, sales, inventory, forecast, pricing,
    suppliers, ai_center, chat, reports, audit, customer_reviews
)
from app.services.review_sync_service import review_sync_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retailmind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables, run seed, and start review sync background scheduler."""
    logger.info("🚀 Initializing RetailMind AI database...")
    init_db()
    
    needs_seed = False
    force_seed = False
    with SessionLocal() as db:
        try:
            from app.models.models import Product, Sale
            old_mock = db.query(Product).filter(Product.sku == "GLP-X1-001").first()
            no_products = db.query(Product).first() is None
            no_sales = db.query(Sale).first() is None
            
            if old_mock:
                needs_seed = True
                force_seed = True
            elif no_products or no_sales:
                needs_seed = True
                force_seed = False
            else:
                logger.info("✅ Database already initialized with Kaggle dataset")
        except Exception as e:
            logger.warning(f"⚠️ Lifespan initialization check notice: {e}")
            needs_seed = True

    if needs_seed:
        logger.info("🌱 Seeding database with real Kaggle Retail dataset...")
        try:
            from app.seed import seed
            seed(force=force_seed)
            logger.info("✅ Database seeded with Kaggle dataset successfully")
        except Exception as se:
            logger.warning(f"⚠️ Seeding notice: {se}")

    # Start background review polling scheduler
    await review_sync_scheduler.start()
    yield

    # Shutdown
    await review_sync_scheduler.stop()
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
app.include_router(customer_reviews.router)

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
