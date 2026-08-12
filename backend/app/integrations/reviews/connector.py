import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.integrations.reviews.base import ReviewConnector
from app.integrations.reviews.providers.ecom_api_provider import ECommerceReviewProvider
from app.models.models import CustomerReview, ReviewSyncHealth, Product, Customer

logger = logging.getLogger("retailmind.integrations.reviews.connector")


class DefaultReviewConnector(ReviewConnector):
    """
    Main ReviewConnector implementation combining provider stream, normalization,
    deduplication, and database persistence.
    """

    def __init__(self, provider: Optional[Any] = None):
        self.provider = provider or ECommerceReviewProvider()

    def get_source_status(self) -> Dict[str, Any]:
        return {
            "source": self.provider.get_provider_name(),
            "configured": self.provider.is_configured(),
            "credential_requirements": {
                "REVIEW_API_URL": bool(os.getenv("REVIEW_API_URL")),
                "REVIEW_API_KEY": bool(os.getenv("REVIEW_API_KEY")),
                "REVIEW_STORE_ID": bool(os.getenv("REVIEW_STORE_ID")),
            }
        }

    def get_last_sync(self, db: Optional[Session] = None) -> Optional[datetime]:
        if not db:
            return None
        health = db.query(ReviewSyncHealth).filter(ReviewSyncHealth.source == self.provider.get_provider_name()).first()
        return health.last_successful_sync if health else None

    def fetch_reviews(self, since_timestamp: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self.provider.fetch_raw_reviews(since_timestamp)

    def sync_reviews(self, db: Session, since_timestamp: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Executes full review synchronization:
        Fetch -> Normalize -> Deduplicate -> Store -> Process NLP -> Update Health.
        """
        start_time = datetime.now(timezone.utc)
        source_name = self.provider.get_provider_name()

        health = db.query(ReviewSyncHealth).filter(ReviewSyncHealth.source == source_name).first()
        if not health:
            health = ReviewSyncHealth(
                source=source_name,
                sync_status="UNAVAILABLE",
                freshness_threshold_minutes=60
            )
            db.add(health)
            db.commit()
            db.refresh(health)

        health.last_attempted_sync = start_time

        try:
            effective_since = since_timestamp or health.last_successful_sync
            raw_reviews = self.fetch_reviews(effective_since)
            ingested_count = 0

            from app.services.sentiment_analyzer import sentiment_analyzer

            for r in raw_reviews:
                ext_id = r.get("external_review_id")
                if not ext_id:
                    continue

                # Deduplication check: (external_review_id, source)
                existing = db.query(CustomerReview).filter(
                    CustomerReview.external_review_id == ext_id,
                    CustomerReview.source == source_name
                ).first()
                if existing:
                    continue

                # Map product SKU or ID
                product_id = r.get("product_id")
                if not product_id and r.get("product_sku"):
                    prod = db.query(Product).filter(Product.sku == r.get("product_sku")).first()
                    if prod:
                        product_id = prod.id

                if not product_id:
                    # Fallback to first available product if unmapped
                    first_prod = db.query(Product).first()
                    if first_prod:
                        product_id = first_prod.id
                    else:
                        continue

                review_text = r.get("review_text", "")
                rating = float(r.get("rating", 3.0))
                review_date_raw = r.get("review_date")
                if isinstance(review_date_raw, str):
                    try:
                        review_date = datetime.fromisoformat(review_date_raw.replace("Z", "+00:00"))
                    except Exception:
                        review_date = datetime.now(timezone.utc)
                elif isinstance(review_date_raw, datetime):
                    review_date = review_date_raw
                else:
                    review_date = datetime.now(timezone.utc)

                # NLP Sentiment & Aspect Analysis
                analysis = sentiment_analyzer.analyze_review(review_text, rating)

                new_review = CustomerReview(
                    external_review_id=ext_id,
                    product_id=product_id,
                    source=source_name,
                    review_text=review_text,
                    rating=rating,
                    review_date=review_date,
                    sentiment=analysis["sentiment"],
                    sentiment_score=analysis["confidence"],
                    detected_aspects=analysis["aspects"],
                    processed_at=datetime.now(timezone.utc),
                    last_synced_at=start_time,
                )
                db.add(new_review)
                ingested_count += 1

            health.last_successful_sync = start_time
            health.number_of_reviews_received = (health.number_of_reviews_received or 0) + ingested_count
            health.sync_status = "FRESH"
            health.error_message = None
            db.commit()

            return {
                "source": source_name,
                "ingested_count": ingested_count,
                "sync_timestamp": start_time.isoformat(),
                "status": "FRESH"
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Error during review sync: {e}")
            health.sync_status = "ERROR"
            health.error_message = str(e)
            db.commit()
            return {
                "source": source_name,
                "ingested_count": 0,
                "status": "ERROR",
                "error": str(e)
            }


review_connector = DefaultReviewConnector()
