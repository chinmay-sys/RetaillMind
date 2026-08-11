from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    RETAIL_MANAGER = "Retail Manager"
    BUSINESS_ANALYST = "Business Analyst"


class RecommendationStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    MODIFIED = "Modified"
    REJECTED = "Rejected"


class InventoryStatus(str, enum.Enum):
    HEALTHY = "Healthy"
    WARNING = "Warning"
    CRITICAL = "Critical"
    OVERSTOCK = "Overstock"


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=_utcnow)

    users = relationship("User", back_populates="role_rel")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.RETAIL_MANAGER, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    organization = Column(String(150), default="RetailMind Corp")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    role_rel = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    decisions = relationship("AIRecommendation", back_populates="reviewed_by_user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=_utcnow)

    products = relationship("Product", back_populates="category")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(255))
    phone = Column(String(50))
    reliability_score = Column(Float, default=90.0)  # 0 to 100
    lead_time_days = Column(Float, default=5.0)
    on_time_delivery_rate = Column(Float, default=95.0)
    quality_rating = Column(Float, default=92.0)
    rank = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    unit_cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    suggested_price = Column(Float)
    min_price = Column(Float)
    max_price = Column(Float)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    inventory = relationship("Inventory", back_populates="product", uselist=False)
    sales = relationship("Sale", back_populates="product")
    forecasts = relationship("Forecast", back_populates="product")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    current_stock = Column(Integer, default=0)
    safety_stock = Column(Integer, default=20)
    reorder_point = Column(Integer, default=30)
    max_stock = Column(Integer, default=200)
    warehouse_location = Column(String(100), default="Warehouse A-1")
    status = Column(SQLEnum(InventoryStatus), default=InventoryStatus.HEALTHY)
    last_restocked_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    product = relationship("Product", back_populates="inventory")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), default="Mumbai")
    customer_type = Column(String(50), default="Retail")  # Retail, Wholesale, Corporate
    total_purchases = Column(Float, default=0.0)
    created_at = Column(DateTime, default=_utcnow)

    sales = relationship("Sale", back_populates="customer")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True, nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    store_location = Column(String(100), default="Mumbai Central")
    sale_date = Column(DateTime, default=_utcnow, index=True)

    product = relationship("Product", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")



class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    total_cost = Column(Float, nullable=False)
    status = Column(String(50), default="Pending")  # Pending, Approved, Shipped, Delivered
    order_date = Column(DateTime, default=_utcnow)
    expected_delivery = Column(DateTime)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    forecast_date = Column(DateTime, nullable=False)
    predicted_demand = Column(Float, nullable=False)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    actual_demand = Column(Float, nullable=True)
    model_name = Column(String(50), default="Prophet-XGBoost-Ensemble")
    confidence_score = Column(Float, nullable=True)  # Computed from evaluation, not hardcoded
    created_at = Column(DateTime, default=_utcnow)

    product = relationship("Product", back_populates="forecasts")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    agent_name = Column(String(100), nullable=False)
    priority = Column(String(50), default="Medium")  # Critical, High, Medium, Low
    category = Column(String(50))  # Inventory, Pricing, Supplier, Demand
    description = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    expected_impact = Column(String(255))
    confidence_score = Column(Float, nullable=True)
    status = Column(SQLEnum(RecommendationStatus), default=RecommendationStatus.PENDING)
    action_data = Column(JSON, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    manager_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    reviewed_by_user = relationship("User", back_populates="decisions")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)  # Weekly, Monthly, Executive
    file_path = Column(String(500))
    status = Column(String(50), default="Ready")  # Generating, Ready
    highlights = Column(JSON)
    created_at = Column(DateTime, default=_utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(150), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="audit_logs")
