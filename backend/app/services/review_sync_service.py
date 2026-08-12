import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.models import ReviewSyncHealth, CustomerReview
from app.integrations.reviews.connector import review_connector

logger = logging.getLogger("retailmind.services.review_sync")


class ReviewDataHealthService:
    """
    Monitors Customer Review Data Freshness & Source Integration Health.
    Categorizes integration state into:
    - FRESH (< 60 minutes)
    - STALE (60 - 360 minutes / 1-6 hours)
    - CRITICAL (> 360 minutes / > 6 hours)
    - UNAVAILABLE (Never synced or connector offline)
    """

    FRESH_THRESHOLD_MINUTES = int(os.getenv("REVIEW_FRESHNESS_FRESH_MINUTES", "60"))
    CRITICAL_THRESHOLD_MINUTES = int(os.getenv("REVIEW_FRESHNESS_CRITICAL_MINUTES", "360"))

    @classmethod
    def get_health_status(cls, db: Session, source: Optional[str] = None) -> Dict[str, Any]:
        source_name = source or review_connector.provider.get_provider_name()
        health = db.query(ReviewSyncHealth).filter(ReviewSyncHealth.source == source_name).first()
        if not health:
            health = db.query(ReviewSyncHealth).order_by(ReviewSyncHealth.updated_at.desc()).first()

        total_in_db = db.query(CustomerReview).count()

        if total_in_db > 0:
            from sqlalchemy import func
            latest_review_date = db.query(func.max(CustomerReview.review_date)).scalar()
            now = datetime.now(timezone.utc)

            if not health:
                health = ReviewSyncHealth(
                    source=source_name,
                    last_successful_sync=latest_review_date or now,
                    last_attempted_sync=now,
                    number_of_reviews_received=total_in_db,
                    sync_status="FRESH",
                    freshness_threshold_minutes=cls.FRESH_THRESHOLD_MINUTES,
                )
                db.add(health)
                db.commit()
                db.refresh(health)
            elif not health.last_successful_sync:
                health.last_successful_sync = latest_review_date or now
                health.number_of_reviews_received = total_in_db
                db.commit()

            last_sync = health.last_successful_sync or latest_review_date or now
            if last_sync.tzinfo is None:
                last_sync = last_sync.replace(tzinfo=timezone.utc)

            minutes_since_sync = round((now - last_sync).total_seconds() / 60.0, 1)

            if minutes_since_sync <= cls.FRESH_THRESHOLD_MINUTES:
                status = "FRESH"
            elif minutes_since_sync <= cls.CRITICAL_THRESHOLD_MINUTES:
                status = "STALE"
            else:
                status = "CRITICAL"

            if health.sync_status != status and health.sync_status != "ERROR":
                health.sync_status = status
                db.commit()

            return {
                "status": status,
                "source": health.source or source_name,
                "last_sync": last_sync.isoformat(),
                "minutes_since_sync": minutes_since_sync,
                "number_of_reviews_received": total_in_db,
                "error_message": health.error_message,
                "freshness_threshold_minutes": cls.FRESH_THRESHOLD_MINUTES,
                "configured": review_connector.provider.is_configured(),
            }

        if not health or not health.last_successful_sync:
            return {
                "status": "UNAVAILABLE",
                "source": source_name,
                "last_sync": None,
                "minutes_since_sync": None,
                "number_of_reviews_received": 0,
                "error_message": health.error_message if health else "Connector not initialized",
                "freshness_threshold_minutes": cls.FRESH_THRESHOLD_MINUTES,
                "configured": review_connector.provider.is_configured(),
            }

        now = datetime.now(timezone.utc)
        last_sync = health.last_successful_sync
        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(tzinfo=timezone.utc)

        minutes_since_sync = round((now - last_sync).total_seconds() / 60.0, 1)

        if minutes_since_sync <= cls.FRESH_THRESHOLD_MINUTES:
            status = "FRESH"
        elif minutes_since_sync <= cls.CRITICAL_THRESHOLD_MINUTES:
            status = "STALE"
        else:
            status = "CRITICAL"

        if health.sync_status != status and health.sync_status != "ERROR":
            health.sync_status = status
            db.commit()

        return {
            "status": status,
            "source": source_name,
            "last_sync": last_sync.isoformat(),
            "minutes_since_sync": minutes_since_sync,
            "number_of_reviews_received": health.number_of_reviews_received,
            "error_message": health.error_message,
            "freshness_threshold_minutes": cls.FRESH_THRESHOLD_MINUTES,
            "configured": review_connector.provider.is_configured(),
        }


class ReviewSyncScheduler:
    """Background Scheduler managing automated 15-minute review ingestion polling."""

    def __init__(self, polling_interval_minutes: int = 15):
        self.polling_interval_minutes = int(os.getenv("REVIEW_POLLING_INTERVAL_MINUTES", str(polling_interval_minutes)))
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        logger.info(f"🚀 Started ReviewSyncScheduler background job (polling every {self.polling_interval_minutes} mins)")
        self._task = asyncio.create_task(self._poll_loop())

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            logger.info("Stopped ReviewSyncScheduler background task")

    async def _poll_loop(self):
        while self._running:
            try:
                logger.info("⏰ ReviewSyncScheduler triggering periodic review sync...")
                db = SessionLocal()
                try:
                    result = review_connector.sync_reviews(db)
                    logger.info(f"Sync complete: Ingested {result.get('ingested_count', 0)} new reviews ({result.get('status')})")
                finally:
                    db.close()
            except Exception as e:
                logger.error(f"Error in ReviewSyncScheduler poll loop: {e}")

            await asyncio.sleep(self.polling_interval_minutes * 60)


review_health_service = ReviewDataHealthService()
review_sync_scheduler = ReviewSyncScheduler()
