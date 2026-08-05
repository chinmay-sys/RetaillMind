# RetailMind AI

### **An Agentic Retail Decision Intelligence Platform**

![React](https://img.shields.io/badge/Frontend-React_18-5B5CEB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Language-Python_3.11-3776AB?style=for-the-badge&logo=python)
![LangGraph](https://img.shields.io/badge/AI_Agents-LangGraph-7C3AED?style=for-the-badge)
![Prophet](https://img.shields.io/badge/ML-Prophet_%2B_XGBoost-14B8A6?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

---

## 🌟 Overview

**RetailMind AI** is an enterprise-grade AI decision intelligence platform designed to assist retail managers and business leaders in making data-driven operational decisions.

> ⚠️ **Note**: RetailMind AI is **NOT** a standard inventory management software. It is a **Business Decision Intelligence Platform** leveraging Machine Learning, Agentic AI, Retrieval Augmented Generation (RAG), and Explainable AI (XAI) to transform raw retail data into actionable, human-in-the-loop decisions.

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
- **ORM & DB**: SQLAlchemy & PostgreSQL
- **Data Validation**: Pydantic v2
- **Authentication**: OAuth2 + JWT (JSON Web Tokens) with Password Hashing (bcrypt)

### **Machine Learning & Agentic AI**
- **Forecasting Pipeline**: Prophet (Seasonality & Trend) + XGBoost (Lag & Rolling Feature Regressor)
- **Multi-Agent Orchestrator**: LangGraph / LangChain Framework
- **RAG & Vector Database**: Qdrant Vector Store + LangChain Retriever
- **LLM Integration**: OpenAI GPT-4 / Google Gemini API

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
│   │   │   └── forecaster.py   # Prophet + XGBoost Ensemble Model
│   │   ├── models/             # SQLAlchemy Database Models (12 Tables)
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

## 💻 Installation & Setup Guide

### **Prerequisites**
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL** *(optional for local live backend)*

---

### **1. Frontend Setup**

```bash
# Navigate to the project root
cd "RetailMind Ai"

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### **2. Backend Setup (FastAPI)**

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI server with live reload
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at `http://localhost:8000/docs`.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT Token |
| `POST` | `/api/v1/auth/register` | Register a new Retail Manager / Admin |
| `GET` | `/api/v1/ai-center/status` | Fetch real-time agent status & recommendations |
| `POST` | `/api/v1/ai-center/decisions/review` | Human-in-the-Loop decision review (*Approve/Modify/Reject*) |
| `GET` | `/api/v1/forecast/30-day` | Fetch 30-day Prophet+XGBoost demand predictions |
| `POST` | `/api/v1/chat/query` | RAG-powered query endpoint for business decision chat |
| `GET` | `/api/v1/inventory/status` | Fetch inventory health & stock counts |
| `GET` | `/api/v1/pricing/recommendations` | Fetch price elasticity & discount strategies |
| `GET` | `/api/v1/suppliers/scorecard` | Fetch supplier performance rankings & lead times |

---

## 🎓 Final Year Engineering Project Details

- **Project Title**: RetailMind AI — An Agentic Retail Decision Intelligence Platform
- **Domain**: Artificial Intelligence, Machine Learning, Full Stack Engineering
- **Key Concepts Demonstrated**: Multi-Agent Orchestration (LangGraph), Ensemble Time-Series Forecasting (Prophet + XGBoost), Vector RAG Retrieval (Qdrant), Explainable AI (XAI), Human-in-the-Loop (HITL), Micro-Frontend Architecture.
