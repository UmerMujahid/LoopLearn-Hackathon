# FoodLoop REST & Microservices API Documentation

> **Base API Gateway URL:** `http://localhost:4000/api` (or direct service ports in development)  
> **Authentication:** Bearer Token JWT (`Authorization: Bearer <JWT_TOKEN>`)

---

## 📑 Table of Contents
1. [Authentication Service (`/api/auth`)](#1-authentication-service-apiauth)
2. [Admin Governance (`/api/admin`)](#2-admin-governance-apiadmin)
3. [Food Surplus Management (`/api/food`)](#3-food-surplus-management-apifood)
4. [Claims & Request Workflow (`/api/requests`)](#4-claims--request-workflow-apirequests)
5. [Community Organizations (`/api/organizations`)](#5-community-organizations-apiorganizations)
6. [Sustainability & Impact Stats (`/api/stats`)](#6-sustainability--impact-stats-apistats)
7. [AI, RAG & Agentic Matching (`/api/ai`)](#7-ai-rag--agentic-matching-apiai)

---

## 1. Authentication Service (`/api/auth`)

### 1.1 Register New User / Organization
`POST /api/auth/register`

#### Request Body:
```json
{
  "name": "Chef Ben Al-Zubair",
  "email": "chef.ben@greenkitchen.com",
  "password": "SecurePassword123!",
  "role": "provider",
  "organizationName": "Green Leaf Artisan Kitchen",
  "address": "452 Market St, San Francisco, CA",
  "phone": "+1 415-555-0199",
  "lat": 37.7891,
  "lng": -122.4014
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c3a1e2f890123456789abc",
    "name": "Chef Ben Al-Zubair",
    "email": "chef.ben@greenkitchen.com",
    "role": "provider",
    "organizationName": "Green Leaf Artisan Kitchen",
    "isVerified": true
  }
}
```

---

### 1.2 User Login
`POST /api/auth/login`

#### Request Body:
```json
{
  "email": "chef.ben@greenkitchen.com",
  "password": "SecurePassword123!"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c3a1e2f890123456789abc",
    "name": "Chef Ben Al-Zubair",
    "email": "chef.ben@greenkitchen.com",
    "role": "provider",
    "organizationName": "Green Leaf Artisan Kitchen",
    "isVerified": true
  }
}
```

---

### 1.3 Get Current User Profile
`GET /api/auth/profile`  
*Headers: `Authorization: Bearer <token>`*

---

## 2. Admin Governance (`/api/admin`)
*Requires Role: `admin`*

### 2.1 List Platform Users
`GET /api/admin/users?role=organization`

### 2.2 Verify Community Organization
`PUT /api/admin/verify/:userId`

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Organization verified successfully.",
  "user": {
    "id": "66c3a1e2f890123456789def",
    "organizationName": "Hope Haven Shelter",
    "isVerified": true
  }
}
```

---

## 3. Food Surplus Management (`/api/food`)

### 3.1 List / Filter Available Food
`GET /api/food?status=available&category=meals`

#### Query Parameters:
- `status`: `available` | `reserved` | `collected` | `expired`
- `category`: `meals` | `bakery` | `produce` | `dairy` | `pantry`
- `search`: text query for food name or location

---

### 3.2 Create Surplus Listing
`POST /api/food`  
*Requires Role: `provider`*

#### Request Body:
```json
{
  "foodName": "Fresh Mediterranean Rice Bowls & Sourdough",
  "category": "meals",
  "quantity": 50,
  "unit": "portions",
  "pickupLocation": "Green Leaf Kitchen, 4th Floor, Central Ave",
  "availableFrom": "2026-08-21T18:00:00Z",
  "availableUntil": "2026-08-21T21:00:00Z",
  "expiryDate": "2026-08-21T22:00:00Z",
  "description": "50 freshly packaged hot vegetarian meal bowls. Kept in insulated thermal carriers above 65°C.",
  "dietaryTags": ["halal", "vegetarian"]
}
```

---

### 3.3 Update Listing Status
`PUT /api/food/:id/status`

#### Request Body:
```json
{
  "status": "collected"
}
```

---

## 4. Claims & Request Workflow (`/api/requests`)

### 4.1 Claim / Request Food Batch
`POST /api/requests`  
*Requires Role: `organization`*

#### Request Body:
```json
{
  "foodListingId": "66c3b2f4a123456789012345",
  "requestedQuantity": 50,
  "notes": "Hope Haven van driver ETA 19:15 for evening shelter distribution.",
  "pickupTime": "2026-08-21T19:15:00Z"
}
```

#### Status Transition Lifecycle:
$$\text{Pending} \xrightarrow{\text{Provider Approves}} \text{Approved / Reserved} \xrightarrow{\text{Pickup Complete}} \text{Collected}$$

---

### 4.2 Approve Request
`PUT /api/requests/:id/approve`  
*Marks food listing as `reserved`.*

### 4.3 Mark as Collected
`PUT /api/requests/:id/collect`  
*Marks food listing as `collected` and increments platform CO₂/meal metrics.*

---

## 5. Community Organizations (`/api/organizations`)

### 5.1 List Verified Charities & Shelters
`GET /api/organizations`

---

## 6. Sustainability & Impact Stats (`/api/stats`)

### 6.1 Provider Impact Dashboard Stats
`GET /api/stats/provider`

#### Response:
```json
{
  "totalDonations": 42,
  "portionsDonated": 2150,
  "co2SavedKg": 5375.0,
  "wasteReducedKg": 1075.0,
  "activeListings": 3
}
```

### 6.2 Municipal & Admin Global Impact
`GET /api/stats/admin`

---

## 7. AI, RAG & Agentic Matching (`/api/ai`)

### 7.1 Food Safety & Guidelines RAG
`POST /api/ai/rag`

#### Request:
```json
{
  "question": "What is the maximum time cooked rice can stay in the temperature danger zone?"
}
```

#### Response:
```json
{
  "success": true,
  "question": "What is the maximum time cooked rice can stay in the temperature danger zone?",
  "answer": "Under standard food safety protocols:\n- **Maximum Time:** Cooked rice must not remain in the Temperature Danger Zone (4°C–60°C / 40°F–140°F) for more than **2 hours**.\n- **Storage:** Cool from 60°C to 21°C within 2 hours, then to 4°C within an additional 4 hours.\n- **Bacillus cereus risk:** Rapid refrigeration prevents spore germination.",
  "sources": [
    {
      "source": "food_safety_guidelines.md",
      "title": "Food Safety & Handling Guidelines",
      "snippet": "Perishable cooked foods must follow the 2-Hour/4-Hour Rule..."
    }
  ]
}
```

---

### 7.2 Kitchen Waste-Reduction Recommendations (GenAI)
`POST /api/ai/recommendations`

#### Request:
```json
{
  "providerId": "66c3a1e2f890123456789abc"
}
```

---

### 7.3 Autonomous Agentic Matchmaker Loop
`POST /api/ai/agent`

#### Request:
```json
{
  "query": "Find verified shelters within 5 miles that can accept 50 vegetarian meals before 8 PM."
}
```

#### Response:
```json
{
  "success": true,
  "query": "Find verified shelters within 5 miles that can accept 50 vegetarian meals before 8 PM.",
  "iterations": 3,
  "actions": [
    {
      "tool": "find_available_food_tool",
      "input": { "category": "meals" },
      "output": "Discovered 1 surplus batch matching criteria (50 portions vegetarian rice bowls)."
    },
    {
      "tool": "find_organizations_tool",
      "input": { "verified_only": true },
      "output": "Discovered 3 verified shelters in the downtown corridor."
    },
    {
      "tool": "calculate_match_score",
      "input": { "pairs_evaluated": 3 },
      "output": "Ranked Hope Haven Shelter as top match (Score: 94.5%)."
    }
  ],
  "matches": [
    {
      "foodName": "50 Gourmet Vegetarian Rice Bowls",
      "quantity": "50 portions",
      "orgName": "Hope Haven Community Shelter",
      "matchScore": 94.5
    }
  ],
  "response": "### 🎯 Autonomous Match Recommendation\n\n- **Surplus:** 50 Gourmet Vegetarian Rice Bowls\n- **Target Organization:** **Hope Haven Community Shelter** (Match Score: **94.5%**)\n- **Pickup Window:** Immediate – prior to 8:00 PM\n- **Safety Protocol:** Insulated thermal tote required for hot holding (>60°C)."
}
```
