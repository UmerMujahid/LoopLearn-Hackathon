# 🍽️ FoodLoop — Complete Hackathon Implementation Plan

> **Smart Food Rescue & Community Resource Platform**
> Team of 2 · LoopLearn Hackathon 2026 · PS-04
> SDGs: Zero Hunger (2), Sustainable Cities (11), Responsible Consumption (12), Climate Action (13)

---

## 📌 Project Summary

FoodLoop connects **surplus food providers** (restaurants, cafeterias, individuals) with **verified community organizations** that need food. An AI-powered matching system, RAG-based food safety assistant, and agentic AI workflow automate the process. The entire stack is containerized and deployed via Docker, Kubernetes, and Terraform.

---

## 🧠 AI API Recommendation

> [!TIP]
> **Use Google Gemini API (gemini-2.0-flash)** — it's free-tier generous (15 RPM / 1M tokens/day), supports tool-calling natively (for agentic AI), and works great for RAG + generative features. No credit card needed. Alternatively, **OpenAI GPT-4o-mini** is cheap and reliable. Either works.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│   Login · Provider Dashboard · Org Dashboard · Admin    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────────┐
│               API Gateway (Express.js :4000)            │
│         /api/auth → Auth Service                        │
│         /api/food → Core Service (Food)                 │
│         /api/org  → Core Service (Org)                  │
│         /api/ai   → AI Service                          │
└──┬──────────────┬──────────────┬────────────────────────┘
   │              │              │
   ▼              ▼              ▼
┌──────┐   ┌──────────┐   ┌──────────┐
│ Auth │   │   Core   │   │    AI    │
│Service│   │ Service  │   │ Service  │
│:4001 │   │  :4002   │   │  :5000   │
│(Node)│   │ (Node)   │   │ (Python) │
└──┬───┘   └────┬─────┘   └──┬───────┘
   │            │             │
   ▼            ▼             ▼
┌─────────────────────┐  ┌──────────────────┐
│   MongoDB Atlas /   │  │  Gemini / OpenAI  │
│   Local MongoDB     │  │  + RAG Knowledge  │
└─────────────────────┘  └──────────────────┘
```

---

## 🗄️ Database Schema (MongoDB Collections)

### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "provider | organization | admin",
  "organizationName": "string (if role=organization)",
  "address": "string",
  "phone": "string",
  "isVerified": "boolean (org verification by admin)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `foodListings`
```json
{
  "_id": "ObjectId",
  "providerId": "ObjectId (ref: users)",
  "foodName": "string",
  "category": "meals | bakery | produce | dairy | beverages | other",
  "quantity": "number",
  "unit": "portions | kg | liters | items",
  "pickupLocation": "string",
  "pickupLat": "number (optional)",
  "pickupLng": "number (optional)",
  "availableFrom": "Date",
  "availableUntil": "Date",
  "expiryDate": "Date",
  "description": "string",
  "status": "available | reserved | collected | expired",
  "claimedBy": "ObjectId (ref: users, nullable)",
  "claimedAt": "Date (nullable)",
  "collectedAt": "Date (nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `requests`
```json
{
  "_id": "ObjectId",
  "organizationId": "ObjectId (ref: users)",
  "foodListingId": "ObjectId (ref: foodListings)",
  "status": "pending | approved | rejected | collected",
  "requestedQuantity": "number",
  "message": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `sustainability_stats`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "totalDonated": "number",
  "totalCollected": "number",
  "wasteReduced": "number (kg)",
  "co2Saved": "number (kg)",
  "month": "string (YYYY-MM)",
  "updatedAt": "Date"
}
```

---

## 📂 Repository Structure (from cloned repo)

```
FoodLoop/
├── frontend/                  # React (Vite) app
├── backend/
│   ├── api-gateway/           # Express gateway :4000
│   ├── auth-service/          # Auth microservice :4001
│   └── core-service/          # Food + Org microservice :4002
├── ai-service/                # Python Flask/FastAPI :5000
├── python-service/            # Python OOP classes (FoodMatcher, WasteAnalyzer, etc.)
├── rag/
│   └── knowledge-base/        # .txt/.md files for RAG
├── agent/                     # Agentic AI implementation
├── docker/                    # Dockerfiles per service
├── kubernetes/                # K8s YAML manifests
├── terraform/                 # IaC configs
├── scripts/
│   ├── setup.sh
│   └── deploy.sh
├── docs/
│   ├── architecture.png
│   ├── database-schema.png
│   └── api-documentation.pdf
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## 🎯 Scoring Breakdown & Coverage Map

| Category | Marks | Where We Cover It |
|---|---|---|
| Problem Understanding & SDG Alignment | 10 | README, presentation, docs |
| Core Functionality | 20 | Auth, food listings, matching, dashboards |
| UI/UX & Web Dev | 10 | React frontend, responsive, dark mode |
| AI / Generative AI | 10 | Waste-reduction recommendations, sustainability summaries |
| RAG Implementation | 10 | Food safety knowledge base + retrieval answers |
| Agentic AI | 10 | Food Matching Agent with tools |
| Python/OOP + Backend Architecture | 10 | FoodMatcher, WasteAnalyzer, SustainabilityCalculator |
| GitHub + Code Quality | 5 | Branching, commits, PR workflow |
| Docker + Kubernetes + Terraform | 10 | docker-compose, K8s YAMLs, Terraform configs |
| Innovation & Impact | 5 | Real-time matching, AI insights, SDG impact metrics |
| **Total** | **100** | |

---

## 👥 Work Division

### Member 1: **Full-Stack Backend + DevOps + Infra**
> Focus: Backend microservices, API gateway, auth, database, Docker, Kubernetes, Terraform, Linux scripts, Git workflow, docs

### Member 2: **Frontend + AI/ML + Python Services**
> Focus: React frontend, all dashboards, AI service, RAG, Agentic AI, Python OOP classes, UI/UX

---

## 📋 DETAILED TASK BREAKDOWN

---

### 🔷 PHASE 0: Project Setup (BOTH — 30 min)

| # | Task | Owner | Details |
|---|---|---|---|
| 0.1 | Git branching strategy | Both | Create `development` branch from `main`. Each member works on `feature/*` branches. Merge to `development` → `main` |
| 0.2 | Setup MongoDB | Member 1 | MongoDB Atlas (free tier) OR local MongoDB. Create `foodloop` database. Share connection string |
| 0.3 | Setup `.env.example` | Member 1 | `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `PORT_*` vars |
| 0.4 | Setup `.gitignore` | Member 1 | node_modules, .env, __pycache__, venv, .DS_Store, dist |
| 0.5 | Install Node.js, Python 3.x, Docker | Both | Ensure toolchain is ready |

---

### 🔷 PHASE 1: Backend Microservices — Member 1

#### 1A. Auth Service (`backend/auth-service/` — Port 4001)

| # | Task | Details |
|---|---|---|
| 1.1 | Initialize Node.js project | `npm init`, install `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv` |
| 1.2 | User model (`models/User.js`) | Schema: name, email, password (hashed), role (enum: provider/organization/admin), organizationName, address, phone, isVerified, timestamps |
| 1.3 | Auth routes (`routes/auth.js`) | `POST /register` — validate, hash password, save, return JWT. `POST /login` — verify credentials, return JWT + user role |
| 1.4 | Auth middleware (`middleware/auth.js`) | Verify JWT token, attach `req.user`. Role-check middleware: `authorize('admin', 'provider')` |
| 1.5 | User profile routes | `GET /profile` — get current user. `PUT /profile` — update profile |
| 1.6 | Admin: verify organization | `PUT /admin/verify/:userId` — admin sets `isVerified = true` |
| 1.7 | Admin: list users | `GET /admin/users` — list all users with filters by role |

#### 1B. Core Service (`backend/core-service/` — Port 4002)

| # | Task | Details |
|---|---|---|
| 1.8 | Initialize Node.js project | Same deps + add utility libs |
| 1.9 | FoodListing model (`models/FoodListing.js`) | Schema per database design above |
| 1.10 | Request model (`models/Request.js`) | Schema per database design above |
| 1.11 | SustainabilityStats model | Schema per database design above |
| 1.12 | Food CRUD routes (`routes/food.js`) | `POST /` — provider creates listing. `GET /` — list with filters (category, status, location). `GET /:id` — single listing. `PUT /:id` — update (provider only). `DELETE /:id` — delete (provider/admin). `PUT /:id/status` — change status (available→reserved→collected→expired) |
| 1.13 | Request routes (`routes/requests.js`) | `POST /` — org requests a listing. `GET /` — list requests (filtered by org or listing). `PUT /:id/approve` — provider approves. `PUT /:id/reject` — provider rejects. `PUT /:id/collect` — mark as collected |
| 1.14 | Organization routes (`routes/organizations.js`) | `GET /` — list verified orgs. `GET /:id` — org details + stats |
| 1.15 | Dashboard stats routes (`routes/stats.js`) | `GET /provider` — provider's donation stats. `GET /organization` — org's collection stats. `GET /admin` — total listings, food rescued, active orgs, expired, monthly |
| 1.16 | Auto-expire cron job | Use `node-cron`: every hour, mark listings past `availableUntil` as `expired` |

#### 1C. API Gateway (`backend/api-gateway/` — Port 4000)

| # | Task | Details |
|---|---|---|
| 1.17 | Initialize Express app | Install `express`, `http-proxy-middleware`, `cors`, `dotenv` |
| 1.18 | Route proxying | `/api/auth/*` → `http://auth-service:4001`. `/api/food/*` → `http://core-service:4002/food`. `/api/requests/*` → `http://core-service:4002/requests`. `/api/organizations/*` → `http://core-service:4002/organizations`. `/api/stats/*` → `http://core-service:4002/stats`. `/api/ai/*` → `http://ai-service:5000` |
| 1.19 | Health check endpoint | `GET /health` — returns status of all downstream services |
| 1.20 | Error handling middleware | Centralized error handler, request logging |

---

### 🔷 PHASE 2: Frontend — Member 2

#### 2A. React App Setup (`frontend/`)

| # | Task | Details |
|---|---|---|
| 2.1 | Initialize Vite + React | `npx create-vite@latest ./ --template react`. Install `react-router-dom`, `axios`, `react-icons`, `react-hot-toast` |
| 2.2 | Design system / global CSS | Dark mode, CSS variables, color palette (greens/earth tones for food/sustainability theme), Google Fonts (Inter), responsive breakpoints |
| 2.3 | Layout components | `Navbar` (with role-aware links), `Sidebar` (dashboard nav), `Footer`, `ProtectedRoute` (redirect if not auth) |
| 2.4 | Auth context (`context/AuthContext.jsx`) | JWT storage in localStorage, login/logout/register functions, current user state, role |

#### 2B. Auth Pages

| # | Task | Details |
|---|---|---|
| 2.5 | Login page | Email + password form, role selector not needed (determined by backend), JWT stored, redirect to role-specific dashboard |
| 2.6 | Register page | Name, email, password, role (dropdown: Provider/Organization), conditional fields (org name if organization), redirect to login |
| 2.7 | Protected routes | Provider → `/provider/*`. Organization → `/organization/*`. Admin → `/admin/*` |

#### 2C. Provider Dashboard

| # | Task | Details |
|---|---|---|
| 2.8 | Create Food Listing form | Food name, category (dropdown), quantity, unit, pickup location, available from/until, expiry, description. Validates and POSTs to `/api/food` |
| 2.9 | My Listings page | Table/cards of provider's listings with status badges (Available=green, Reserved=yellow, Collected=blue, Expired=red). Edit/delete actions |
| 2.10 | View Requests on listing | See which orgs requested, approve/reject buttons |
| 2.11 | Provider Stats cards | Total portions donated, active listings, claimed food, waste reduction estimate |

#### 2D. Organization Dashboard

| # | Task | Details |
|---|---|---|
| 2.12 | Browse Available Food | Card grid of available listings with search + filters (category, location). Claim/Request button |
| 2.13 | My Requests page | Status tracking: pending → approved → collected. History of past claims |
| 2.14 | Organization Stats cards | Total food claimed, pending requests, history count |

#### 2E. Admin Dashboard

| # | Task | Details |
|---|---|---|
| 2.15 | Admin overview | Total listings, total food rescued, active orgs, expired listings, monthly chart (simple bar/line chart) |
| 2.16 | Manage Organizations | List all orgs, verify/unverify toggle, view details |
| 2.17 | Manage Listings | View all listings, remove inappropriate ones, filter by status |
| 2.18 | User management | View all users, filter by role |

#### 2F. AI Chat Interface

| # | Task | Details |
|---|---|---|
| 2.19 | AI Assistant panel | Chat-like UI accessible from all dashboards. Tabs or toggle for: "Ask about Food Safety" (RAG), "Get Recommendations" (GenAI), "Find Matches" (Agent) |
| 2.20 | Chat message component | User messages right-aligned, AI responses left-aligned with typing animation, markdown rendering |

---

### 🔷 PHASE 3: Python OOP Service — Member 2

Located in `python-service/`

| # | Task | Details |
|---|---|---|
| 3.1 | `food_matcher.py` — `FoodMatcher` class | **Attributes**: available_listings, organizations. **Methods**: `calculate_match_score(listing, org)` — scores based on category preference, quantity fit, location proximity (simple distance or same-city). `find_matches(listing)` — returns list of orgs with scores. `rank_matches(matches)` — sorts by score descending |
| 3.2 | `waste_analyzer.py` — `WasteAnalyzer` class | **Attributes**: provider_history (list of past listings). **Methods**: `calculate_waste_stats(provider_id)` — total surplus, expired count, collection rate. `identify_patterns()` — which categories/times have most surplus. `suggest_reduction(stats)` — basic text suggestions |
| 3.3 | `sustainability_calculator.py` — `SustainabilityCalculator` class | **Attributes**: donation_records. **Methods**: `calculate_co2_saved(kg_food)` — uses standard conversion (1 kg food waste ≈ 2.5 kg CO2). `calculate_meals_saved(portions)`. `generate_impact_report(provider_id)` — summary dict |
| 3.4 | `__init__.py` + `requirements.txt` | Exports all classes. Dependencies: flask/fastapi, pymongo |

---

### 🔷 PHASE 4: AI Service — Member 2

Located in `ai-service/` — Python Flask/FastAPI on port 5000

#### 4A. Generative AI

| # | Task | Details |
|---|---|---|
| 4.1 | Setup Flask/FastAPI app | Install `flask`, `google-generativeai` (or `openai`), `pymongo`, `python-dotenv` |
| 4.2 | `POST /api/ai/recommendations` | Input: provider stats (surplus data). Prompt Gemini: "Given this cafeteria generated X surplus meals this month in categories Y, suggest practical waste-reduction strategies." Return AI-generated recommendations |
| 4.3 | `POST /api/ai/sustainability-summary` | Input: platform-wide stats. Prompt: generate a sustainability impact summary with SDG connections. Return formatted summary |

#### 4B. RAG (Retrieval-Augmented Generation)

| # | Task | Details |
|---|---|---|
| 4.4 | Create knowledge base files (`rag/knowledge-base/`) | `food_safety_guidelines.md` — storage temps, handling rules, expiry guidance. `waste_reduction_practices.md` — best practices. `sustainability_guidelines.md` — SDG-aligned tips. `redistribution_policies.md` — legal/community guidelines |
| 4.5 | Simple RAG implementation | On startup: load all .md files, split into chunks (~500 chars). Store chunks in a list. For a query: use simple keyword/TF-IDF matching OR Gemini embeddings to find top-3 relevant chunks. Send chunks + query to Gemini as context. Return grounded answer |
| 4.6 | `POST /api/ai/rag` | Input: `{ "question": "How should I store cooked rice for donation?" }`. Process: retrieve relevant chunks → prompt Gemini with context → return answer with source references |

#### 4C. Agentic AI — Food Matching Agent

| # | Task | Details |
|---|---|---|
| 4.7 | Define agent tools | **Tool 1**: `find_available_food(category?, location?)` — queries MongoDB for available listings. **Tool 2**: `find_organizations(needs_category?, location?)` — queries MongoDB for verified orgs. **Tool 3**: `calculate_match(listing_id, org_id)` — calls FoodMatcher.calculate_match_score(). **Tool 4**: `generate_recommendation(matches)` — formats matches into a readable recommendation |
| 4.8 | Agent loop implementation | Use Gemini's function-calling: define tools as function declarations. Send user query (e.g., "Find organizations that could use the available vegetarian meals"). Let Gemini decide which tools to call. Execute tools, return results to Gemini. Repeat until Gemini produces final answer. Max 5 iterations |
| 4.9 | `POST /api/ai/agent` | Input: `{ "query": "Find organizations that could use the available vegetarian meals" }`. Returns: agent's final recommendation with matched orgs and listings |

---

### 🔷 PHASE 5: DevOps — Member 1

#### 5A. Docker

| # | Task | Details |
|---|---|---|
| 5.1 | `docker/Dockerfile.frontend` | Multi-stage: Node build → nginx serve. Expose 80 |
| 5.2 | `docker/Dockerfile.auth` | Node.js Alpine image. Copy auth-service, npm install, expose 4001 |
| 5.3 | `docker/Dockerfile.core` | Node.js Alpine image. Copy core-service, npm install, expose 4002 |
| 5.4 | `docker/Dockerfile.gateway` | Node.js Alpine image. Copy api-gateway, npm install, expose 4000 |
| 5.5 | `docker/Dockerfile.ai` | Python 3.11 slim. Copy ai-service + python-service, pip install, expose 5000 |
| 5.6 | `docker-compose.yml` | Services: frontend, api-gateway, auth-service, core-service, ai-service, mongodb. Networks: foodloop-net. Volumes: mongodb-data. Environment variables from `.env` |

#### 5B. Kubernetes

| # | Task | Details |
|---|---|---|
| 5.7 | `kubernetes/namespace.yml` | `foodloop` namespace |
| 5.8 | `kubernetes/configmap.yml` | Non-secret config: service URLs, ports |
| 5.9 | `kubernetes/secrets.yml` | Template for: MONGO_URI, JWT_SECRET, GEMINI_API_KEY (base64 placeholders) |
| 5.10 | `kubernetes/frontend-deployment.yml` | Deployment + Service (NodePort/LoadBalancer) |
| 5.11 | `kubernetes/gateway-deployment.yml` | Deployment + ClusterIP Service |
| 5.12 | `kubernetes/auth-deployment.yml` | Deployment + ClusterIP Service |
| 5.13 | `kubernetes/core-deployment.yml` | Deployment + ClusterIP Service |
| 5.14 | `kubernetes/ai-deployment.yml` | Deployment + ClusterIP Service |

#### 5C. Terraform

| # | Task | Details |
|---|---|---|
| 5.15 | `terraform/main.tf` | Provider: `docker` or `kubernetes` (local). Define resources: docker images, containers OR k8s deployments |
| 5.16 | `terraform/variables.tf` | Variables: image tags, replicas, ports, mongo_uri |
| 5.17 | `terraform/outputs.tf` | Output: service URLs, ports |
| 5.18 | `terraform/terraform.tfvars.example` | Example values |

#### 5D. Linux Scripts

| # | Task | Details |
|---|---|---|
| 5.19 | `scripts/setup.sh` | Check prerequisites (node, python, docker, kubectl). Clone repo if needed. Install all npm dependencies. Create Python venv, install pip deps. Copy `.env.example` → `.env` if not exists. Print success message |
| 5.20 | `scripts/deploy.sh` | Build Docker images. Run docker-compose up. Wait for health checks. Print service URLs. Optional: kubectl apply -f kubernetes/ |

---

### 🔷 PHASE 6: Documentation & Polish — Both

| # | Task | Owner | Details |
|---|---|---|---|
| 6.1 | README.md | Member 1 | Project title, SDGs, problem statement, features, tech stack, architecture diagram link, setup instructions, API docs link, team members, screenshots |
| 6.2 | Architecture diagram | Member 2 | Create `docs/architecture.png` — use draw.io or Excalidraw. Show all services, ports, data flow |
| 6.3 | Database schema diagram | Member 1 | `docs/database-schema.png` — ER diagram of collections |
| 6.4 | API documentation | Member 1 | `docs/api-documentation.pdf` — all endpoints, methods, request/response examples |
| 6.5 | `.env.example` | Member 1 | All required env vars with descriptions |
| 6.6 | Seed data script | Member 1 | `scripts/seed.sh` or in Node — create sample users (1 admin, 2 providers, 2 orgs), sample food listings |
| 6.7 | Demo video | Both | Screen recording of required demo flow |
| 6.8 | Presentation (5-7 slides) | Both | Problem, SDG, solution, demo, AI, architecture, DevOps, future |

---

## ⏱️ Suggested Timeline (24-hour Hackathon)

| Time | Member 1 | Member 2 |
|---|---|---|
| **Hour 0-1** | Phase 0: Git setup, MongoDB, .env, .gitignore | Phase 0: Verify tools, plan component structure |
| **Hour 1-4** | Phase 1A: Auth Service (register, login, JWT, roles) | Phase 2A-2B: React setup, design system, auth pages |
| **Hour 4-7** | Phase 1B: Core Service (food CRUD, requests, stats) | Phase 2C-2D: Provider + Organization dashboards |
| **Hour 7-9** | Phase 1C: API Gateway + integration testing | Phase 2E: Admin dashboard + Phase 2F: AI chat UI |
| **Hour 9-11** | Phase 5A: Dockerfiles + docker-compose | Phase 3: Python OOP classes (Matcher, Analyzer, Calculator) |
| **Hour 11-15** | Phase 5B: Kubernetes YAMLs | Phase 4A-4B: AI service (GenAI + RAG) |
| **Hour 15-18** | Phase 5C: Terraform + Phase 5D: Scripts | Phase 4C: Agentic AI (tools + agent loop) |
| **Hour 18-20** | Integration testing, bug fixes | Frontend polish, connect AI to UI |
| **Hour 20-22** | Phase 6: README, API docs, DB schema diagram | Phase 6: Architecture diagram, demo flow testing |
| **Hour 22-24** | Final deployment, demo video | Presentation slides, final polish |

---

## 🔗 API Endpoints Summary

### Auth Service (`:4001`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/profile` | Authenticated | Get current user profile |
| PUT | `/profile` | Authenticated | Update profile |
| GET | `/admin/users` | Admin | List all users |
| PUT | `/admin/verify/:id` | Admin | Verify organization |

### Core Service (`:4002`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/food` | Provider | Create food listing |
| GET | `/food` | Authenticated | List food (with filters) |
| GET | `/food/:id` | Authenticated | Get single listing |
| PUT | `/food/:id` | Provider (owner) | Update listing |
| DELETE | `/food/:id` | Provider/Admin | Delete listing |
| PUT | `/food/:id/status` | Provider | Change listing status |
| POST | `/requests` | Organization | Request/claim food |
| GET | `/requests` | Authenticated | List requests |
| PUT | `/requests/:id/approve` | Provider | Approve request |
| PUT | `/requests/:id/reject` | Provider | Reject request |
| PUT | `/requests/:id/collect` | Organization | Mark collected |
| GET | `/organizations` | Authenticated | List verified orgs |
| GET | `/organizations/:id` | Authenticated | Org details |
| GET | `/stats/provider` | Provider | Provider dashboard stats |
| GET | `/stats/organization` | Organization | Org dashboard stats |
| GET | `/stats/admin` | Admin | Admin dashboard stats |

### AI Service (`:5000`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/ai/recommendations` | Authenticated | GenAI waste-reduction tips |
| POST | `/api/ai/sustainability-summary` | Authenticated | AI sustainability report |
| POST | `/api/ai/rag` | Authenticated | RAG food safety Q&A |
| POST | `/api/ai/agent` | Authenticated | Agentic AI food matching |

---

## 🧪 Required Demo Flow (must work)

```
1. Provider registers & logs in
       ↓
2. Provider creates a food listing (e.g., "50 Vegetarian Meals")
       ↓
3. Organization registers, admin verifies them
       ↓
4. Organization browses available food, sees the listing
       ↓
5. Matching system identifies org as suitable match
       ↓
6. Organization claims the listing
       ↓
7. Provider approves, org marks as collected
       ↓
8. Dashboards update with new stats
       ↓
9. AI gives waste-reduction recommendation for the provider
       ↓
10. RAG answers: "How should leftover rice be stored safely?"
       ↓
11. Agent: "Find organizations that could use available vegetarian meals"
       ↓
12. Show Docker containers running (docker ps)
       ↓
13. Show Kubernetes YAMLs / Terraform configs
```

---

## ✅ Training Session Coverage Checklist

| Session | Evidence | Status |
|---|---|---|
| Python + OOP | FoodMatcher, WasteAnalyzer, SustainabilityCalculator classes | ⬜ |
| Web Development | Responsive React frontend with dark mode | ⬜ |
| Linux + Shell | `setup.sh`, `deploy.sh` scripts | ⬜ |
| GitHub | main/development/feature/* branches, meaningful commits | ⬜ |
| MERN Authentication | JWT register/login with bcrypt | ⬜ |
| Authorization + Deployment | Provider/Organization/Admin roles, deployed app | ⬜ |
| Docker | 5 Dockerfiles + docker-compose.yml | ⬜ |
| Generative AI | Waste-reduction recommendations, sustainability summaries | ⬜ |
| Agentic AI | Food Matching Agent with 4 tools | ⬜ |
| RAG | Food safety/sustainability knowledge base + retrieval | ⬜ |
| Kubernetes | Namespace, ConfigMap, Secrets, 5 Deployments, Services | ⬜ |
| API Gateway + Microservices | Express gateway routing to 3 backend + 1 AI service | ⬜ |
| FYP Ideation | Problem analysis, users, requirements in README | ⬜ |
| Terraform | Docker/K8s provider, variables, outputs | ⬜ |
| Mega Project + AI in DevOps | End-to-end integrated system | ⬜ |

---

## 🚀 Quick-Start Commands

```bash
# Member 1 — after cloning
cd FoodLoop
git checkout -b development
git push -u origin development

# Member 1 — start feature
git checkout -b feature/auth-service development

# Backend services
cd backend/auth-service && npm init -y && npm install express mongoose bcryptjs jsonwebtoken cors dotenv
cd ../core-service && npm init -y && npm install express mongoose cors dotenv node-cron
cd ../api-gateway && npm init -y && npm install express http-proxy-middleware cors dotenv

# Member 2 — frontend
cd frontend && npx -y create-vite@latest ./ --template react
npm install react-router-dom axios react-icons react-hot-toast

# Member 2 — AI service
cd ai-service
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install flask flask-cors pymongo python-dotenv google-generativeai
```

---

> [!IMPORTANT]
> **Key Success Factors:**
> 1. Get auth + one food CRUD endpoint working ASAP — this unlocks both frontend and AI work
> 2. AI must solve a REAL problem (not decorative) — the matching agent is the star feature
> 3. Keep Kubernetes/Terraform configs reasonable — judges value understanding over complexity
> 4. Commit frequently with meaningful messages — this is graded!
