"""
Audit log router — paginated audit trail for system transparency.
"""
import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models.models import AuditLog, User
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    entity_type: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated audit trail. Admins see all; others see their own."""
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    # Non-admins only see their own logs
    if current_user.role.value != "Admin":
        query = query.filter(AuditLog.user_id == current_user.id)

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))

    logs = (
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "user_name": f"{log.user.first_name} {log.user.last_name}" if log.user else "System",
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": total_pages,
        },
    }


@router.get("/stats")
def get_audit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Audit statistics — admin only."""
    total = db.query(func.count(AuditLog.id)).scalar() or 0

    by_type = (
        db.query(AuditLog.entity_type, func.count(AuditLog.id).label("count"))
        .group_by(AuditLog.entity_type)
        .all()
    )

    by_action = (
        db.query(AuditLog.action, func.count(AuditLog.id).label("count"))
        .group_by(AuditLog.action)
        .order_by(func.count(AuditLog.id).desc())
        .limit(10)
        .all()
    )

    return {
        "total_entries": total,
        "by_entity_type": {r.entity_type or "Other": r.count for r in by_type},
        "top_actions": [{"action": r.action, "count": r.count} for r in by_action],
    }
