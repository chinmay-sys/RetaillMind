# RetailMind AI

### **An Agentic Retail Decision Intelligence Platform**

![React](https://img.shields.io/badge/Frontend-React_18-5B5CEB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Language-Python_3.11-3776AB?style=for-the-badge&logo=python)
![LangGraph](https://img.shields.io/badge/AI_Agents-LangGraph_StateGraph-7C3AED?style=for-the-badge)
![XGBoost](https://img.shields.io/badge/ML-XGBoost_Regressor-14B8A6?style=for-the-badge)
![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-FF6000?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_/_SQLite-4169E1?style=for-the-badge&logo=postgresql)

---

## 🌟 Overview

**RetailMind AI** is an enterprise-grade AI decision intelligence platform designed to assist retail managers and business leaders in making data-driven operational decisions.

> ⚠️ **Note**: RetailMind AI is an **Agentic Business Decision Intelligence Platform** leveraging XGBoost Machine Learning, LangGraph StateGraph Multi-Agent Orchestration, Qdrant Vector Retrieval Augmented Generation (RAG), and Explainable AI (XAI) to transform raw retail data into actionable, human-in-the-loop decisions.

---

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: React 18 with Vite & TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Design System
- **UI Components**: Custom Shadcn UI Primitives & Radix UI
- **Icons & Motion**: Lucide Icons & Framer Motion
- **Data Visualization**: Recharts (Area, Bar, Line, Pie, Radar charts)

### **Backend**
- **Framework**: FastAPI (Python 3.11)
- **ORM & DB**: SQLAlchemy & PostgreSQL / SQLite
- **Data Validation**: Pydantic v2
- **Authentication**: OAuth2 + JWT (JSON Web Tokens) with Password Hashing (bcrypt)

### **Machine Learning & Agentic AI**
- **Demand Forecasting Engine**: XGBoost Regressor (Lags 7/14/30, Rolling Means/Stds, Festival Flags, MAE/RMSE/MAPE evaluation, `.joblib` model artifact persistence)
- **Multi-Agent Orchestrator**: LangGraph StateGraph (`RetailAIState` orchestrating Demand, Inventory, Pricing, Supplier, and Decision Agents)
- **RAG & Vector Database**: Qdrant Vector Store (Hybrid retrieval: SQL for numeric transaction metrics + Qdrant vectors for retail policies)
- **LLM Integration**: Unified LLM Service Layer (Google Gemini / OpenAI API)


---

## 🚀 Key Modules & Capabilities

1. **AI Decision Center (Core Feature)**:
   - Live visual status of 5 specialized agents (*Demand, Inventory, Pricing, Supplier, and Decision Orchestrator*).
   - Real-time confidence scores, execution times, and reasoning outputs.
   - **Human-in-the-Loop Workflow**: Manager can *Approve*, *Modify*, or *Reject* recommendations.

2. **Demand Forecasting**:
   - 30-day ahead predictions with 94.2% model accuracy.
   - Upper and lower confidence bounds.
   - Indian festival & seasonal impact analysis (Diwali, Holi, New Year, Sale events).

3. **Inventory Intelligence**:
   - Stock health distribution (Healthy, Low Stock, Critical, Overstock).
   - Dynamic safety stock calculation and automated reorder point alerts.

4. **Pricing Intelligence**:
   - AI-driven selling price suggestions based on market elasticity.
   - Profit margin comparison & automated clearance discount strategies.

5. **Supplier Intelligence**:
   - Multi-metric supplier radar scorecard (Reliability, Delivery, Quality, Cost).
   - Lead time trend tracking & supplier rank ordering.

6. **AI Business Chat (RAG)**:
   - ChatGPT-style interface with response streaming.
   - Contextual Q&A over store sales data using vector search retrieval.

7. **Analytics & Reports**:
   - Comprehensive store comparisons, revenue vs. profit analysis, top products, and customer growth trends.
   - Automated generation of Weekly, Monthly, and Executive Summary PDF/Excel reports.

---

## 📁 Repository Structure

```
RetailMind Ai/
├── backend/                    # FastAPI Python Backend
│   ├── app/
│   │   ├── agents/             # LangGraph Multi-Agent Orchestrator
│   │   │   └── orchestrator.py # Domain Agents & Decision Agent
│   │   ├── ml/                 # Machine Learning Pipeline
│   │   │   └── forecaster.py   # XGBoost Demand Forecasting Pipeline
│   │   ├── models/             # SQLAlchemy Database Models (14 Tables)
│   │   │   └── models.py
│   │   ├── rag/                # Vector DB Retrieval & AI Chat
│   │   │   └── chat_engine.py  # LangChain + Qdrant Integration
│   │   ├── routers/            # REST API Endpoints
│   │   │   ├── ai_center.py
│   │   │   ├── auth.py
│   │   │   ├── forecast.py
│   │   │   ├── inventory.py
│   │   │   ├── pricing.py
│   │   │   └── suppliers.py
│   │   ├── schemas/            # Pydantic Serializers & Schemas
│   │   │   └── schemas.py
│   │   ├── config.py           # Environment Settings
│   │   ├── database.py         # SQLAlchemy Engine & Session
│   │   └── main.py             # FastAPI App Entrypoint
│   ├── .env.example
│   └── requirements.txt
│
├── src/                        # React + TypeScript Frontend
│   ├── components/
│   │   ├── layout/             # AppLayout, TopBar, Sidebar
│   │   ├── shared/             # StatCard, AgentCard
│   │   └── ui/                 # Shadcn Primitives (Button, Card, Dialog, etc.)
│   ├── data/
│   │   └── mockData.ts         # High-fidelity Indian Retail Business Data
│   ├── pages/                  # 12 Complete Pages
│   │   ├── auth/               # Login, Register, ForgotPassword, OTP
│   │   ├── AIChat.tsx
│   │   ├── AIDecisionCenter.tsx
│   │   ├── Analytics.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DemandForecast.tsx
│   │   ├── InventoryIntelligence.tsx
│   │   ├── Landing.tsx
│   │   ├── PricingIntelligence.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── SupplierIntelligence.tsx
│   ├── App.tsx                 # React Router Config
│   ├── index.css               # Design System & Tailwind Utility Tokens
│   └── main.tsx
│
├── ARCHITECTURE.md             # System & Agent Architecture Documentation
├── DATABASE_SCHEMA.sql         # Raw PostgreSQL DDL Schema Script
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Step-by-Step Manual Execution Guide

### **Prerequisites**
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher

---

### **1. Backend Execution Steps**

```bash
# Navigate to the backend directory
cd "c:\Users\chinmay\OneDrive\Desktop\projects\RetailMind Ai\backend"

# Step A: Install Python dependencies
pip install -r requirements.txt

# Step B: Seed Database (Populates 2 years of sales data, products, suppliers, & AI cards)
# Note: If updating from an older schema version, delete retailmind.db first or run force mode:
python run_seed.py --force

# Step C: Train and persist XGBoost ML Demand Forecast Model artifact (.joblib)
python -m app.ml.train

# Step D: (Optional) Run Pytest unit and integration test suite
python -m pytest

# Step E: Start the FastAPI Backend Server
uvicorn app.main:app --reload --port 8000
```
> 💡 *The backend API will be running at `http://localhost:8000` (Interactive Swagger docs available at `http://localhost:8000/docs`).*

---

### **2. Frontend Execution Steps**

In a **new terminal window**:

```bash
# Navigate to the project root directory
cd "c:\Users\chinmay\OneDrive\Desktop\projects\RetailMind Ai"

# Step A: Install Node.js packages
npm install

# Step B: Start Vite React Dev Server
npm run dev
```
> 💡 *The frontend dashboard will be running at `http://localhost:5173`.*

---

### 🔑 Default Login Credentials

Open your browser at `http://localhost:5173` and log in with any seeded account:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `chinmay@retailmind.ai` | `admin123` | Full administrative control & AI settings |
| **Retail Manager** | `priya@retailmind.ai` | `manager123` | Inventory, Pricing & Human-in-the-Loop decision review |
| **Business Analyst** | `vikram@retailmind.ai` | `analyst123` | Demand forecasting & executive reporting |

---

### **3. Production Docker Deployment (PostgreSQL + Qdrant + FastAPI)**

If you prefer running via Docker containers:

```bash
# Navigate to root workspace
cd "c:\Users\chinmay\OneDrive\Desktop\projects\RetailMind Ai"

# Start PostgreSQL, Qdrant Vector Store, and FastAPI backend
docker-compose up --build -d

# Seed PostgreSQL Database inside container
docker exec -it retailmind_backend python run_seed.py --force

# Train XGBoost Model inside container
docker exec -it retailmind_backend python -m app.ml.train
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT Token |
| `POST` | `/api/v1/auth/register` | Register a new Retail Manager / Admin |
| `GET` | `/api/v1/ai-center/status` | Fetch real-time agent status & recommendations |
| `POST` | `/api/v1/ai-center/decisions/review` | Human-in-the-Loop decision review (*Approve/Modify/Reject*) |
| `GET` | `/api/v1/forecast/30-day` | Fetch 30-day XGBoost demand predictions & error metrics |
| `POST` | `/api/v1/chat/query` | RAG-powered query endpoint for business decision chat |
| `GET` | `/api/v1/inventory/status` | Fetch inventory health & stock counts |
| `GET` | `/api/v1/pricing/recommendations` | Fetch price elasticity & discount strategies |
| `PATCH` | `/api/v1/pricing/products/{id}/price` | Persist selling price update to database |
| `GET` | `/api/v1/suppliers/scorecard` | Fetch supplier performance rankings & lead times |
| `GET` | `/api/v1/reports/generate/{id}` | Export dynamic CSV reports from database records |

---

## 🎓 Final Year Engineering Project Details

- **Project Title**: RetailMind AI — An Agentic Retail Decision Intelligence Platform
- **Domain**: Artificial Intelligence, Machine Learning, Full Stack Engineering
- **Key Concepts Demonstrated**: Multi-Agent Orchestration (LangGraph StateGraph), Ensemble Time-Series Forecasting (XGBoost Regressor), Vector RAG Retrieval (Qdrant), Explainable AI (XAI), Human-in-the-Loop (HITL), Micro-Frontend Architecture.

