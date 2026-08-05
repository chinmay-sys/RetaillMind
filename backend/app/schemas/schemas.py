from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserRole, RecommendationStatus

# ─── AUTH & USER ───────────────────────────────────────────

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    organization: Optional[str] = "RetailMind Corp"
    role: Optional[UserRole] = UserRole.RETAIL_MANAGER

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    first_name: str
    last_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: UserRole
    organization: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ─── PAGINATION ────────────────────────────────────────────

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

# ─── PRODUCT & INVENTORY ──────────────────────────────────

class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: int
    supplier_id: int
    unit_cost: float
    selling_price: float

class ProductResponse(ProductBase):
    id: int
    suggested_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    category: str
    current_stock: int
    safety_stock: int
    reorder_point: int
    max_stock: int
    warehouse_location: str
    status: str
    price: float
    last_restocked: Optional[str] = None

class InventoryStatusResponse(BaseModel):
    stats: List[dict]
    health: List[dict]
    items: List[InventoryItemResponse]
    pagination: PaginationMeta

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    current_stock: int
    safety_stock: int
    reorder_point: int
    max_stock: int
    warehouse_location: str
    status: str
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

# ─── SALES & ANALYTICS ────────────────────────────────────

class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    store_location: Optional[str] = "Mumbai Central"

class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_amount: float
    profit: float
    store_location: str
    sale_date: datetime

    class Config:
        from_attributes = True

# ─── FORECAST ──────────────────────────────────────────────

class ForecastRequest(BaseModel):
    product_id: int
    days: int = 30

class ForecastPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    predicted: float
    lowerBound: float
    upperBound: float

class ForecastResponse(BaseModel):
    product_id: int
    accuracy: float
    confidence: float
    forecast_points: List[ForecastPoint]

# ─── PRICING ───────────────────────────────────────────────

class PricingSuggestion(BaseModel):
    id: int
    product: str
    currentPrice: float
    suggestedPrice: float
    competitorPrice: Optional[float] = None
    margin: float
    suggestedMargin: float
    impact: str
    confidence: float

class DiscountRecommendation(BaseModel):
    product: str
    reason: str
    currentPrice: float
    discountPercent: float
    newPrice: float
    expectedImpact: str
    urgency: str

class PricingResponse(BaseModel):
    avg_margin: float
    pending_suggestions: int
    projected_revenue_impact: float
    suggestions: List[PricingSuggestion]
    discounts: List[DiscountRecommendation]

# ─── SUPPLIER ──────────────────────────────────────────────

class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    reliability: float
    leadTime: float
    deliveryScore: float
    costIndex: float
    totalOrders: int
    onTimeDelivery: float
    qualityScore: float
    rank: int

class SupplierScorecardResponse(BaseModel):
    active_suppliers: int
    avg_lead_time_days: float
    avg_reliability: float
    on_time_delivery_rate: float
    suppliers: List[SupplierResponse]

# ─── AI RECOMMENDATIONS & DECISION CENTER ─────────────────

class RecommendationReview(BaseModel):
    recommendation_id: int
    action: RecommendationStatus  # Approved, Modified, Rejected
    notes: Optional[str] = None

class RecommendationResponse(BaseModel):
    id: int
    title: str
    agent_name: str
    priority: str
    category: Optional[str] = None
    description: str
    reasoning: str
    expected_impact: Optional[str] = None
    confidence_score: Optional[float] = None
    status: RecommendationStatus
    manager_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentStateResponse(BaseModel):
    id: str
    name: str
    description: str
    status: str  # active, processing, idle
    confidence: float
    lastRun: str
    executionTime: str
    latestAnalysis: str
    output: List[str]
    color: str

# ─── CHAT & RAG ────────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    response: str
    conversation_id: str
    sources: Optional[List[str]] = []
    timestamp: str

# ─── REPORTS ───────────────────────────────────────────────

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    status: str
    highlights: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ReportsListResponse(BaseModel):
    reports: List[ReportResponse]
    generated_count: int
    scheduled_count: int

# ─── AUDIT LOGS ────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

class AuditLogsListResponse(BaseModel):
    logs: List[AuditLogResponse]
    pagination: PaginationMeta
