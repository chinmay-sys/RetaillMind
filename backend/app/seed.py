"""
Database seed script — populates all tables with realistic Indian retail data.
Run with: python -m app.seed
"""
import random
import math
from datetime import datetime, timedelta
from app.database import SessionLocal, init_db
from app.models.models import (
    Role, User, UserRole, Category, Supplier, Product,
    Inventory, InventoryStatus, Sale, PurchaseOrder, Forecast,
    AIRecommendation, RecommendationStatus, Report, AuditLog
)

import hashlib

try:
    import bcrypt  # type: ignore
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

try:
    from passlib.context import CryptContext  # type: ignore
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except Exception:
    HAS_PASSLIB = False

def _hash(pwd: str) -> str:
    pwd_bytes = pwd.encode("utf-8")[:72]
    if HAS_BCRYPT:
        try:
            return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
        except Exception:
            pass
    if HAS_PASSLIB:
        try:
            return pwd_context.hash(pwd_bytes.decode("utf-8", errors="ignore"))
        except Exception:
            pass
    return "$sha256$" + hashlib.sha256(pwd_bytes).hexdigest()

def seed():
    init_db()
    db = SessionLocal()

    # Skip if already seeded
    if db.query(Role).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("🌱 Seeding RetailMind AI database...")

    # ── 1. ROLES ──
    roles = [
        Role(name="Admin", description="Full administrative permissions"),
        Role(name="Retail Manager", description="Store and inventory management access"),
        Role(name="Business Analyst", description="Analytics and reporting access"),
    ]
    db.add_all(roles)
    db.flush()
    print("  ✅ Roles created")

    # ── 2. USERS ──
    users = [
        User(
            first_name="Chinmay", last_name="R.",
            email="chinmay@retailmind.ai",
            hashed_password=_hash("admin123"),
            role=UserRole.ADMIN, role_id=roles[0].id,
            organization="RetailMind Corp"
        ),
        User(
            first_name="Priya", last_name="Sharma",
            email="priya@retailmind.ai",
            hashed_password=_hash("manager123"),
            role=UserRole.RETAIL_MANAGER, role_id=roles[1].id,
            organization="RetailMind Corp"
        ),
        User(
            first_name="Vikram", last_name="Desai",
            email="vikram@retailmind.ai",
            hashed_password=_hash("analyst123"),
            role=UserRole.BUSINESS_ANALYST, role_id=roles[2].id,
            organization="RetailMind Corp"
        ),
    ]
    db.add_all(users)
    db.flush()
    print("  ✅ Users created")

    # ── 3. CATEGORIES ──
    categories = [
        Category(name="Laptops & PCs", description="Computers, laptops and work stations"),
        Category(name="Peripherals", description="Keyboards, mice, monitors, mouse pads"),
        Category(name="Audio & Video", description="Headphones, webcams, speakers"),
        Category(name="Storage", description="SSDs, HDDs, portable drives"),
        Category(name="Accessories", description="Hubs, docks, lamps, cables"),
        Category(name="Furniture", description="Desks, chairs, ergonomic equipment"),
    ]
    db.add_all(categories)
    db.flush()
    print("  ✅ Categories created")

    # ── 4. SUPPLIERS ──
    suppliers = [
        Supplier(name="TechFlow Solutions", contact_person="Rajiv Mehta",
                 email="rajiv@techflow.com", phone="+91 98200 11223",
                 reliability_score=96.5, lead_time_days=3.2,
                 on_time_delivery_rate=98.2, quality_rating=97.0, rank=1),
        Supplier(name="GlobalChip Industries", contact_person="Anita Rao",
                 email="anita@globalchip.com", phone="+91 98200 44556",
                 reliability_score=94.2, lead_time_days=4.5,
                 on_time_delivery_rate=96.5, quality_rating=95.0, rank=2),
        Supplier(name="PrimeParts Trading", contact_person="Suresh Iyer",
                 email="suresh@primeparts.in", phone="+91 98200 77889",
                 reliability_score=91.0, lead_time_days=4.0,
                 on_time_delivery_rate=93.8, quality_rating=92.0, rank=3),
        Supplier(name="Nexus Components", contact_person="Deepa Nair",
                 email="deepa@nexuscomp.com", phone="+91 98200 33445",
                 reliability_score=89.0, lead_time_days=8.0,
                 on_time_delivery_rate=91.2, quality_rating=90.0, rank=4),
        Supplier(name="SwiftLogix Supply", contact_person="Arjun Patel",
                 email="arjun@swiftlogix.in", phone="+91 98200 55667",
                 reliability_score=87.0, lead_time_days=6.0,
                 on_time_delivery_rate=89.5, quality_rating=88.0, rank=5),
        Supplier(name="MegaSource Direct", contact_person="Kavita Singh",
                 email="kavita@megasource.com", phone="+91 98200 99001",
                 reliability_score=82.0, lead_time_days=10.0,
                 on_time_delivery_rate=85.1, quality_rating=83.0, rank=6),
    ]
    db.add_all(suppliers)
    db.flush()
    print("  ✅ Suppliers created")

    # ── 5. PRODUCTS ──
    products_data = [
        ("GLP-X1-001", "Gaming Laptop Pro X1", 0, 0, 62000, 89999, 84999, 79999, 94999),
        ("MKB-RGB-002", "Mechanical Keyboard RGB", 1, 1, 3200, 4999, 5499, 3999, 5999),
        ("WME-003", "Wireless Mouse Elite", 1, 0, 1500, 2499, 2299, 1999, 2999),
        ("UCH-004", "USB-C Hub Ultra", 4, 2, 2200, 3499, 3299, 2999, 3999),
        ("WHP-4K-005", "Webcam HD Pro 4K", 2, 1, 4800, 7999, 7499, 6999, 8999),
        ("MON-4K-006", "27\" 4K Monitor", 1, 0, 22000, 34999, 32999, 29999, 37999),
        ("NCH-007", "Noise Canceling Headset", 2, 2, 5400, 8999, 9499, 7999, 9999),
        ("SSD-1T-008", "Portable SSD 1TB", 3, 1, 4200, 6999, 6499, 5999, 7499),
        ("ECP-009", "Ergonomic Chair Pro", 5, 3, 15000, 24999, 23999, 21999, 27999),
        ("DLS-010", "Desk Lamp Smart LED", 4, 4, 1800, 2999, 2399, 1999, 3499),
        ("TBD-011", "Thunderbolt Dock", 4, 0, 8000, 12999, 12499, 10999, 14999),
        ("GMP-012", "Gaming Mouse Pad XL", 1, 5, 800, 1299, 1199, 999, 1499),
        ("UBS-14-013", "Ultrabook Slim 14\"", 0, 0, 48000, 64999, 62999, 58999, 69999),
        ("SPM-5G-014", "Smartphone Pro Max 5G", 0, 1, 55000, 74999, 71999, 68999, 79999),
        ("SWU-GPS-015", "Smart Watch Ultra GPS", 4, 2, 13000, 18999, 17999, 15999, 20999),
        ("ANC-EB-016", "ANC Earbuds Pro", 2, 3, 3800, 5999, 5499, 4999, 6499),
        ("CGM-34-017", "Curved Gaming Monitor 34\"", 1, 0, 36000, 49999, 46999, 43999, 53999),
        ("WGC-P-018", "Wireless Gamepad Pro", 1, 4, 2500, 3999, 3699, 3299, 4499),
        ("SMS-019", "Streamer Mic Studio Kit", 2, 1, 4200, 6499, 5999, 5499, 6999),
        ("WMR-6E-020", "Wi-Fi 6E Mesh Router", 4, 2, 9500, 14999, 13999, 12999, 15999),
        ("EHD-4T-021", "External Hard Drive 4TB", 3, 1, 5800, 8499, 7999, 7499, 8999),
        ("FPB-20K-022", "Fast Power Bank 20000mAh", 4, 4, 1500, 2499, 1874, 1699, 2799),
        ("SSC-2K-023", "Smart Security Cam 2K", 4, 2, 2400, 3799, 3499, 3199, 4199),
        ("MSD-024", "Motorized Standing Desk", 5, 3, 21000, 32999, 30999, 28999, 35999),
    ]
    products = []
    for sku, name, cat_idx, sup_idx, cost, price, suggested, min_p, max_p in products_data:
        p = Product(
            sku=sku, name=name,
            category_id=categories[cat_idx].id,
            supplier_id=suppliers[sup_idx].id,
            unit_cost=cost, selling_price=price,
            suggested_price=suggested, min_price=min_p, max_price=max_p
        )
        products.append(p)
    db.add_all(products)
    db.flush()
    print("  ✅ Products created")

    # ── 6. INVENTORY ──
    inventory_data = [
        (145, 50, 80, 300, "Warehouse A-1", InventoryStatus.HEALTHY),
        (312, 100, 150, 500, "Warehouse A-2", InventoryStatus.HEALTHY),
        (23, 80, 120, 400, "Warehouse A-1", InventoryStatus.CRITICAL),
        (89, 60, 90, 250, "Warehouse B-1", InventoryStatus.WARNING),
        (178, 40, 70, 200, "Warehouse A-3", InventoryStatus.HEALTHY),
        (56, 30, 45, 120, "Warehouse B-2", InventoryStatus.WARNING),
        (234, 70, 100, 350, "Warehouse A-2", InventoryStatus.HEALTHY),
        (167, 50, 80, 300, "Warehouse B-1", InventoryStatus.HEALTHY),
        (12, 15, 25, 60, "Warehouse C-1", InventoryStatus.CRITICAL),
        (445, 80, 120, 300, "Warehouse A-3", InventoryStatus.OVERSTOCK),
        (67, 30, 50, 150, "Warehouse B-2", InventoryStatus.HEALTHY),
        (523, 100, 150, 400, "Warehouse A-1", InventoryStatus.OVERSTOCK),
        (98, 40, 60, 200, "Warehouse A-1", InventoryStatus.HEALTHY),
        (215, 60, 100, 400, "Warehouse A-2", InventoryStatus.HEALTHY),
        (184, 50, 80, 300, "Warehouse B-1", InventoryStatus.HEALTHY),
        (340, 80, 120, 500, "Warehouse A-3", InventoryStatus.HEALTHY),
        (42, 20, 35, 100, "Warehouse B-2", InventoryStatus.WARNING),
        (290, 70, 110, 450, "Warehouse A-2", InventoryStatus.HEALTHY),
        (115, 35, 55, 200, "Warehouse B-1", InventoryStatus.HEALTHY),
        (76, 30, 50, 150, "Warehouse A-3", InventoryStatus.HEALTHY),
        (195, 50, 80, 350, "Warehouse B-2", InventoryStatus.HEALTHY),
        (410, 90, 130, 600, "Warehouse A-1", InventoryStatus.OVERSTOCK),
        (160, 40, 70, 300, "Warehouse B-1", InventoryStatus.HEALTHY),
        (18, 20, 30, 80, "Warehouse C-1", InventoryStatus.CRITICAL),
    ]
    inventories = []
    for i, (stock, safety, reorder, max_s, loc, status) in enumerate(inventory_data):
        inv = Inventory(
            product_id=products[i].id,
            current_stock=stock, safety_stock=safety,
            reorder_point=reorder, max_stock=max_s,
            warehouse_location=loc, status=status
        )
        inventories.append(inv)
    db.add_all(inventories)
    db.flush()
    print("  ✅ Inventory created")

    # ── 7. SALES — 2 years of daily synthetic sales data ──
    stores = ["Mumbai Central", "Delhi NCR", "Bangalore Tech", "Hyderabad Hub", "Pune Digital"]
    now = datetime.now()
    start_date = now - timedelta(days=730)  # 2 years
    
    sales = []
    for day_offset in range(730):
        sale_date = start_date + timedelta(days=day_offset)
        day_of_week = sale_date.weekday()
        month = sale_date.month
        
        # Seasonal multiplier: Q4 (Oct-Dec) peak for Indian retail
        seasonal = 1.0
        if month in (10, 11):  # Diwali season
            seasonal = 1.45
        elif month == 12:  # Christmas/New Year
            seasonal = 1.35
        elif month in (1, 6):  # Republic Day / Back to School
            seasonal = 1.15
        elif month == 3:  # Holi / End of Financial Year
            seasonal = 1.20
        
        # Weekend effect
        weekend_mult = 1.2 if day_of_week >= 5 else 1.0
        
        # Each product gets 0-5 sales per day
        for prod_idx, product in enumerate(products):
            # Base daily sales varies by product popularity
            base_sales = [3, 5, 7, 4, 3, 2, 4, 3, 1, 5, 1, 6][prod_idx]
            qty = max(0, int(base_sales * seasonal * weekend_mult + random.gauss(0, 1.5)))
            
            if qty > 0:
                # Slight price variation
                unit_price = product.selling_price * random.uniform(0.95, 1.02)
                total = round(unit_price * qty, 2)
                profit = round((unit_price - product.unit_cost) * qty, 2)
                store = random.choice(stores)
                
                sale = Sale(
                    product_id=product.id,
                    quantity=qty,
                    unit_price=round(unit_price, 2),
                    total_amount=total,
                    profit=profit,
                    store_location=store,
                    sale_date=sale_date + timedelta(hours=random.randint(9, 21), minutes=random.randint(0, 59))
                )
                sales.append(sale)
        
        # Batch insert every 90 days to avoid memory issues
        if day_offset % 90 == 0 and sales:
            db.add_all(sales)
            db.flush()
            sales = []
    
    if sales:
        db.add_all(sales)
        db.flush()
    print(f"  ✅ Sales created (~{730 * 6} records over 2 years)")

    # ── 8. PURCHASE ORDERS ──
    po_list = []
    for i in range(15):
        po_date = now - timedelta(days=random.randint(1, 180))
        supplier = random.choice(suppliers)
        statuses = ["Pending", "Approved", "Shipped", "Delivered"]
        po = PurchaseOrder(
            po_number=f"PO-2026-{str(i+1).zfill(3)}",
            supplier_id=supplier.id,
            total_cost=round(random.uniform(50000, 500000), 2),
            status=random.choice(statuses),
            order_date=po_date,
            expected_delivery=po_date + timedelta(days=int(supplier.lead_time_days) + random.randint(0, 3))
        )
        po_list.append(po)
    db.add_all(po_list)
    db.flush()
    print("  ✅ Purchase orders created")

    # ── 9. AI RECOMMENDATIONS ──
    recommendations = [
        AIRecommendation(
            title="Immediate Restock: Wireless Mouse Elite",
            agent_name="Inventory + Supplier Agent",
            priority="Critical", category="Inventory",
            description="Stock at 23 units (safety: 80). At current burn rate of ~45 units/week, stockout in 3.5 days. Emergency PO to TechFlow Solutions recommended.",
            reasoning="Inventory Agent detected current_stock (23) < safety_stock (80). Supplier Agent identified TechFlow Solutions as optimal vendor with 3.2-day lead time and 98.2% on-time delivery rate.",
            expected_impact="Prevent ₹2.3L revenue loss",
            confidence_score=96.5,
            status=RecommendationStatus.PENDING,
            action_data={"product_id": 3, "action": "restock", "quantity": 200, "supplier": "TechFlow Solutions"}
        ),
        AIRecommendation(
            title="Price Reduction: Gaming Laptop Pro X1",
            agent_name="Pricing + Demand Agent",
            priority="High", category="Pricing",
            description="Currently overpriced by ₹5,000 vs market. Reducing to ₹84,999 projects +12% sales volume with minimal margin impact.",
            reasoning="Pricing Agent found selling_price (₹89,999) > suggested_price (₹84,999). Demand Agent confirms price elasticity of -1.8 for this product category.",
            expected_impact="Projected +₹1.7L revenue",
            confidence_score=92.5,
            status=RecommendationStatus.PENDING,
            action_data={"product_id": 1, "action": "price_change", "new_price": 84999}
        ),
        AIRecommendation(
            title="Clearance Campaign: Desk Lamp Smart LED",
            agent_name="Inventory + Pricing Agent",
            priority="Medium", category="Inventory",
            description="445 units in stock (max: 300). 20% discount campaign recommended to clear 150+ excess units within 2 weeks.",
            reasoning="Inventory Agent detected overstock: current_stock (445) > max_stock (300). Pricing Agent calculated optimal clearance discount at 20% to maximize capital recovery.",
            expected_impact="Free up ₹4.5L working capital",
            confidence_score=89.0,
            status=RecommendationStatus.PENDING,
            action_data={"product_id": 10, "action": "discount", "discount_percent": 20}
        ),
    ]
    db.add_all(recommendations)
    db.flush()
    print("  ✅ AI recommendations created")

    # ── 10. REPORTS ──
    report_list = [
        Report(title="Weekly Performance Report", report_type="Weekly",
               status="Ready", highlights=["Revenue up 8.2%", "3 new AI insights", "2 restock alerts"],
               created_at=now - timedelta(days=7)),
        Report(title="Monthly Business Review", report_type="Monthly",
               status="Ready", highlights=["₹4.8M revenue milestone", "94% forecast accuracy", "Top supplier: TechFlow"],
               created_at=now - timedelta(days=30)),
        Report(title="Executive Summary Q4 2025", report_type="Executive",
               status="Ready", highlights=["35% YoY growth", "AI adoption at 96%", "12 new product launches"],
               created_at=now - timedelta(days=180)),
    ]
    db.add_all(report_list)
    db.flush()
    print("  ✅ Reports created")

    # ── 11. AUDIT LOGS ──
    audit_logs = [
        AuditLog(user_id=users[0].id, action="User Login", entity_type="Auth",
                 details="Successful login from admin account", ip_address="127.0.0.1"),
        AuditLog(user_id=users[1].id, action="Recommendation Approved", entity_type="AIRecommendation",
                 entity_id=1, details="Manager approved restock recommendation for Wireless Mouse Elite"),
    ]
    db.add_all(audit_logs)

    db.commit()
    db.close()
    print("\n🎉 Database seeded successfully!")
    print("   Login credentials:")
    print("   Admin:    chinmay@retailmind.ai / admin123")
    print("   Manager:  priya@retailmind.ai / manager123")
    print("   Analyst:  vikram@retailmind.ai / analyst123")

if __name__ == "__main__":
    seed()
