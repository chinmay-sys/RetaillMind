"""
Reports router — real DB queries for report listing and management.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Report, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/list")
def get_reports_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all reports from DB with counts."""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()

    ready_count = sum(1 for r in reports if r.status == "Ready")
    generating_count = sum(1 for r in reports if r.status == "Generating")

    return {
        "generated_count": ready_count,
        "scheduled_count": generating_count,
        "reports": [
            {
                "id": r.id,
                "title": r.title,
                "type": r.report_type.lower(),
                "date": r.created_at.strftime("%b %d, %Y") if r.created_at else "",
                "status": r.status.lower(),
                "pages": len(r.highlights) * 4 if r.highlights else 0,
                "highlights": r.highlights or [],
            }
            for r in reports
        ],
    }
