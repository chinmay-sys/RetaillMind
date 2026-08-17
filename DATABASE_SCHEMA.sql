-- =========================================================
-- RetailMind AI - PostgreSQL Database Schema & DDL Script
-- Author: RetailMind AI Engineering Team
-- =========================================================

CREATE TYPE user_role_enum AS ENUM ('Admin', 'Retail Manager', 'Business Analyst');
CREATE TYPE rec_status_enum AS ENUM ('Pending', 'Approved', 'Modified', 'Rejected');

-- 1. ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role_enum DEFAULT 'Retail Manager',
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    organization VARCHAR(150) DEFAULT 'RetailMind Corp',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 CUSTOMERS TABLE
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    city VARCHAR(100) DEFAULT 'Mumbai',
    customer_type VARCHAR(50) DEFAULT 'Retail',
    total_purchases FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 4. SUPPLIERS TABLE
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    reliability_score FLOAT DEFAULT 90.0,
    lead_time_days FLOAT DEFAULT 5.0,
    on_time_delivery_rate FLOAT DEFAULT 95.0,
    quality_rating FLOAT DEFAULT 92.0,
    rank INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS TABLE
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    suggested_price NUMERIC(12, 2),
    min_price NUMERIC(12, 2),
    max_price NUMERIC(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. INVENTORY TABLE
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    current_stock INT DEFAULT 0,
    safety_stock INT DEFAULT 20,
    reorder_point INT DEFAULT 30,
    max_stock INT DEFAULT 200,
    warehouse_location VARCHAR(100) DEFAULT 'Warehouse A-1',
    status VARCHAR(50) DEFAULT 'Healthy',
    last_restocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SALES TABLE
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL,
    store_location VARCHAR(100) DEFAULT 'Mumbai Central',
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. PURCHASE ORDERS TABLE
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE CASCADE,
    total_cost NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery TIMESTAMP
);

-- 9. FORECASTS TABLE
CREATE TABLE forecasts (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    forecast_date TIMESTAMP NOT NULL,
    predicted_demand FLOAT NOT NULL,
    lower_bound FLOAT,
    upper_bound FLOAT,
    actual_demand FLOAT,
    model_name VARCHAR(50) DEFAULT 'XGBoost-Demand-Forecaster',
    confidence_score FLOAT DEFAULT 94.2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. AI RECOMMENDATIONS TABLE (Human-in-the-Loop)
CREATE TABLE ai_recommendations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    category VARCHAR(50),
    description TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    expected_impact VARCHAR(255),
    confidence_score FLOAT DEFAULT 95.0,
    status rec_status_enum DEFAULT 'Pending',
    action_data JSONB,
    reviewed_by INT REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. REPORTS TABLE
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Ready',
    highlights JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. CUSTOMER REVIEWS TABLE
CREATE TABLE customer_reviews (
    id SERIAL PRIMARY KEY,
    external_review_id VARCHAR(100) NOT NULL,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'DEMO REVIEW SOURCE',
    review_text TEXT NOT NULL,
    rating FLOAT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment VARCHAR(20) DEFAULT 'NEUTRAL',
    sentiment_score FLOAT DEFAULT 0.0,
    detected_aspects JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uix_ext_review_source UNIQUE (external_review_id, source)
);

-- 14. REVIEW SYNC HEALTH TABLE
CREATE TABLE review_sync_health (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) UNIQUE NOT NULL,
    last_successful_sync TIMESTAMP,
    last_attempted_sync TIMESTAMP,
    number_of_reviews_received INT DEFAULT 0,
    sync_status VARCHAR(50) DEFAULT 'UNAVAILABLE',
    error_message TEXT,
    freshness_threshold_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date);
CREATE INDEX idx_customer_reviews_date ON customer_reviews(review_date);
CREATE INDEX idx_customer_reviews_product ON customer_reviews(product_id);

-- SEED DATA
INSERT INTO roles (name, description) VALUES
('Admin', 'Full administrative permissions'),
('Retail Manager', 'Store and inventory management access'),
('Business Analyst', 'Analytics and reporting access');

INSERT INTO categories (name, description) VALUES
('Laptops & PCs', 'Computers, laptops and work stations'),
('Peripherals', 'Keyboards, mice, monitors'),
('Audio & Video', 'Headphones, webcams, speakers');

INSERT INTO suppliers (name, contact_person, email, phone, reliability_score, lead_time_days, rank) VALUES
('TechFlow Solutions', 'Rajiv Mehta', 'rajiv@techflow.com', '+91 98200 11223', 96.5, 3.2, 1),
('GlobalChip Corp', 'Anita Rao', 'anita@globalchip.com', '+91 98200 44556', 94.2, 4.5, 2);
