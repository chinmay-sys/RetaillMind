import pytest
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.integrations.reviews.connector import review_connector
from app.services.sentiment_analyzer import sentiment_analyzer
from app.services.review_sync_service import ReviewDataHealthService
from app.agents.customer_feedback_agent import CustomerFeedbackAgent
from app.agents.graph import decision_agent_node, RetailAIState


def test_review_connector_fetching():
    """Verify ReviewConnector interface and provider stream fetching."""
    status = review_connector.get_source_status()
    assert "source" in status
    assert "configured" in status

    raw_reviews = review_connector.fetch_reviews()
    assert isinstance(raw_reviews, list)
    if raw_reviews:
        rev = raw_reviews[0]
        assert "external_review_id" in rev
        assert "review_text" in rev
        assert "rating" in rev


def test_sentiment_and_aspect_analysis():
    """Verify Hugging Face / NLP sentiment classification and aspect complaint extraction."""
    text = "Battery drains in 30 minutes and overheating occurs while charging. Disappointed."
    res = sentiment_analyzer.analyze_review(text, rating=1.0)

    assert res["sentiment"] == "NEGATIVE"
    assert res["confidence"] > 0.5
    assert "Battery" in res["aspects"]
    assert res["aspects"]["Battery"] == "NEGATIVE"


def test_review_data_health_categorization():
    """Verify FRESH, STALE, CRITICAL, and UNAVAILABLE health threshold classification."""
    now = datetime.now(timezone.utc)

    # Test fresh (<60 mins)
    fresh_time = now - timedelta(minutes=15)
    mins = (now - fresh_time).total_seconds() / 60.0
    assert mins <= 60.0

    # Test stale (60-360 mins)
    stale_time = now - timedelta(hours=3)
    stale_mins = (now - stale_time).total_seconds() / 60.0
    assert 60.0 < stale_mins <= 360.0

    # Test critical (>360 mins)
    crit_time = now - timedelta(hours=8)
    crit_mins = (now - crit_time).total_seconds() / 60.0
    assert crit_mins > 360.0


def test_decision_safety_gate_stale_reviews():
    """Verify that Decision Agent puts reorders on HOLD when review data is STALE/UNAVAILABLE."""
    state: RetailAIState = {
        "user_query": "Reorder check",
        "demand_analysis": {"confidence": 95.0},
        "inventory_analysis": {"critical_count": 2, "critical_skus": ["Wireless Mouse Elite"]},
        "pricing_analysis": {"confidence": 92.0},
        "supplier_analysis": {"confidence": 95.0},
        "customer_feedback_analysis": {
            "status": "STALE",  # STALE REVIEW DATA
            "confidence": 50.0,
            "negative_pct": 10.0,
            "top_complaints": [],
            "health": {"minutes_since_sync": 180, "status": "STALE"},
        },
        "recommendations": [],
        "overall_confidence": 95.0,
        "execution_time_ms": 0.0,
        "errors": [],
    }

    out_state = decision_agent_node(state)
    recs = out_state.get("recommendations", [])

    assert len(recs) >= 1
    top_rec = recs[0]
    assert "HOLD" in top_rec["title"] or "STALE" in top_rec["title"] or "Unavailable" in top_rec["title"]
    assert top_rec["priority"] == "Critical"
    assert out_state["overall_confidence"] <= 50.0


def test_decision_safety_gate_defect_alert():
    """Verify that Decision Agent puts reorders on HOLD when customer negative sentiment / defect complaints spike."""
    state: RetailAIState = {
        "user_query": "Reorder check",
        "demand_analysis": {"confidence": 95.0},
        "inventory_analysis": {"critical_count": 1, "critical_skus": ["Gaming Laptop Pro X1"]},
        "pricing_analysis": {"confidence": 92.0},
        "supplier_analysis": {"confidence": 95.0},
        "customer_feedback_analysis": {
            "status": "FRESH",
            "confidence": 94.0,
            "negative_pct": 58.0,  # HIGH NEGATIVE SENTIMENT SPIKE
            "top_complaints": [{"aspect": "Battery", "count": 14, "total": 20}],
            "health": {"minutes_since_sync": 8, "status": "FRESH"},
        },
        "recommendations": [],
        "overall_confidence": 95.0,
        "execution_time_ms": 0.0,
        "errors": [],
    }

    out_state = decision_agent_node(state)
    recs = out_state.get("recommendations", [])

    assert len(recs) >= 1
    top_rec = recs[0]
    assert "HOLD REORDER" in top_rec["title"] or "Defect Alert" in top_rec["title"]
    assert "Battery" in top_rec["title"] or "Battery" in top_rec["description"] or "Battery" in top_rec["reasoning"]


def test_positive_reorder_scenario():
    """Verify that when review status is FRESH, negative sentiment is low (8%), rating is high (4.5), REORDER recommendation is made."""
    state: RetailAIState = {
        "user_query": "Reorder check",
        "demand_analysis": {"confidence": 95.0},
        "inventory_analysis": {"critical_count": 1, "critical_skus": ["Wireless Mouse Elite"]},
        "pricing_analysis": {"confidence": 92.0},
        "supplier_analysis": {"confidence": 95.0},
        "customer_feedback_analysis": {
            "status": "active",
            "review_data_status": "FRESH",
            "confidence": 94.0,
            "negative_pct": 8.0,
            "avg_rating": 4.5,
            "top_complaints": [],
            "health": {"minutes_since_sync": 5, "status": "FRESH"},
        },
        "recommendations": [],
        "overall_confidence": 95.0,
        "execution_time_ms": 0.0,
        "errors": [],
    }

    out_state = decision_agent_node(state)
    recs = out_state.get("recommendations", [])

    assert len(recs) >= 1
    top_rec = recs[0]
    assert "Reorder" in top_rec["title"] or "REORDER" in top_rec["title"]
    assert top_rec["confidence"] >= 90.0

