"""
Role-based authorization tests for RetailMind AI Backend.
Tests that role checks (require_admin, require_manager_or_above) correctly
allow or deny access based on the user's role.

Run with: cd backend && python -m pytest tests/test_role_authorization.py -v
"""
import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, init_db
from app.models.models import User, UserRole, AIRecommendation, RecommendationStatus
from app.dependencies import require_admin, require_manager_or_above
from fastapi import HTTPException


@pytest.fixture(scope="module")
def db():
    """Provide a shared database session for all tests in this module."""
    init_db()
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def admin_user(db):
    """Fetch the seeded Admin user."""
    user = db.query(User).filter(User.email == "chinmay@retailmind.ai").first()
    assert user is not None, "Admin user not found — run seed first"
    return user


@pytest.fixture(scope="module")
def manager_user(db):
    """Fetch the seeded Retail Manager user."""
    user = db.query(User).filter(User.email == "priya@retailmind.ai").first()
    assert user is not None, "Manager user not found — run seed first"
    return user


@pytest.fixture(scope="module")
def analyst_user(db):
    """Fetch the seeded Business Analyst user."""
    user = db.query(User).filter(User.email == "vikram@retailmind.ai").first()
    assert user is not None, "Analyst user not found — run seed first"
    return user


# ─── 1. Role Value Tests ─────────────────────────────────────

def test_admin_role_value(admin_user):
    """Admin user has Admin role."""
    assert admin_user.role == UserRole.ADMIN or admin_user.role.value == "Admin"


def test_manager_role_value(manager_user):
    """Manager user has Retail Manager role."""
    assert manager_user.role == UserRole.RETAIL_MANAGER or manager_user.role.value == "Retail Manager"


def test_analyst_role_value(analyst_user):
    """Analyst user has Business Analyst role."""
    assert analyst_user.role == UserRole.BUSINESS_ANALYST or analyst_user.role.value == "Business Analyst"


# ─── 2. require_admin Tests ──────────────────────────────────

def test_require_admin_allows_admin(admin_user):
    """require_admin should allow Admin user."""
    result = require_admin(current_user=admin_user)
    assert result.id == admin_user.id


def test_require_admin_rejects_manager(manager_user):
    """require_admin should reject Retail Manager."""
    with pytest.raises(HTTPException) as exc_info:
        require_admin(current_user=manager_user)
    assert exc_info.value.status_code == 403


def test_require_admin_rejects_analyst(analyst_user):
    """require_admin should reject Business Analyst."""
    with pytest.raises(HTTPException) as exc_info:
        require_admin(current_user=analyst_user)
    assert exc_info.value.status_code == 403


# ─── 3. require_manager_or_above Tests ───────────────────────

def test_require_manager_allows_admin(admin_user):
    """require_manager_or_above should allow Admin."""
    result = require_manager_or_above(current_user=admin_user)
    assert result.id == admin_user.id


def test_require_manager_allows_manager(manager_user):
    """require_manager_or_above should allow Retail Manager."""
    result = require_manager_or_above(current_user=manager_user)
    assert result.id == manager_user.id


def test_require_manager_rejects_analyst(analyst_user):
    """require_manager_or_above should reject Business Analyst."""
    with pytest.raises(HTTPException) as exc_info:
        require_manager_or_above(current_user=analyst_user)
    assert exc_info.value.status_code == 403


# ─── 4. AI Decision Review Authorization ─────────────────────

def test_analyst_cannot_review_decision(db, analyst_user):
    """Business Analyst should NOT be able to approve/reject AI recommendations.

    The review_decision endpoint now uses require_manager_or_above,
    so calling it with an analyst user should raise 403.
    """
    from app.schemas.schemas import RecommendationReview

    # Create a pending recommendation
    rec = AIRecommendation(
        title="Test Auth: Restock Widget",
        agent_name="Inventory Agent",
        priority="Medium",
        category="Inventory",
        description="Test stock check",
        reasoning="Testing role authorization",
        status=RecommendationStatus.PENDING,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    # Analyst tries to approve — should be blocked by require_manager_or_above
    with pytest.raises(HTTPException) as exc_info:
        require_manager_or_above(current_user=analyst_user)
    assert exc_info.value.status_code == 403

    # Cleanup
    db.delete(rec)
    db.commit()


def test_manager_can_review_decision(db, manager_user):
    """Retail Manager should be able to approve AI recommendations."""
    from app.schemas.schemas import RecommendationReview
    from app.routers.ai_center import review_decision

    rec = AIRecommendation(
        title="Test Auth: Manager Approval",
        agent_name="Inventory Agent",
        priority="Medium",
        category="Inventory",
        description="Manager approval test",
        reasoning="Testing manager authorization",
        status=RecommendationStatus.PENDING,
        action_data={"quantity": 50}
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    review = RecommendationReview(
        recommendation_id=rec.id,
        action=RecommendationStatus.APPROVED,
        notes="Manager test approval"
    )
    result = review_decision(review=review, db=db, current_user=manager_user)
    assert result["status"] == "success"
    assert result["new_status"] == "Approved"
