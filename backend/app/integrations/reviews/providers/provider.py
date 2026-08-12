from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime


class BaseReviewProvider(ABC):
    """Base Provider Interface for external review APIs (e.g., Shopify, E-Commerce REST APIs)."""

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns provider display name or connector handle."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if live production credentials are fully present in environment."""
        pass

    @abstractmethod
    def fetch_raw_reviews(self, since_timestamp: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetches raw review records from the provider API."""
        pass
