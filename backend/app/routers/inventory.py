"""
Inventory intelligence router — real DB queries for stock levels, health stats, and item management.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case
from typing import Optional
import math

from app.database import get_db
from app.models.models import Inventory, InventoryStatus, Product, Category, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])


@router.get("/status")
def get_inventory_status(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full inventory dashboard: health stats + paginated item list."""
    # ── Health aggregation ──
    health_counts = (
        db.query(
            Inventory.status,
            func.count(Inventory.id).label("count"),
        )
        .group_by(Inventory.status)
        .all()
    )

    total_skus = db.query(func.count(Inventory.id)).scalar() or 0
    stock_value = (
        db.query(func.sum(Inventory.current_stock * Product.selling_price))
        .join(Product, Product.id == Inventory.product_id)
        .scalar()
    ) or 0

    # Map counts
    status_map = {str(h.status.value if hasattr(h.status, 'value') else h.status): h.count for h in health_counts}
    critical = status_map.get("Critical", 0)
    warning = status_map.get("Warning", 0)
    overstock = status_map.get("Overstock", 0)
    healthy = status_map.get("Healthy", 0)
    total_counted = critical + warning + overstock + healthy

    def pct(v):
        return round((v / total_counted * 100), 1) if total_counted > 0 else 0

    stats = [
        {"title": "Total SKUs", "value": f"{total_skus:,}"},
        {"title": "Low Stock Alerts", "value": str(critical + warning)},
        {"title": "Overstock Items", "value": str(overstock)},
        {"title": "Stock Value", "value": f"₹{stock_value/10000000:.2f} Cr" if stock_value >= 10000000 else f"₹{stock_value/100000:.1f}L"},
    ]

    color_map = {"Healthy": "#10B981", "Warning": "#F59E0B", "Critical": "#EF4444", "Overstock": "#5B5CEB"}
    health = [
        {"name": name, "value": pct(status_map.get(name, 0)), "color": color}
        for name, color in color_map.items()
    ]

    # ── Paginated item list ──
    query = (
        db.query(Inventory)
        .join(Product, Product.id == Inventory.product_id)
        .join(Category, Category.id == Product.category_id, isouter=True)
        .options(joinedload(Inventory.product).joinedload(Product.category))
    )

    if status_filter:
        try:
            sf = InventoryStatus(status_filter)
            query = query.filter(Inventory.status == sf)
        except ValueError:
            query = query.filter(Inventory.status == status_filter)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    total_items = query.count()
    total_pages = max(1, math.ceil(total_items / page_size))
    items_db = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for inv in items_db:
        p = inv.product
        items.append({
            "id": inv.id,
            "product_id": inv.product_id,
            "product_name": p.name if p else "Unknown",
            "sku": p.sku if p else "",
            "category": p.category.name if p and p.category else "N/A",
            "current_stock": inv.current_stock,
            "safety_stock": inv.safety_stock,
            "reorder_point": inv.reorder_point,
            "max_stock": inv.max_stock,
            "warehouse_location": inv.warehouse_location,
            "status": inv.status.value if hasattr(inv.status, 'value') else str(inv.status),
            "price": p.selling_price if p else 0,
            "last_restocked": inv.last_restocked_at.strftime("%Y-%m-%d") if inv.last_restocked_at else None,
        })

    return {
        "stats": stats,
        "health": health,
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        },
    }


@router.get("/items/{item_id}")
def get_inventory_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a single inventory item by ID."""
    inv = (
        db.query(Inventory)
        .options(joinedload(Inventory.product).joinedload(Product.category))
        .filter(Inventory.id == item_id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    p = inv.product
    return {
        "id": inv.id,
        "product_id": inv.product_id,
        "product_name": p.name if p else "Unknown",
        "sku": p.sku if p else "",
        "category": p.category.name if p and p.category else "N/A",
        "current_stock": inv.current_stock,
        "safety_stock": inv.safety_stock,
        "reorder_point": inv.reorder_point,
        "max_stock": inv.max_stock,
        "warehouse_location": inv.warehouse_location,
        "status": inv.status.value if hasattr(inv.status, 'value') else str(inv.status),
        "price": p.selling_price if p else 0,
        "last_restocked": inv.last_restocked_at.strftime("%Y-%m-%d") if inv.last_restocked_at else None,
    }


@router.patch("/items/{item_id}")
def update_inventory_stock(
    item_id: int,
    current_stock: Optional[int] = None,
    safety_stock: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update stock levels for an inventory item."""
    inv = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    if current_stock is not None:
        inv.current_stock = current_stock
    if safety_stock is not None:
        inv.safety_stock = safety_stock

    # Auto-update status based on stock levels
    if inv.current_stock <= 0:
        inv.status = InventoryStatus.CRITICAL
    elif inv.current_stock < inv.safety_stock:
        inv.status = InventoryStatus.CRITICAL
    elif inv.current_stock < inv.reorder_point:
        inv.status = InventoryStatus.WARNING
    elif inv.current_stock > inv.max_stock:
        inv.status = InventoryStatus.OVERSTOCK
    else:
        inv.status = InventoryStatus.HEALTHY

    db.commit()
    db.refresh(inv)
    return {"status": "updated", "new_stock": inv.current_stock, "new_status": inv.status.value}
