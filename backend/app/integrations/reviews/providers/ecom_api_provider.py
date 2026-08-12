import os
import requests
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.integrations.reviews.providers.provider import BaseReviewProvider

logger = logging.getLogger("retailmind.integrations.reviews.ecom")


class ECommerceReviewProvider(BaseReviewProvider):
    """
    Legitimate E-Commerce / Review API Provider Connector.
    Reads credentials from environment:
    - REVIEW_API_URL
    - REVIEW_API_KEY
    - REVIEW_STORE_ID
    If credentials are missing, operates as an explicitly marked DEMO REVIEW SOURCE
    with simulated live connector capabilities for developer evaluation.
    """

    def __init__(self):
        self.api_url = os.getenv("REVIEW_API_URL", "").strip()
        self.api_key = os.getenv("REVIEW_API_KEY", "").strip()
        self.store_id = os.getenv("REVIEW_STORE_ID", "").strip()

    def get_provider_name(self) -> str:
        if self.is_configured():
            return f"ECommerce Review API ({self.store_id or 'Authorized Portal'})"
        return "DEMO REVIEW SOURCE (Simulated Connector)"

    def is_configured(self) -> bool:
        return bool(self.api_url and (self.api_key or self.store_id))

    def fetch_raw_reviews(self, since_timestamp: Optional[datetime] = None) -> List[Dict[str, Any]]:
        if self.is_configured():
            try:
                headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                params = {}
                if since_timestamp:
                    params["since"] = since_timestamp.isoformat()
                if self.store_id:
                    params["store_id"] = self.store_id

                resp = requests.get(f"{self.api_url}/reviews", headers=headers, params=params, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("reviews", [])
                else:
                    logger.error(f"External Review API returned HTTP {resp.status_code}: {resp.text}")
                    return []
            except Exception as e:
                logger.error(f"Failed to fetch reviews from external API {self.api_url}: {e}")
                return []
        else:
            logger.info("External REVIEW_API_URL not configured. Operating with DEMO REVIEW SOURCE annotation.")
            return self._generate_simulated_stream(since_timestamp)

    def _generate_simulated_stream(self, since_timestamp: Optional[datetime]) -> List[Dict[str, Any]]:
        """Generates stream payload marked explicitly as DEMO REVIEW SOURCE."""
        now = datetime.now(timezone.utc)
        return [
            {
                "external_review_id": f"rev_demo_{int(now.timestamp())}_1",
                "product_sku": "LAP-PRO-X1",
                "review_text": "Battery drains in under 45 minutes and the bottom panel gets dangerously hot while charging. Very disappointed with product quality.",
                "rating": 1.0,
                "review_date": now.isoformat(),
                "customer_name": "Rajesh Kumar",
                "source": self.get_provider_name(),
            }
        ]
