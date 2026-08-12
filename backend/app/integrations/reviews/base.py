from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime


class ReviewConnector(ABC):
    """Abstract Base Class for Customer Review Connectors."""

    @abstractmethod
    def fetch_reviews(self, since_timestamp: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch reviews newer than since_timestamp from external review source."""
        pass

    @abstractmethod
    def get_last_sync(self) -> Optional[datetime]:
        """Returns the timestamp of the last successful synchronization."""
        pass

    @abstractmethod
    def get_source_status(self) -> Dict[str, Any]:
        """Returns health status, provider name, and configuration details."""
        pass
