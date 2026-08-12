import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import CustomerReview, Product, Sale
from app.services.review_sync_service import review_health_service

logger = logging.getLogger("retailmind.agents.customer_feedback")


class CustomerFeedbackAgent:
    """
    Customer Feedback Intelligence Agent.
    Analyzes real customer reviews stored in PostgreSQL database.
    Calculates sentiment distribution, negative trends, aspect complaints,
    product risk scores, and automatic defect alerts.
    """

    def analyze_feedback(self, db: Session, product_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Executes comprehensive sentiment and complaint analysis across stored reviews.
        """
        try:
            # 1. Fetch Health & Freshness Status
            health = review_health_service.get_health_status(db)

            # 2. Filter Customer Reviews
            query = db.query(CustomerReview)
            if product_id:
                query = query.filter(CustomerReview.product_id == product_id)

            reviews = query.order_by(CustomerReview.review_date.desc()).all()
            total_reviews = len(reviews)

            if total_reviews == 0:
                return self._build_empty_response(health)

            # 3. Calculate Ratings & Sentiment Distribution
            avg_rating = round(sum(r.rating for r in reviews) / total_reviews, 2)
            pos_count = sum(1 for r in reviews if r.sentiment == "POSITIVE")
            neu_count = sum(1 for r in reviews if r.sentiment == "NEUTRAL")
            neg_count = sum(1 for r in reviews if r.sentiment == "NEGATIVE")

            pos_pct = round((pos_count / total_reviews) * 100, 1)
            neu_pct = round((neu_count / total_reviews) * 100, 1)
            neg_pct = round((neg_count / total_reviews) * 100, 1)

            # 4. 7-Day Trend Analysis
            now = datetime.now(timezone.utc)
            seven_days_ago = now - timedelta(days=7)
            fourteen_days_ago = now - timedelta(days=14)

            recent_reviews = [r for r in reviews if r.review_date and (r.review_date.tzinfo or timezone.utc) >= seven_days_ago]
            prev_reviews = [r for r in reviews if r.review_date and fourteen_days_ago <= (r.review_date.tzinfo or timezone.utc) < seven_days_ago]

            recent_neg_pct = (sum(1 for r in recent_reviews if r.sentiment == "NEGATIVE") / len(recent_reviews) * 100) if recent_reviews else neg_pct
            prev_neg_pct = (sum(1 for r in prev_reviews if r.sentiment == "NEGATIVE") / len(prev_reviews) * 100) if prev_reviews else neg_pct
            neg_trend = round(recent_neg_pct - prev_neg_pct, 1)

            # 5. Aspect Complaint Breakdown
            aspect_counts: Dict[str, Dict[str, int]] = {}
            for r in reviews:
                if r.detected_aspects and isinstance(r.detected_aspects, dict):
                    for aspect, sent in r.detected_aspects.items():
                        if aspect not in aspect_counts:
                            aspect_counts[aspect] = {"POSITIVE": 0, "NEGATIVE": 0, "total": 0}
                        aspect_counts[aspect]["total"] += 1
                        if sent in ["POSITIVE", "NEGATIVE"]:
                            aspect_counts[aspect][sent] += 1

            top_complaints = sorted(
                [{"aspect": k, "count": v["NEGATIVE"], "total": v["total"]} for k, v in aspect_counts.items() if v["NEGATIVE"] > 0],
                key=lambda x: x["count"],
                reverse=True
            )

            # 6. Product Risk Scoring & Critical Alerts
            products_at_risk = self._compute_products_at_risk(db, health["status"])

            # 7. Generate Agent Response Object
            confidence = 94.0 if health["status"] == "FRESH" else (70.0 if health["status"] == "STALE" else 40.0)

            latest_analysis = (
                f"Analyzed {total_reviews} customer reviews. Overall avg rating: {avg_rating}/5.0. "
                f"Negative sentiment at {neg_pct}% ({'+' if neg_trend >= 0 else ''}{neg_trend}% 7-day change)."
            )
            if top_complaints:
                latest_analysis += f" Primary complaint aspect: '{top_complaints[0]['aspect']}' ({top_complaints[0]['count']} negative flags)."

            return {
                "status": "active",
                "review_data_status": health["status"],
                "confidence": confidence,
                "total_reviews": total_reviews,
                "avg_rating": avg_rating,
                "positive_pct": pos_pct,
                "neutral_pct": neu_pct,
                "negative_pct": neg_pct,
                "negative_trend_7d": neg_trend,
                "top_complaints": top_complaints[:5],
                "aspect_counts": aspect_counts,
                "health": health,
                "products_at_risk": products_at_risk,
                "latestAnalysis": latest_analysis,
                "output": [
                    f"Processed {total_reviews} stored reviews from source: {health['source']}",
                    f"Sentiment Breakdown: {pos_pct}% Positive | {neu_pct}% Neutral | {neg_pct}% Negative",
                    f"Data Freshness Status: {health['status']} (Last sync: {health['minutes_since_sync'] or 'N/A'} mins ago)"
                ]
            }

        except Exception as e:
            logger.error(f"Error in CustomerFeedbackAgent: {e}")
            return self._build_empty_response({"status": "UNAVAILABLE", "error": str(e)})

    def _compute_products_at_risk(self, db: Session, sync_status: str) -> List[Dict[str, Any]]:
        """
        Calculates a transparent Product Risk Score (0-100) per product.
        Formula:
        Score = (Negative Sentiment % * 0.40) + ( (5.0 - Avg Rating) * 20 * 0.30 ) + (Negative Aspect Count * 4) + (Stale Penalty if not FRESH)
        """
        products = db.query(Product).all()
        risk_list = []

        for p in products:
            revs = db.query(CustomerReview).filter(CustomerReview.product_id == p.id).all()
            if not revs:
                continue

            n = len(revs)
            avg_r = sum(r.rating for r in revs) / n
            neg_c = sum(1 for r in revs if r.sentiment == "NEGATIVE")
            neg_p = (neg_c / n) * 100.0

            # Count negative aspects
            aspect_neg = 0
            primary_aspect = "None"
            aspect_dict: Dict[str, int] = {}
            for r in revs:
                if r.detected_aspects:
                    for asp, s in r.detected_aspects.items():
                        if s == "NEGATIVE":
                            aspect_neg += 1
                            aspect_dict[asp] = aspect_dict.get(asp, 0) + 1

            if aspect_dict:
                primary_aspect = max(aspect_dict, key=aspect_dict.get)

            # Risk Score Calculation
            base_score = (neg_p * 0.40) + ((5.0 - avg_r) * 20.0 * 0.30) + (aspect_neg * 3.0)
            if sync_status != "FRESH":
                base_score += 15.0  # Stale data risk penalty

            risk_score = round(min(100.0, max(0.0, base_score)), 1)

            if risk_score >= 70.0:
                risk_level = "CRITICAL"
            elif risk_score >= 45.0:
                risk_level = "HIGH"
            elif risk_score >= 25.0:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            risk_list.append({
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "avg_rating": round(avg_r, 2),
                "negative_pct": round(neg_p, 1),
                "primary_complaint": primary_aspect,
                "total_reviews": n,
                "reasons": [
                    f"Negative sentiment: {round(neg_p, 1)}%",
                    f"Average rating: {round(avg_r, 2)}/5.0",
                    f"Primary issue: {primary_aspect} ({aspect_dict.get(primary_aspect, 0)} complaints)"
                ]
            })

        return sorted(risk_list, key=lambda x: x["risk_score"], reverse=True)

    def _build_empty_response(self, health: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": health.get("status", "UNAVAILABLE"),
            "confidence": 0.0,
            "total_reviews": 0,
            "avg_rating": 0.0,
            "positive_pct": 0.0,
            "neutral_pct": 0.0,
            "negative_pct": 0.0,
            "negative_trend_7d": 0.0,
            "top_complaints": [],
            "health": health,
            "products_at_risk": [],
            "latestAnalysis": f"Customer Review Data {health.get('status', 'UNAVAILABLE')}. No review records available for analysis.",
            "output": ["Customer Feedback Connector status: " + health.get("status", "UNAVAILABLE")]
        }


customer_feedback_agent = CustomerFeedbackAgent()
