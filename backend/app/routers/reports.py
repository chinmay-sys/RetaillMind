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


@router.get("/generate/{report_id}")
def generate_report_csv(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates a dynamic CSV export from actual database records."""
    from fastapi import Response
    from app.models.models import Sale, Product, Inventory

    report = db.query(Report).filter(Report.id == report_id).first()
    title = report.title if report else "Sales_Report"

    # Query recent sales data
    sales = db.query(Sale, Product).join(Product, Product.id == Sale.product_id).limit(100).all()

    csv_lines = ["Date,Product Name,SKU,Quantity,Unit Price,Total Amount,Profit,Store Location"]
    for sale, prod in sales:
        dt = sale.sale_date.strftime("%Y-%m-%d %H:%M") if sale.sale_date else ""
        pname = prod.name.replace(",", " ")
        csv_lines.append(f"{dt},{pname},{prod.sku},{sale.quantity},{sale.unit_price},{sale.total_amount},{sale.profit},{sale.store_location}")

    content = "\n".join(csv_lines)
    filename = f"{title.replace(' ', '_')}_{report_id}.csv"

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

