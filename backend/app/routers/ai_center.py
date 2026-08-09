"""
AI Decision Center router — multi-agent orchestrator execution & human-in-the-loop decision reviews.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.models.models import (
    AIRecommendation, RecommendationStatus, AuditLog, User,
)
from app.schemas.schemas import RecommendationReview
from app.dependencies import get_current_user
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
    current_user: User = Depends(get_current_user),
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

    # Create audit log entry regardless of mock or DB persistence
    audit = AuditLog(
        user_id=current_user.id,
        action=f"Recommendation {action_val}",
        entity_type="AIRecommendation",
        entity_id=review.recommendation_id,
        details=f"Manager {action_val} recommendation #{review.recommendation_id}"
                + (f" | Notes: {review.notes}" if review.notes else ""),
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "recommendation_id": review.recommendation_id,
        "new_status": action_val,
        "message": f"Recommendation #{review.recommendation_id} marked as '{action_val}'. Saved to audit log.",
        "reviewed_by": f"{current_user.first_name} {current_user.last_name}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
