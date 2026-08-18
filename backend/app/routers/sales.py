"""
Sales analytics router — real DB queries for revenue, top products, trends.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc, or_
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.models.models import Sale, Product, Category
from app.dependencies import get_current_user

router = APIRouter(prefix="/sales", tags=["Sales & Analytics"])


def _get_reference_date(db: Session) -> datetime:
    """Return the latest sale date in the DB, or now() if no sales exist.
    This ensures queries work even when seeded data doesn't cover today."""
    latest = db.query(func.max(Sale.sale_date)).scalar()
    return latest if latest else datetime.now()


@router.get("/analytics")
def get_sales_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):

    """Aggregated sales analytics — revenue, units sold, profit, growth."""
    now = _get_reference_date(db)
    period_start = now - timedelta(days=days)
    prev_start = period_start - timedelta(days=days)

    # Current period
    current = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0).label("revenue"),
        func.coalesce(func.sum(Sale.quantity), 0).label("units"),
        func.coalesce(func.sum(Sale.profit), 0).label("profit"),
        func.count(Sale.id).label("transactions"),
    ).filter(Sale.sale_date >= period_start).first()

    # Previous period for growth calculation
    previous = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0).label("revenue"),
        func.coalesce(func.sum(Sale.quantity), 0).label("units"),
        func.coalesce(func.sum(Sale.profit), 0).label("profit"),
    ).filter(Sale.sale_date >= prev_start, Sale.sale_date < period_start).first()

    def calc_growth(current_val, prev_val):
        if prev_val and prev_val > 0:
            return round(((current_val - prev_val) / prev_val) * 100, 1)
        return 0.0

    rev_val = round(float(current.revenue), 2) if current and current.revenue is not None else 0.0
    units_val = int(current.units) if current and current.units is not None else 0
    profit_val = round(float(current.profit), 2) if current and current.profit is not None else 0.0
    tx_val = int(current.transactions) if current and current.transactions is not None else 0

    return {
        "revenue": rev_val,
        "total_revenue": rev_val,
        "units_sold": units_val,
        "total_sales": units_val,
        "profit": profit_val,
        "total_profit": profit_val,
        "transactions": tx_val,
        "revenue_growth": calc_growth(float(current.revenue), float(previous.revenue)),
        "units_growth": calc_growth(float(current.units), float(previous.units)),
        "profit_growth": calc_growth(float(current.profit), float(previous.profit)),
        "period_days": days,
    }


@router.get("/top-products")
def get_top_products(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(90, ge=1, le=365),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Top products by revenue with growth comparison."""
    now = _get_reference_date(db)
    period_start = now - timedelta(days=days)
    prev_start = period_start - timedelta(days=days)

    query = (
        db.query(
            Product.id,
            Product.name,
            Category.name.label("category_name"),
            func.sum(Sale.quantity).label("sales"),
            func.sum(Sale.total_amount).label("revenue"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .outerjoin(Category, Category.id == Product.category_id)
        .filter(Sale.sale_date >= period_start)
    )

    if category and category.lower() != "all":
        cat_lower = category.lower()
        category_terms = [cat_lower]
        if cat_lower == "electronics":
            category_terms.extend(["laptops & pcs", "peripherals", "audio & video", "storage", "accessories", "tech"])
        elif cat_lower == "home":
            category_terms.extend(["furniture", "home & decor", "decor", "kitchen"])
        elif cat_lower == "books":
            category_terms.extend(["stationery & craft", "stationery", "books"])

        conditions = []
        for term in category_terms:
            conditions.append(func.lower(Category.name).contains(term))
            conditions.append(func.lower(term).contains(func.lower(Category.name)))

        query = query.filter(or_(*conditions))

    current_products = (
        query.group_by(Product.id, Product.name, Category.name)
        .order_by(desc("revenue"))
        .limit(limit)
        .all()
    )

    results = []
    for p in current_products:
        # Previous period revenue for growth
        prev_rev = db.query(
            func.coalesce(func.sum(Sale.total_amount), 0)
        ).filter(
            Sale.product_id == p.id,
            Sale.sale_date >= prev_start,
            Sale.sale_date < period_start,
        ).scalar()

        growth = 0.0
        if prev_rev and prev_rev > 0:
            growth = round(((float(p.revenue) - float(prev_rev)) / float(prev_rev)) * 100, 1)

        results.append({
            "id": p.id,
            "name": p.name,
            "sales": int(p.sales),
            "revenue": round(float(p.revenue), 2),
            "growth": growth,
            "category": p.category_name if p.category_name else "General",
        })

    return results


@router.get("/monthly-trend")
def get_monthly_trend(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
):
    """Monthly revenue, sales, and profit trend."""
    now = _get_reference_date(db)
    start = now - timedelta(days=months * 30)

    results = (
        db.query(
            extract("year", Sale.sale_date).label("year"),
            extract("month", Sale.sale_date).label("month"),
            func.sum(Sale.total_amount).label("revenue"),
            func.sum(Sale.quantity).label("sales"),
            func.sum(Sale.profit).label("profit"),
        )
        .filter(Sale.sale_date >= start)
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return [
        {
            "month": month_names[int(r.month) - 1],
            "revenue": round(float(r.revenue), 2),
            "sales": int(r.sales),
            "profit": round(float(r.profit), 2),
        }
        for r in results
    ]


@router.get("/by-store")
def get_sales_by_store(
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Sales breakdown by store location."""
    period_start = _get_reference_date(db) - timedelta(days=days)

    results = (
        db.query(
            Sale.store_location,
            func.sum(Sale.total_amount).label("revenue"),
            func.sum(Sale.quantity).label("sales"),
            func.count(func.distinct(Sale.sale_date)).label("active_days"),
        )
        .filter(Sale.sale_date >= period_start)
        .group_by(Sale.store_location)
        .order_by(desc("revenue"))
        .all()
    )

    return [
        {
            "store": r.store_location,
            "revenue": round(float(r.revenue), 2),
            "sales": int(r.sales),
        }
        for r in results
    ]


@router.get("/by-category")
def get_sales_by_category(
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Sales breakdown by product category."""
    period_start = _get_reference_date(db) - timedelta(days=days)

    total_rev = db.query(
        func.coalesce(func.sum(Sale.total_amount), 1)
    ).filter(Sale.sale_date >= period_start).scalar()

    results = (
        db.query(
            Category.name,
            func.sum(Sale.total_amount).label("revenue"),
        )
        .join(Product, Product.id == Sale.product_id)
        .join(Category, Category.id == Product.category_id)
        .filter(Sale.sale_date >= period_start)
        .group_by(Category.name)
        .order_by(desc("revenue"))
        .all()
    )

    colors = ["#5B5CEB", "#7C3AED", "#14B8A6", "#F59E0B", "#EF4444", "#10B981"]

    return [
        {
            "name": r.name,
            "revenue": round(float(r.revenue), 2),
            "value": round((float(r.revenue) / float(total_rev)) * 100, 1),
            "color": colors[i % len(colors)],
        }
        for i, r in enumerate(results)
    ]
