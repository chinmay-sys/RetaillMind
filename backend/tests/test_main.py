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
        {
            "ds": (pd.Timestamp("2026-01-01") + pd.Timedelta(days=i)).strftime("%Y-%m-%d"),
            "y": 100 + i * 5,
        }
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
    import pandas as pd
    data = [
        {
            "ds": (pd.Timestamp("2026-01-01") + pd.Timedelta(days=i)).strftime("%Y-%m-%d"),
            "y": 100 + (i % 7) * 10,
        }
        for i in range(40)
    ]
    res = demand_forecaster.predict_future(data, days_ahead=14)
    
    assert "forecast_points" in res
    assert len(res["forecast_points"]) == 14
    assert "confidence" in res
    assert res["confidence"] > 0.0


def test_forecaster_invalid_date():
    """Test that malformed/invalid calendar dates raise ValueError and are not silently accepted."""
    import pandas as pd
    data = [
        {
            "ds": (pd.Timestamp("2026-01-01") + pd.Timedelta(days=i)).strftime("%Y-%m-%d"),
            "y": 100,
        }
        for i in range(7)
    ]
    data.append({"ds": "2026-01-32", "y": 100})
    df = pd.DataFrame(data)
    with pytest.raises(ValueError):
        demand_forecaster.engineer_features(df)
    with pytest.raises(ValueError):
        demand_forecaster.predict_future(data, days_ahead=7)


def test_langgraph_orchestrator():
    """Test LangGraph Multi-Agent pipeline execution."""
    res = langgraph_orchestrator.run_pipeline(user_query="Restock check")
    
    assert "agents" in res
    assert len(res["agents"]) == 6
    agent_ids = [a["id"] for a in res["agents"]]
    assert "demand" in agent_ids
    assert "inventory" in agent_ids
    assert "pricing" in agent_ids
    assert "supplier" in agent_ids
    assert "customer_feedback" in agent_ids
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


def test_human_approval_creates_po_with_timedelta():
    """Regression test: Verifies human approval calculates expected_delivery with timedelta and creates PO."""
    from app.database import SessionLocal, init_db
    from app.models.models import (
        AIRecommendation, RecommendationStatus, PurchaseOrder, PurchaseOrderItem,
        Product, Supplier, User, AuditLog
    )
    from app.schemas.schemas import RecommendationReview
    from app.routers.ai_center import review_decision

    init_db()
    db = SessionLocal()
    try:
        # Create test supplier and product
        supplier = db.query(Supplier).first()
        if not supplier:
            supplier = Supplier(name="Test Vendor", reliability_score=95.0, lead_time_days=3.0)
            db.add(supplier)
            db.flush()

        product = db.query(Product).first()
        if not product:
            product = Product(sku="TEST-SKU-01", name="Test Product", unit_cost=500.0, selling_price=900.0, supplier_id=supplier.id)
            db.add(product)
            db.flush()

        user = db.query(User).first()
        if not user:
            user = User(first_name="Test", last_name="Admin", email="testadmin@retailmind.ai", hashed_password="x")
            db.add(user)
            db.flush()

        # Create pending restock recommendation
        rec = AIRecommendation(
            title="Immediate Restock: Test Product",
            agent_name="Inventory Agent",
            priority="Critical",
            category="Inventory",
            description="Stock low",
            reasoning="Current stock below safety threshold",
            status=RecommendationStatus.PENDING,
            action_data={"product_id": product.id, "quantity": 150}
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

        # Execute approval
        review = RecommendationReview(
            recommendation_id=rec.id,
            action=RecommendationStatus.APPROVED,
            notes="Approved by QA Manager"
        )
        result = review_decision(review=review, db=db, current_user=user)

        assert result["status"] == "success"
        assert result["new_status"] == "Approved"

        # Verify PO created with timedelta expected_delivery
        po = db.query(PurchaseOrder).order_by(PurchaseOrder.id.desc()).first()
        assert po is not None
        assert po.status == "Approved"
        assert po.expected_delivery is not None
        assert po.total_cost == round(product.unit_cost * 150, 2)

        # Verify PO item
        po_item = db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == po.id).first()
        assert po_item is not None
        assert po_item.quantity == 150
        assert po_item.product_id == product.id

        # Verify AuditLog created
        audit = db.query(AuditLog).filter(
            AuditLog.entity_type == "AIRecommendation",
            AuditLog.entity_id == rec.id
        ).order_by(AuditLog.id.desc()).first()
        assert audit is not None
        assert "Approved" in audit.action

    finally:
        db.close()


def test_human_rejection_prevents_po_creation():
    """Regression test: Verifies human rejection marks status as Rejected without creating a PurchaseOrder."""
    from app.database import SessionLocal, init_db
    from app.models.models import AIRecommendation, RecommendationStatus, PurchaseOrder, User, AuditLog
    from app.schemas.schemas import RecommendationReview
    from app.routers.ai_center import review_decision

    init_db()
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            user = User(first_name="Test", last_name="Admin", email="testadmin2@retailmind.ai", hashed_password="x")
            db.add(user)
            db.flush()

        initial_po_count = db.query(PurchaseOrder).count()

        rec = AIRecommendation(
            title="Risky Restock: High Defect Item",
            agent_name="Inventory Agent",
            priority="High",
            category="Inventory",
            description="Stock low but quality complaints active",
            reasoning="Quality audit pending",
            status=RecommendationStatus.PENDING,
            action_data={"quantity": 100}
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

        # Execute rejection
        review = RecommendationReview(
            recommendation_id=rec.id,
            action=RecommendationStatus.REJECTED,
            notes="Rejected due to vendor defect investigation"
        )
        result = review_decision(review=review, db=db, current_user=user)

        assert result["status"] == "success"
        assert result["new_status"] == "Rejected"

        # Verify NO new PO was created
        final_po_count = db.query(PurchaseOrder).count()
        assert final_po_count == initial_po_count

        # Verify DB status updated
        db.refresh(rec)
        assert rec.status == RecommendationStatus.REJECTED

        # Verify AuditLog
        audit = db.query(AuditLog).filter(
            AuditLog.entity_type == "AIRecommendation",
            AuditLog.entity_id == rec.id
        ).order_by(AuditLog.id.desc()).first()
        assert audit is not None
        assert "Rejected" in audit.action

    finally:
        db.close()
