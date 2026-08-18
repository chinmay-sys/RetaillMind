"""
Focused Regression Tests for BUG-01 and BUG-02.
Verifies Review Dashboard schema compatibility and LLM Service fail-fast fallback handling.
"""
import pytest
from unittest.mock import MagicMock, patch
from app.services.llm_service import LLMService
from app.agents.customer_feedback_agent import customer_feedback_agent
from app.database import SessionLocal, init_db


def test_bug01_review_dashboard_schema():
    """
    BUG-01 Regression Test:
    Ensures customer_feedback_agent produces the exact schema expected by the frontend:
    - positive_pct (float)
    - negative_pct (float)
    - neutral_pct (float)
    - total_reviews (int)
    """
    init_db()
    db = SessionLocal()
    try:
        data = customer_feedback_agent.analyze_feedback(db)
        assert isinstance(data, dict)
        assert "positive_pct" in data
        assert "negative_pct" in data
        assert "neutral_pct" in data
        assert "total_reviews" in data
        assert isinstance(data["total_reviews"], int)
        assert isinstance(data["positive_pct"], (int, float))
    finally:
        db.close()


def test_bug01_empty_review_state_fallback():
    """
    BUG-01 Regression Test:
    Ensures empty review state returns valid 0/fallback schema without raising exceptions or NaN.
    """
    health = {"status": "UNAVAILABLE", "source": "NONE", "minutes_since_sync": None}
    empty_resp = customer_feedback_agent._build_empty_response(health)
    
    assert empty_resp["total_reviews"] == 0
    assert empty_resp["positive_pct"] == 0.0
    assert empty_resp["negative_pct"] == 0.0
    assert empty_resp["neutral_pct"] == 0.0
    assert empty_resp["avg_rating"] == 0.0


def test_bug02_llm_service_analytical_fallback_on_auth_error():
    """
    BUG-02 Regression Test:
    Ensures LLMService fails fast to analytical fallback when an unrecoverable auth/permission error occurs.
    """
    service = LLMService()
    service.provider = "gemini"
    service.api_key = "test_invalid_api_key"

    with patch("google.generativeai.GenerativeModel") as mock_model_cls:
        mock_instance = MagicMock()
        mock_instance.generate_content.side_effect = Exception("API_KEY_INVALID: The provided API key is not valid")
        mock_model_cls.return_value = mock_instance

        resp = service.generate_response(
            prompt="Pricing recommendation query",
            context="| Product | Current | Suggested |\n|:---|---:|---:|\n| Laptop | ₹50,000 | ₹52,000 |"
        )

        # Should fail fast and return structured fallback markdown without crashing
        assert resp is not None
        assert "| Product | Current | Suggested |" in resp
        # Ensure it didn't retry 3 times for a fatal auth error
        assert mock_instance.generate_content.call_count == 1


def test_bug02_llm_service_timeout_handling():
    """
    BUG-02 Regression Test:
    Ensures LLMService catches timeouts and provides immediate fallback without hanging.
    """
    service = LLMService()
    service.provider = "gemini"
    service.api_key = "test_api_key"

    with patch("google.generativeai.GenerativeModel") as mock_model_cls:
        mock_instance = MagicMock()
        mock_instance.generate_content.side_effect = Exception("DeadlineExceeded: 504 Gateway Timeout")
        mock_model_cls.return_value = mock_instance

        resp = service.generate_response(
            prompt="Inventory risk check",
            context="Current stock: 12 units (Safety stock: 20)"
        )

        assert resp is not None
        assert "Current stock: 12 units" in resp
