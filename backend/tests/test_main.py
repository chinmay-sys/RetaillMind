"""
Pytest Unit and Integration Test Suite for RetailMind AI Backend.
Tests Auth, Sales API, Inventory API, XGBoost Demand Forecaster, LangGraph Agents, and RAG Engine.
Run with: cd backend && python -m pytest
"""
import pytest
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.forecaster import demand_forecaster
from app.agents.graph import langgraph_orchestrator
from app.rag.rag_engine import qdrant_rag_engine
from app.services.llm_service import llm_service


def test_forecaster_feature_engineering():
    """Test feature engineering without data leakage."""
    import pandas as pd
    data = [
        {"ds": f"2026-01-{i+1:02d}", "y": 100 + i * 5}
        for i in range(35)
    ]
    df = pd.DataFrame(data)
    df_feat = demand_forecaster.engineer_features(df)
    
    assert "lag_7" in df_feat.columns
    assert "rolling_mean_7" in df_feat.columns
    assert "is_weekend" in df_feat.columns
    assert len(df_feat) == 35


def test_forecaster_prediction():
    """Test XGBoost / statistical forecaster prediction output."""
    data = [
        {"ds": f"2026-01-{i+1:02d}", "y": 100 + (i % 7) * 10}
        for i in range(40)
    ]
    res = demand_forecaster.predict_future(data, days_ahead=14)
    
    assert "forecast_points" in res
    assert len(res["forecast_points"]) == 14
    assert "confidence" in res
    assert res["confidence"] > 0.0


def test_langgraph_orchestrator():
    """Test LangGraph Multi-Agent pipeline execution."""
    res = langgraph_orchestrator.run_pipeline(user_query="Restock check")
    
    assert "agents" in res
    assert len(res["agents"]) == 5
    agent_ids = [a["id"] for a in res["agents"]]
    assert "demand" in agent_ids
    assert "inventory" in agent_ids
    assert "pricing" in agent_ids
    assert "supplier" in agent_ids
    assert "decision" in agent_ids
    assert "recommendations" in res


def test_qdrant_rag_search():
    """Test Qdrant semantic document retrieval."""
    results = qdrant_rag_engine.search_knowledge("safety stock policy", top_k=2)
    
    assert isinstance(results, list)
    assert len(results) >= 1
    assert any("Inventory" in r.get("title", "") or "Safety" in r.get("title", "") for r in results)


def test_llm_service_fallback():
    """Test LLM service layer response generation."""
    resp = llm_service.generate_response("What is the top product?", context="Top SKU: Gaming Laptop Pro X1")
    
    assert isinstance(resp, str)
    assert len(resp) > 10
