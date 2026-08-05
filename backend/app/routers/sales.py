"""
Sales analytics router — real DB queries for revenue, top products, trends.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.models.models import Sale, Product, Category
from app.dependencies import get_current_user

router = APIRouter(prefix="/sales", tags=["Sales & Analytics"])


@router.get("/analytics")
def get_sales_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Aggregated sales analytics — revenue, units sold, profit, growth."""
    now = datetime.now()
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

    return {
        "revenue": round(float(current.revenue), 2),
        "units_sold": int(current.units),
        "profit": round(float(current.profit), 2),
        "transactions": int(current.transactions),
        "revenue_growth": calc_growth(float(current.revenue), float(previous.revenue)),
        "units_growth": calc_growth(float(current.units), float(previous.units)),
        "profit_growth": calc_growth(float(current.profit), float(previous.profit)),
        "period_days": days,
    }


@router.get("/top-products")
def get_top_products(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Top products by revenue with growth comparison."""
    now = datetime.now()
    period_start = now - timedelta(days=days)
    prev_start = period_start - timedelta(days=days)

    # Current period top products
    current_products = (
        db.query(
            Product.id,
            Product.name,
            func.sum(Sale.quantity).label("sales"),
            func.sum(Sale.total_amount).label("revenue"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .filter(Sale.sale_date >= period_start)
        .group_by(Product.id, Product.name)
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
        })

    return results


@router.get("/monthly-trend")
def get_monthly_trend(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
):
    """Monthly revenue, sales, and profit trend."""
    now = datetime.now()
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
    period_start = datetime.now() - timedelta(days=days)

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
    period_start = datetime.now() - timedelta(days=days)

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
