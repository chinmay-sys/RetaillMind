"""
Pricing intelligence router — real DB queries for price suggestions and discount recommendations.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models.models import Product, Inventory, InventoryStatus, Sale, User
from app.dependencies import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/pricing", tags=["Pricing Intelligence"])


@router.get("/recommendations")
def get_pricing_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate pricing suggestions by comparing selling_price vs suggested_price,
    and discount recommendations for overstocked / slow-moving items.
    """
    # ── Price suggestions: products where selling_price != suggested_price ──
    products = (
        db.query(Product)
        .filter(Product.suggested_price.isnot(None))
        .options(joinedload(Product.inventory))
        .all()
    )

    suggestions = []
    for p in products:
        if p.suggested_price and abs(p.selling_price - p.suggested_price) > 1:
            current_margin = round(((p.selling_price - p.unit_cost) / p.selling_price) * 100, 1) if p.selling_price > 0 else 0
            suggested_margin = round(((p.suggested_price - p.unit_cost) / p.suggested_price) * 100, 1) if p.suggested_price > 0 else 0

            # Estimate impact based on price direction
            price_diff_pct = round(((p.suggested_price - p.selling_price) / p.selling_price) * 100, 1)
            if price_diff_pct < 0:
                # Price reduction → volume increase
                impact = f"+{abs(int(price_diff_pct * 2.4))}% sales volume"
            else:
                # Price increase → revenue increase
                impact = f"+{abs(int(price_diff_pct * 1.6))}% revenue"

            # Estimate competitor price (midpoint of current and suggested)
            competitor_price = round((p.selling_price + p.suggested_price) / 2, 2)

            suggestions.append({
                "id": p.id,
                "product": p.name,
                "currentPrice": p.selling_price,
                "suggestedPrice": p.suggested_price,
                "competitorPrice": competitor_price,
                "margin": current_margin,
                "suggestedMargin": suggested_margin,
                "impact": impact,
                "confidence": round(90 + (1 - abs(price_diff_pct) / 20) * 5, 1),
            })

    # ── Discount recommendations: overstocked items ──
    overstocked = (
        db.query(Inventory)
        .options(joinedload(Inventory.product))
        .filter(Inventory.status == InventoryStatus.OVERSTOCK)
        .all()
    )

    discounts = []
    for inv in overstocked:
        p = inv.product
        if not p:
            continue
        excess = inv.current_stock - inv.max_stock
        discount_pct = min(25, max(10, int(excess / inv.max_stock * 50)))
        new_price = round(p.selling_price * (1 - discount_pct / 100), 2)

        discounts.append({
            "product": p.name,
            "reason": "Overstock clearance",
            "currentPrice": p.selling_price,
            "discountPercent": discount_pct,
            "newPrice": new_price,
            "expectedImpact": f"Clear {excess}+ excess units in 2 weeks",
            "urgency": "high" if excess > 100 else "medium",
        })

    # ── Also add slow-moving items (low sales velocity) ──
    thirty_days_ago = datetime.now() - timedelta(days=30)
    slow_movers = (
        db.query(
            Product.id, Product.name, Product.selling_price, Product.unit_cost,
            func.coalesce(func.sum(Sale.quantity), 0).label("qty_sold"),
        )
        .outerjoin(Sale, (Sale.product_id == Product.id) & (Sale.sale_date >= thirty_days_ago))
        .group_by(Product.id, Product.name, Product.selling_price, Product.unit_cost)
        .having(func.coalesce(func.sum(Sale.quantity), 0) < 30)
        .limit(5)
        .all()
    )

    for sm in slow_movers:
        # Only add if not already in discounts
        if not any(d["product"] == sm.name for d in discounts):
            discount_pct = 8
            discounts.append({
                "product": sm.name,
                "reason": "Low sales velocity",
                "currentPrice": sm.selling_price,
                "discountPercent": discount_pct,
                "newPrice": round(sm.selling_price * 0.92, 2),
                "expectedImpact": f"Boost sales velocity by ~{discount_pct * 2}%",
                "urgency": "low",
            })

    # ── Summary metrics ──
    all_products = db.query(Product).all()
    margins = []
    for p in all_products:
        if p.selling_price > 0:
            margins.append(((p.selling_price - p.unit_cost) / p.selling_price) * 100)
    avg_margin = round(sum(margins) / len(margins), 1) if margins else 0

    return {
        "avg_margin": avg_margin,
        "pending_suggestions": len(suggestions),
        "projected_revenue_impact": sum(
            abs(s["suggestedPrice"] - s["currentPrice"]) * 100 for s in suggestions
        ),
        "suggestions": suggestions,
        "discounts": discounts,
    }
