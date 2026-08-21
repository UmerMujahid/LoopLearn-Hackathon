from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from rag_engine import rag_engine

router = APIRouter(prefix="/api/ai", tags=["RAG Knowledge Base"])


class RAGQueryRequest(BaseModel):
    question: str
    groqApiKey: Optional[str] = None


@router.post("/rag")
async def query_food_safety_rag(
    payload: RAGQueryRequest,
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key")
):
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    active_key = (x_groq_api_key or "").strip() or (payload.groqApiKey or "").strip()

    try:
        result = rag_engine.query(payload.question, api_key=active_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

