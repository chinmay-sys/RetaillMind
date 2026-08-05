"""
Demand forecasting router — fetches historical sales from DB and passes to forecaster.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models.models import Sale, Product, User
from app.schemas.schemas import ForecastRequest, ForecastResponse
from app.ml.forecaster import demand_forecaster
from app.dependencies import get_current_user

router = APIRouter(prefix="/forecast", tags=["Demand Forecasting"])


def _fetch_historical_sales(db: Session, product_id: int = None, days: int = 365):
    """Fetch daily aggregated sales from DB as Prophet-compatible data."""
    start_date = datetime.now() - timedelta(days=days)

    query = db.query(
        func.date(Sale.sale_date).label("ds"),
        func.sum(Sale.total_amount).label("y"),
    ).filter(Sale.sale_date >= start_date)

    if product_id:
        query = query.filter(Sale.product_id == product_id)

    results = query.group_by(func.date(Sale.sale_date)).order_by("ds").all()

    return [{"ds": str(r.ds), "y": float(r.y)} for r in results]


@router.get("/30-day")
def get_30_day_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns 30-day demand predictions using historical sales data from DB.
    """
    historical = _fetch_historical_sales(db, days=730)
    return demand_forecaster.predict_future(historical, days_ahead=30)


@router.post("/predict", response_model=ForecastResponse)
def predict_product_demand(
    req: ForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Predict demand for a specific product."""
    # Verify product exists
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")

    historical = _fetch_historical_sales(db, product_id=req.product_id, days=730)
    res = demand_forecaster.predict_future(historical, days_ahead=req.days)

    return {
        "product_id": req.product_id,
        "accuracy": res["accuracy"],
        "confidence": res["confidence"],
        "forecast_points": res["forecast_points"],
    }
