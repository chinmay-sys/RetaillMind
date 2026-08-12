import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.integrations.reviews.connector import review_connector
from app.services.review_sync_service import review_health_service
from app.agents.customer_feedback_agent import customer_feedback_agent
from app.agents.graph import langgraph_orchestrator
from app.models.models import CustomerReview, Product, AuditLog

logger = logging.getLogger("retailmind.routers.customer_reviews")

router = APIRouter(prefix="/api/v1/reviews", tags=["Customer Reviews & Feedback Intelligence"])


@router.get("/health")
def get_review_integration_health(db: Session = Depends(get_db)):
    """Returns real-time review data freshness status and connector integration health."""
    return review_health_service.get_health_status(db)


@router.get("/dashboard")
def get_review_dashboard_metrics(db: Session = Depends(get_db)):
    """Returns aggregate Customer Feedback Intelligence dashboard metrics."""
    return customer_feedback_agent.analyze_feedback(db)


@router.get("/list")
def list_customer_reviews(
    product_id: Optional[int] = Query(None, description="Filter by Product ID"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment: POSITIVE, NEUTRAL, NEGATIVE"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Lists stored customer reviews with sentiment and detected complaint aspect tags."""
    query = db.query(CustomerReview)
    if product_id:
        query = query.filter(CustomerReview.product_id == product_id)
    if sentiment:
        query = query.filter(CustomerReview.sentiment == sentiment.upper())

    total = query.count()
    reviews = query.order_by(CustomerReview.review_date.desc()).offset(offset).limit(limit).all()

    items = []
    for r in reviews:
        prod = db.query(Product).filter(Product.id == r.product_id).first()
        items.append({
            "id": r.id,
            "external_review_id": r.external_review_id,
            "product_id": r.product_id,
            "product_name": prod.name if prod else "Unknown Product",
            "product_sku": prod.sku if prod else "",
            "source": r.source,
            "review_text": r.review_text,
            "rating": r.rating,
            "review_date": r.review_date.isoformat() if r.review_date else None,
            "sentiment": r.sentiment,
            "sentiment_score": r.sentiment_score,
            "detected_aspects": r.detected_aspects or {},
            "last_synced_at": r.last_synced_at.isoformat() if r.last_synced_at else None,
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "reviews": items,
    }


@router.get("/product/{product_id}")
def get_product_review_intelligence(product_id: int, db: Session = Depends(get_db)):
    """Returns detailed feedback intelligence, aspect breakdown, and risk score for a specific product."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    analysis = customer_feedback_agent.analyze_feedback(db, product_id=product_id)
    return {
        "product": {
            "id": prod.id,
            "sku": prod.sku,
            "name": prod.name,
            "unit_cost": prod.unit_cost,
            "selling_price": prod.selling_price,
        },
        "intelligence": analysis,
    }


@router.post("/sync")
def trigger_manual_review_sync(db: Session = Depends(get_db)):
    """Triggers review connector synchronization against external review source."""
    result = review_connector.sync_reviews(db)
    # Run orchestrator to update decision cards after sync
    langgraph_orchestrator.run_pipeline(db=db)
    return result


@router.post("/webhook", status_code=200)
def receive_review_webhook(
    payload: Dict[str, Any],
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    Webhook endpoint for receiving near-real-time customer reviews from external platforms.
    Performs validation, identification, deduplicated storage, sentiment processing,
    and triggers AI decision graph re-evaluation.
    """
    logger.info(f"Received review webhook payload: {payload}")
    ext_id = payload.get("review_id") or payload.get("id")
    if not ext_id:
        raise HTTPException(status_code=400, detail="Missing required 'review_id' field in webhook payload")

    source = payload.get("source") or review_connector.provider.get_provider_name()
    sku = payload.get("product_sku")
    product_id = payload.get("product_id")

    if not product_id and sku:
        prod = db.query(Product).filter(Product.sku == sku).first()
        if prod:
            product_id = prod.id

    if not product_id:
        first_p = db.query(Product).first()
        product_id = first_p.id if first_p else 1

    review_text = payload.get("review_text", "")
    rating = float(payload.get("rating", 3.0))

    from app.services.sentiment_analyzer import sentiment_analyzer
    analysis = sentiment_analyzer.analyze_review(review_text, rating)

    existing = db.query(CustomerReview).filter(
        CustomerReview.external_review_id == str(ext_id),
        CustomerReview.source == source
    ).first()

    now = datetime.now(timezone.utc)

    if not existing:
        new_rev = CustomerReview(
            external_review_id=str(ext_id),
            product_id=product_id,
            source=source,
            review_text=review_text,
            rating=rating,
            review_date=now,
            sentiment=analysis["sentiment"],
            sentiment_score=analysis["confidence"],
            detected_aspects=analysis["aspects"],
            processed_at=now,
            last_synced_at=now,
        )
        db.add(new_rev)
        db.commit()

    # Re-evaluate multi-agent pipeline with new signal
    graph_res = langgraph_orchestrator.run_pipeline(db=db)

    return {
        "status": "success",
        "review_id": ext_id,
        "sentiment": analysis["sentiment"],
        "detected_aspects": analysis["aspects"],
        "graph_evaluation": graph_res,
    }


@router.post("/trigger-demo-event")
def trigger_demo_review_event(
    review_text: Optional[str] = Query(None),
    rating: float = Query(1.0),
    product_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Live Demonstration Endpoint:
    Simulates automatic external review arrival (e.g. critical battery/quality defect),
    runs sentiment & aspect analysis, updates Customer Feedback Agent, and triggers the
    LangGraph Orchestrator & Safety Gate to re-evaluate decision cards.
    """
    now = datetime.now(timezone.utc)
    ext_id = f"demo_live_{int(now.timestamp())}"

    prod = None
    if product_id:
        prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        prod = db.query(Product).first()

    p_id = prod.id if prod else 1
    p_name = prod.name if prod else "Gaming Laptop Pro X1"

    text = review_text or (
        f"Critical Issue with {p_name}: Battery drains in under 30 minutes and the bottom chassis overheats "
        "dangerously while charging. Extremely poor quality control! Requesting full return."
    )

    from app.services.sentiment_analyzer import sentiment_analyzer
    analysis = sentiment_analyzer.analyze_review(text, rating)

    source_name = review_connector.provider.get_provider_name()

    new_rev = CustomerReview(
        external_review_id=ext_id,
        product_id=p_id,
        source=source_name,
        review_text=text,
        rating=rating,
        review_date=now,
        sentiment=analysis["sentiment"],
        sentiment_score=analysis["confidence"],
        detected_aspects=analysis["aspects"],
        processed_at=now,
        last_synced_at=now,
    )
    from app.models.models import ReviewSyncHealth
    health = db.query(ReviewSyncHealth).filter(ReviewSyncHealth.source == source_name).first()
    if not health:
        health = ReviewSyncHealth(
            source=source_name,
            last_successful_sync=now,
            last_attempted_sync=now,
            number_of_reviews_received=db.query(CustomerReview).count() + 1,
            sync_status="FRESH",
            freshness_threshold_minutes=60,
        )
        db.add(health)
    else:
        health.last_successful_sync = now
        health.last_attempted_sync = now
        health.sync_status = "FRESH"
        health.number_of_reviews_received = db.query(CustomerReview).count() + 1

    # Log to audit trail
    log_entry = AuditLog(
        user_id=1,
        action="AUTOMATIC_REVIEW_INGESTION",
        entity_type="CustomerReview",
        entity_id=0,
        details=f"Auto-ingested review '{ext_id}' from {source_name}. Sentiment: {analysis['sentiment']}, Aspects: {analysis['aspects']}"
    )
    db.add(log_entry)
    db.commit()

    # Re-run multi-agent orchestrator with safety gates
    orchestration_output = langgraph_orchestrator.run_pipeline(db=db)

    return {
        "event": "AUTOMATIC_REVIEW_INGESTION_DEMO",
        "ingested_review": {
            "external_review_id": ext_id,
            "product": p_name,
            "rating": rating,
            "review_text": text,
            "sentiment": analysis["sentiment"],
            "confidence": analysis["confidence"],
            "detected_aspects": analysis["aspects"],
            "source": source_name,
        },
        "feedback_intelligence": customer_feedback_agent.analyze_feedback(db, product_id=p_id),
        "orchestrated_decisions": orchestration_output.get("recommendations", []),
    }
