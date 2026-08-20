import os
import sys

# 1. Dynamically configure sys.path to discover sibling python-service modules
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
PYTHON_SERVICE_DIR = os.path.join(PROJECT_ROOT, "python-service")

for path in [CURRENT_DIR, PROJECT_ROOT, PYTHON_SERVICE_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# 2. Framework & Router Imports
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.genai_routes import router as genai_router
from routers.rag_routes import router as rag_router
from routers.agent_routes import router as agent_router

try:
    from config import PORT
except ImportError:
    PORT = int(os.getenv("PORT", 5000))

# 3. Application Initialization
app = FastAPI(
    title="FoodLoop AI Service",
    description="Generative AI, RAG Knowledge Base, and Agentic Matching Services powered by Groq",
    version="1.0.0",
)

# 4. CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Route Mounting
app.include_router(genai_router)
app.include_router(rag_router)
app.include_router(agent_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "UP", "service": "ai-service", "port": PORT}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)