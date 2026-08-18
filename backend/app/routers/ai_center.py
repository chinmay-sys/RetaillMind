"""
AI Decision Center router — multi-agent orchestrator execution & human-in-the-loop decision reviews.
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.models.models import (
    AIRecommendation, RecommendationStatus, AuditLog, User,
)
from app.schemas.schemas import RecommendationReview
from app.dependencies import get_current_user, require_manager_or_above
from app.agents.orchestrator import ai_orchestrator

router = APIRouter(prefix="/ai-center", tags=["AI Decision Center"])


@router.get("/status")
def get_ai_orchestrator_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns real-time status of all domain agents with data-driven analysis,
    plus pending AI recommendations from DB.
    """
    return ai_orchestrator.run_full_pipeline(db=db)


@router.post("/pipeline/run")
def trigger_pipeline_run(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    On-Demand Multi-Agent Pipeline Execution: Re-analyzes database state across all 5 agents,
    resolves conflicts, and returns updated agent confidences & recommendations.
    """
    result = ai_orchestrator.run_full_pipeline(db=db)

    # Log action to Audit Trail
    audit = AuditLog(
        user_id=current_user.id,
        action="Run AI Pipeline",
        entity_type="AIOrchestrator",
        details="Manager manually triggered full multi-agent pipeline sync",
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": "Multi-Agent DAG pipeline execution completed successfully.",
        "data": result,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/agents/{agent_id}/run")
def trigger_single_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    On-Demand Single Agent Execution: Re-analyzes domain state for a specific agent (demand, inventory, pricing, supplier).
    """
    try:
        agent_result = ai_orchestrator.run_single_agent(agent_id=agent_id, db=db)

        # Audit log
        audit = AuditLog(
            user_id=current_user.id,
            action=f"Run Agent: {agent_id.capitalize()}",
            entity_type="SpecializedAgent",
            details=f"Manager re-triggered {agent_result.get('name')} analysis",
        )
        db.add(audit)
        db.commit()

        return {
            "status": "success",
            "message": f"Agent '{agent_result.get('name')}' executed successfully.",
            "agent": agent_result,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))


@router.post("/decisions/review")
def review_decision(
    review: RecommendationReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_above),
):
    """
    Human-in-the-Loop: Manager approves, modifies, or rejects an AI recommendation.
    Persists the decision to the database and creates an audit log entry.
    """
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == review.recommendation_id).first()
    
    action_val = review.action.value if hasattr(review.action, 'value') else str(review.action)

    if rec:
        rec.status = review.action
        rec.reviewed_by = current_user.id
        rec.reviewed_at = datetime.now(timezone.utc)
        rec.manager_notes = review.notes

        # ── STATEFUL BUSINESS ACTION EXECUTION UPON APPROVAL ──
        if action_val == "Approved":
            from app.models.models import PurchaseOrder, PurchaseOrderItem, Product, Supplier
            
            # Action 1: Restock recommendation -> Create Purchase Order
            if rec.category == "Inventory" or "Restock" in rec.title or "Reorder" in rec.title:
                supplier = db.query(Supplier).order_by(Supplier.rank).first()
                supplier_id = supplier.id if supplier else 1
                
                # Fetch product
                prod = None
                if rec.action_data and "product_id" in rec.action_data:
                    prod = db.query(Product).filter(Product.id == rec.action_data["product_id"]).first()
                if not prod:
                    prod = db.query(Product).first()

                if prod:
                    import uuid
                    po_num = f"PO-AUTO-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
                    qty = rec.action_data.get("quantity", 200) if rec.action_data else 200
                    total = round(prod.unit_cost * qty, 2)
                    
                    new_po = PurchaseOrder(
                        po_number=po_num,
                        supplier_id=supplier_id,
                        total_cost=total,
                        status="Approved",
                        order_date=datetime.now(timezone.utc),
                        expected_delivery=datetime.now(timezone.utc) + timedelta(days=4)
                    )
                    db.add(new_po)
                    db.flush()
                    
                    po_item = PurchaseOrderItem(
                        purchase_order_id=new_po.id,
                        product_id=prod.id,
                        quantity=qty,
                        unit_price=prod.unit_cost,
                        total_price=total
                    )
                    db.add(po_item)

            # Action 2: Pricing recommendation -> Update Product selling price
            elif rec.category == "Pricing" or "Price" in rec.title:
                if rec.action_data and "product_id" in rec.action_data and "new_price" in rec.action_data:
                    prod = db.query(Product).filter(Product.id == rec.action_data["product_id"]).first()
                    if prod:
                        prod.selling_price = float(rec.action_data["new_price"])
                elif rec.action_data and "product_id" in rec.action_data:
                    prod = db.query(Product).filter(Product.id == rec.action_data["product_id"]).first()
                    if prod and prod.suggested_price:
                        prod.selling_price = prod.suggested_price

    # Create audit log entry
    audit = AuditLog(
        user_id=current_user.id,
        action=f"Recommendation {action_val}",
        entity_type="AIRecommendation",
        entity_id=review.recommendation_id,
        details=f"Manager {action_val} recommendation #{review.recommendation_id} | Business action executed."
                + (f" Notes: {review.notes}" if review.notes else ""),
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "recommendation_id": review.recommendation_id,
        "new_status": action_val,
        "message": f"Recommendation #{review.recommendation_id} marked as '{action_val}'. Business action executed and saved to DB.",
        "reviewed_by": f"{current_user.first_name} {current_user.last_name}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

