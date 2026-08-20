# 🍽️ FoodLoop — Smart Food Rescue & Community Resource Platform

> **LoopLearn Hackathon 2026 · Problem Statement PS-04**  
> **SDG Alignment:** Zero Hunger (2) · Sustainable Cities (11) · Responsible Consumption (12) · Climate Action (13)

---

## 📌 Executive Summary

Every day, commercial kitchens, caterers, and supermarkets discard tons of edible, high-quality food, while local charities and shelters struggle to source nutritious meals for vulnerable communities. **FoodLoop** bridges this gap with an intelligent, end-to-end food rescue ecosystem.

Powered by **Groq High-Speed LLM Inference**, **Retrieval-Augmented Generation (RAG)** for food safety compliance, **Agentic AI** for autonomous supply-demand matching, and a **microservices backend with containerized DevOps automation**, FoodLoop transforms perishable food surplus into community meals while tracking environmental impact in real time.

---

## 🌍 UN Sustainable Development Goals (SDGs)

| Goal | Target Alignment | FoodLoop Measurable Impact |
|---|---|---|
| **SDG 2: Zero Hunger** | Target 2.1 & 2.2 | Connects wholesome surplus meals directly with verified food banks and shelters. |
| **SDG 11: Sustainable Cities** | Target 11.6 | Mitigates urban municipal waste strain through decentralized local food rescue networks. |
| **SDG 12: Responsible Consumption** | Target 12.3 | Reduces commercial food loss and empowers kitchens with AI waste reduction insights. |
| **SDG 13: Climate Action** | Target 13.2 | Prevents methane generation from landfills: **1 kg rescued food ≈ 2.5 kg CO₂e avoided**. |

---

## 🏗️ Architecture & Microservices Matrix

```text
┌─────────────────────────────────────────────────────────┐
│              React 18 + Vite Web Application             │
│   Food Donors Hub · Community Org Hub · Municipal Admin │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼─────────────────────────────┐
│                 API Gateway (Express.js :4000)          │
│   Proxy routing · Health aggregation · Error handling   │
└───┬───────────────────────┬─────────────────────────┬───┘
    │                       │                         │
    ▼                       ▼                         ▼
┌──────────────┐    ┌──────────────┐         ┌────────────────┐
│ Auth Service │    │ Core Service │         │   AI Service   │
│ Port: 4001   │    │ Port: 4002   │         │   Port: 5000   │
│ (Node.js)    │    │ (Node.js)    │         │   (FastAPI/Groq)
└───┬──────────┘    └───┬──────────┘         └───┬────────────┘
    │                   │                        │
    ▼                   ▼                        ▼
┌──────────────────────────────────┐         ┌────────────────┐
│   MongoDB Database (Collections) │         │ RAG Knowledge  │
│   users · foodlistings · stats   │         │ + Groq Engine  │
└──────────────────────────────────┘         └────────────────┘
```

| Service | Technology | Port | Primary Responsibility |
|---|---|---|---|
| **API Gateway** | Node.js / Express | `4000` | Unified gateway routing `/api/*` proxies, health checks, error boundaries |
| **Auth Microservice** | Node.js / Express / JWT | `4001` | Role-based auth (Provider, Org, Admin), bcrypt security, profile management |
| **Core Microservice** | Node.js / Express / Cron | `4002` | Food listing CRUD, claim requests, auto-expiration cron, sustainability math |
| **AI & RAG Service** | Python 3.11 / FastAPI | `5000` | Groq LLM inference, RAG food safety engine, Autonomous Multi-Tool Matcher |
| **Python OOP Engine** | Python 3.11 | - | `FoodMatcher`, `WasteAnalyzer`, `SustainabilityCalculator` classes |
| **Frontend UI** | React 18 / Vite / Tailwind | `5173` | Responsive dashboards, double-box styling, tilt cards, AI drawer |

---

## 🌟 Key Features by Dashboard

### 1. 🥘 Food Donors (Provider) Dashboard
- **Instant Surplus Listing**: Post surplus with category, portions/weight, pickup window, expiry, and allergens.
- **Surplus Inventory Management**: Filter, edit, delete, or transition batch status (`available` → `reserved` → `collected` → `expired`).
- **Claim Request Workflows**: Review incoming charity claims, inspect volunteer notes, and approve or reject with one click.
- **AI Kitchen Waste Strategy Advisor**: Powered by Groq to identify top surplus categories and deliver actionable prep optimization advice.
- **Live Impact KPIs**: Real-time counters for active surplus, meals collected, CO₂ averted, and waste diverted.

### 2. 🏛️ Community Organizations (Charity) Dashboard
- **Surplus Food Discovery Feed**: Real-time search and category filtering for hot meals, bakery surplus, fresh produce, and dairy.
- **1-Click Claim Modal**: Specify portion requirements, add volunteer arrival ETAs, and submit verified claims.
- **Order Tracking & Collection**: Monitor pending donor approvals and mark orders as collected upon physical pickup.
- **Agentic Food Matcher**: Autonomous AI tool to query and match immediate food needs against local donors.

### 3. 🛡️ Municipal & Admin Governance Dashboard
- **Citywide Sustainability KPIs**: Macro metrics for total platform listings, rescued meals, and cumulative CO₂ mitigation.
- **UN SDG Progress Index**: Progress visualizers for SDG 2, SDG 11, SDG 12, and SDG 13.
- **Organization Verification Registry**: Authorize and verify non-profit food shelters before granting food claim permissions.
- **Surplus Audit & User Directory**: Global oversight over all food postings and registered municipal stakeholders.
- **AI Platform ESG Report Generator**: Generates comprehensive executive sustainability briefings.

### 4. 🤖 Global AI Assistant Hub
- **Food Safety Assistant (RAG)**: Grounded in knowledge-base docs (`food_safety_guidelines.md`, `waste_reduction_practices.md`, etc.).
- **Waste Reduction Advisor (GenAI)**: Instant customized waste minimization advice for kitchens.
- **Smart Matching Agent (Agentic AI)**: Multi-tool loop (`find_available_food`, `find_organizations`, `calculate_match`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ & npm
- **Python** 3.10+
- **Docker** & Docker Compose (Optional for containerized run)
- **MongoDB** (Local or Atlas URI)
- **Groq API Key**

### 1. Clone & Environment Setup
```bash
git clone https://github.com/UmerMujahid/LoopLearn-Hackathon.git
cd FoodLoop

# Copy example environment configuration
cp .env.example .env
```

Ensure your `.env` contains:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GROQ_API_KEY=gsk_your_groq_key
GROQ_MODEL=qwen/qwen3.6-27b
PORT_GATEWAY=4000
PORT_AUTH=4001
PORT_CORE=4002
PORT_AI=5000
```

### 2. Automated Dependency Installation
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Seed Demo Data (Optional)
```bash
node scripts/seed.js
```
*Pre-configured Demo Accounts:*
- **Admin**: `admin@foodloop.city` / `password123`
- **Food Donor (Provider)**: `chef@grandpalacecatering.com` / `password123`
- **Community Shelter (Verified)**: `intake@hopehaven.org` / `password123`
- **Food Pantry (Pending)**: `relief@barakahpantry.org` / `password123`

### 4. Run Locally
```bash
# Terminal 1: Auth Microservice
cd backend/auth-service && npm run dev

# Terminal 2: Core Microservice
cd backend/core-service && npm run dev

# Terminal 3: API Gateway
cd backend/api-gateway && npm run dev

# Terminal 4: AI & RAG Microservice
cd ai-service && uvicorn main:app --port 5000 --reload

# Terminal 5: React Frontend
cd frontend && npm run dev
```

---

## 🐳 Docker Containerization & Kubernetes

### Run Entire Stack with Docker Compose
```bash
docker compose up --build -d
```

### Deploy to Kubernetes
```bash
kubectl apply -f kubernetes/namespace.yml
kubectl apply -f kubernetes/configmap.yml
kubectl apply -f kubernetes/secrets.yml
kubectl apply -f kubernetes/auth-deployment.yml
kubectl apply -f kubernetes/core-deployment.yml
kubectl apply -f kubernetes/gateway-deployment.yml
kubectl apply -f kubernetes/ai-deployment.yml
kubectl apply -f kubernetes/frontend-deployment.yml
```

### Provision Infrastructure with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## 🧪 Test Suite Execution

### 1. Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test -- --run
```

### 2. Backend Unit Tests
```bash
node backend/auth-service/test.js
node backend/core-service/test.js
```

### 3. AI, RAG & Python OOP Test Suite
```bash
python ai-service/test_ai_service.py
```

---

## 👥 Team
- **Umer Mujahid** — Full Stack & AI Engineering
- **Muhammad Basim Irfan** — Backend Architecture & Microservices

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
