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
from app.kaggle_loader import load_kaggle_products_and_sales


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

def seed(force: bool = False):
    init_db()
    db = SessionLocal()

    # Skip if already seeded and force is False
    if not force and db.query(Role).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    if force:
        print("🧹 Force re-seeding database...")
        try:
            from app.database import engine
            from app.models.models import Base
            db.close()
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            print("  ✅ Database schema recreated cleanly")
        except Exception as e:
            print(f"⚠️ Clean recreate warning: {e}")
            db = SessionLocal()


    print("🌱 Seeding RetailMind AI database...")

    # ── 1. ROLES ──
    roles = db.query(Role).all()
    if not roles:
        roles = [
            Role(name="Admin", description="Full administrative permissions"),
            Role(name="Retail Manager", description="Store and inventory management access"),
            Role(name="Business Analyst", description="Analytics and reporting access"),
        ]
        db.add_all(roles)
        db.flush()
        print("  ✅ Roles created")


    # ── 2. USERS ──
    users = db.query(User).all()
    if not users:
        users = [
            User(
                first_name="Chinmay", last_name="R.",
                email="chinmay@retailmind.ai",
                hashed_password=_hash("admin123"),
                role="Admin", role_id=roles[0].id if roles else 1,
                organization="RetailMind Corp"
            ),
            User(
                first_name="Priya", last_name="Sharma",
                email="priya@retailmind.ai",
                hashed_password=_hash("manager123"),
                role="Retail Manager", role_id=roles[1].id if len(roles) > 1 else 1,
                organization="RetailMind Corp"
            ),
            User(
                first_name="Vikram", last_name="Desai",
                email="vikram@retailmind.ai",
                hashed_password=_hash("analyst123"),
                role="Business Analyst", role_id=roles[2].id if len(roles) > 2 else 1,
                organization="RetailMind Corp"
            ),
        ]
        db.add_all(users)
        db.flush()
        print("  ✅ Users created")
    else:
        print("  ✅ Users already exist")


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

    # ── 3.5 CUSTOMERS ──
    from app.models.models import Customer
    customers_data = [
        Customer(name="Aarav Sharma", email="aarav@gmail.com", phone="+91 98210 12345", city="Mumbai", customer_type="Retail", total_purchases=45000.0),
        Customer(name="Ananya Patel", email="ananya@yahoo.com", phone="+91 98210 23456", city="Delhi", customer_type="Retail", total_purchases=68000.0),
        Customer(name="Rohan Verma", email="rohan@outlook.com", phone="+91 98210 34567", city="Bangalore", customer_type="Wholesale", total_purchases=240000.0),
        Customer(name="Diya Iyer", email="diya@techcorp.in", phone="+91 98210 45678", city="Hyderabad", customer_type="Corporate", total_purchases=520000.0),
        Customer(name="Kabir Nair", email="kabir@gmail.com", phone="+91 98210 56789", city="Pune", customer_type="Retail", total_purchases=31000.0),
    ]
    db.add_all(customers_data)
    db.flush()
    print("  ✅ Customers created")


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

    # Built-in fallback product catalog (used when Kaggle is unavailable)
    BUILTIN_PRODUCTS = [
        # Laptops & PCs
        {"sku": "TF-LAP-001", "name": "Gaming Laptop Pro X1", "category": "Laptops & PCs", "unit_cost": 62000, "selling_price": 89999, "suggested_price": 84999, "min_price": 68200, "max_price": 116999},
        {"sku": "TF-LAP-002", "name": "UltraBook Elite 15", "category": "Laptops & PCs", "unit_cost": 48000, "selling_price": 69999, "suggested_price": 66499, "min_price": 52800, "max_price": 90999},
        {"sku": "TF-LAP-003", "name": "WorkStation Pro Max", "category": "Laptops & PCs", "unit_cost": 75000, "selling_price": 109999, "suggested_price": 104499, "min_price": 82500, "max_price": 142999},
        {"sku": "TF-LAP-004", "name": "Budget Chromebook 14", "category": "Laptops & PCs", "unit_cost": 18000, "selling_price": 26999, "suggested_price": 25649, "min_price": 19800, "max_price": 35099},
        {"sku": "TF-PC-001", "name": "Desktop All-in-One 27\"", "category": "Laptops & PCs", "unit_cost": 42000, "selling_price": 61999, "suggested_price": 58899, "min_price": 46200, "max_price": 80599},
        # Peripherals
        {"sku": "GC-PER-001", "name": "Mechanical Gaming Keyboard RGB", "category": "Peripherals", "unit_cost": 2800, "selling_price": 4499, "suggested_price": 4274, "min_price": 3080, "max_price": 5849},
        {"sku": "GC-PER-002", "name": "Wireless Mouse Elite", "category": "Peripherals", "unit_cost": 1200, "selling_price": 1999, "suggested_price": 1899, "min_price": 1320, "max_price": 2599},
        {"sku": "GC-PER-003", "name": "4K Monitor UHD 32\"", "category": "Peripherals", "unit_cost": 22000, "selling_price": 32999, "suggested_price": 31349, "min_price": 24200, "max_price": 42899},
        {"sku": "GC-PER-004", "name": "Gaming Mouse Pad XL", "category": "Peripherals", "unit_cost": 400, "selling_price": 699, "suggested_price": 664, "min_price": 440, "max_price": 909},
        {"sku": "GC-PER-005", "name": "USB-C Hub 7-in-1", "category": "Peripherals", "unit_cost": 1500, "selling_price": 2499, "suggested_price": 2374, "min_price": 1650, "max_price": 3249},
        # Audio & Video
        {"sku": "PP-AV-001", "name": "Noise Cancelling Headset Pro", "category": "Audio & Video", "unit_cost": 5500, "selling_price": 8499, "suggested_price": 8074, "min_price": 6050, "max_price": 11049},
        {"sku": "PP-AV-002", "name": "Webcam 4K AutoFocus", "category": "Audio & Video", "unit_cost": 3200, "selling_price": 4999, "suggested_price": 4749, "min_price": 3520, "max_price": 6499},
        {"sku": "PP-AV-003", "name": "Bluetooth Speaker 30W", "category": "Audio & Video", "unit_cost": 2800, "selling_price": 4299, "suggested_price": 4084, "min_price": 3080, "max_price": 5589},
        {"sku": "PP-AV-004", "name": "True Wireless Earbuds ANC", "category": "Audio & Video", "unit_cost": 3500, "selling_price": 5499, "suggested_price": 5224, "min_price": 3850, "max_price": 7149},
        # Storage
        {"sku": "NC-STO-001", "name": "NVMe SSD 1TB", "category": "Storage", "unit_cost": 4800, "selling_price": 7499, "suggested_price": 7124, "min_price": 5280, "max_price": 9749},
        {"sku": "NC-STO-002", "name": "External HDD 2TB", "category": "Storage", "unit_cost": 3200, "selling_price": 4999, "suggested_price": 4749, "min_price": 3520, "max_price": 6499},
        {"sku": "NC-STO-003", "name": "Portable SSD 512GB", "category": "Storage", "unit_cost": 2800, "selling_price": 4299, "suggested_price": 4084, "min_price": 3080, "max_price": 5589},
        # Accessories
        {"sku": "SL-ACC-001", "name": "Smart LED Desk Lamp", "category": "Accessories", "unit_cost": 1200, "selling_price": 1999, "suggested_price": 1899, "min_price": 1320, "max_price": 2599},
        {"sku": "SL-ACC-002", "name": "Laptop Stand Ergonomic", "category": "Accessories", "unit_cost": 900, "selling_price": 1499, "suggested_price": 1424, "min_price": 990, "max_price": 1949},
        {"sku": "SL-ACC-003", "name": "Cable Management Kit", "category": "Accessories", "unit_cost": 400, "selling_price": 699, "suggested_price": 664, "min_price": 440, "max_price": 909},
        {"sku": "SL-ACC-004", "name": "Screen Cleaning Kit", "category": "Accessories", "unit_cost": 200, "selling_price": 349, "suggested_price": 332, "min_price": 220, "max_price": 454},
        # Furniture
        {"sku": "MD-FUR-001", "name": "Gaming Chair Pro Ergonomic", "category": "Furniture", "unit_cost": 8500, "selling_price": 13999, "suggested_price": 13299, "min_price": 9350, "max_price": 18199},
        {"sku": "MD-FUR-002", "name": "Standing Desk Electric 140cm", "category": "Furniture", "unit_cost": 12000, "selling_price": 18999, "suggested_price": 18049, "min_price": 13200, "max_price": 24699},
        {"sku": "MD-FUR-003", "name": "Monitor Arm Dual VESA", "category": "Furniture", "unit_cost": 2200, "selling_price": 3499, "suggested_price": 3324, "min_price": 2420, "max_price": 4549},
    ]

    # Load real Kaggle dataset
    kaggle_products, _ = load_kaggle_products_and_sales(max_items=50)

    products = []
    if kaggle_products:
        print(f"  📥 Seeding {len(kaggle_products)} real products from Kaggle dataset...")
        cat_map = {}
        for kp in kaggle_products:
            cname = kp['category']
            if cname not in cat_map:
                cat_obj = db.query(Category).filter(Category.name == cname).first()
                if not cat_obj:
                    cat_obj = Category(name=cname, description=f"Kaggle Retail Category: {cname}")
                    db.add(cat_obj)
                    db.flush()
                cat_map[cname] = cat_obj

        for i, kp in enumerate(kaggle_products):
            sup_idx = i % len(suppliers)
            p = Product(
                sku=kp['sku'],
                name=kp['name'],
                category_id=cat_map[kp['category']].id,
                supplier_id=suppliers[sup_idx].id,
                unit_cost=kp['unit_cost'],
                selling_price=kp['selling_price'],
                suggested_price=kp['suggested_price'],
                min_price=kp['min_price'],
                max_price=kp['max_price']
            )
            products.append(p)
        db.add_all(products)
        db.flush()
        print("  ✅ Real Kaggle dataset products created successfully")
    else:
        print("  📦 Kaggle unavailable — using built-in product catalog...")
        # Build category map from existing categories
        cat_map = {c.name: c for c in db.query(Category).all()}
        for i, bp in enumerate(BUILTIN_PRODUCTS):
            cname = bp['category']
            if cname not in cat_map:
                cat_obj = Category(name=cname, description=f"Retail Category: {cname}")
                db.add(cat_obj)
                db.flush()
                cat_map[cname] = cat_obj
            sup_idx = i % len(suppliers)
            p = Product(
                sku=bp['sku'],
                name=bp['name'],
                category_id=cat_map[cname].id,
                supplier_id=suppliers[sup_idx].id,
                unit_cost=bp['unit_cost'],
                selling_price=bp['selling_price'],
                suggested_price=bp['suggested_price'],
                min_price=bp['min_price'],
                max_price=bp['max_price']
            )
            products.append(p)
        db.add_all(products)
        db.flush()
        print(f"  ✅ {len(products)} built-in products created successfully")



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
    if products:
        for i, (stock, safety, reorder, max_s, loc, status) in enumerate(inventory_data):
            p = products[i % len(products)]
            inv = Inventory(
                product_id=p.id,
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
            base_sales = [3, 5, 7, 4, 3, 2, 4, 3, 1, 5, 1, 6][prod_idx % 12]

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
