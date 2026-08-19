from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

# Setup SQLAlchemy Engine — handle SQLite vs PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    poolclass=NullPool,  # Fresh connection per request — prevents SQLite lock contention
)

# Enable WAL mode, busy timeout and foreign keys for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")   # 30-second wait before giving up
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all database tables and ensure user schema compatibility."""
    from app.models.models import (
        Base, Role, User, Category, Supplier, Product,
        Inventory, Sale, PurchaseOrder, PurchaseOrderItem, Forecast,
        AIRecommendation, Report, AuditLog, CustomerReview, ReviewSyncHealth
    )
    Base.metadata.create_all(bind=engine)

    # Safe column migration for existing SQLite / Postgres databases
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("users")]
            with engine.connect() as conn:
                if "email_verified" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1"))
                if "verification_otp_hash" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verification_otp_hash VARCHAR(255)"))
                if "verification_expires_at" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verification_expires_at TIMESTAMP"))
                if "failed_otp_attempts" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN failed_otp_attempts INTEGER DEFAULT 0"))
                if "last_otp_sent_at" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN last_otp_sent_at TIMESTAMP"))
                conn.commit()
    except Exception as e:
        # Non-critical warning if columns already present or engine handles it
        pass
