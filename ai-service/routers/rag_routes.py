from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from rag_engine import rag_engine

router = APIRouter(prefix="/api/ai", tags=["RAG Knowledge Base"])


class RAGQueryRequest(BaseModel):
    question: str


@router.post("/rag")
async def query_food_safety_rag(payload: RAGQueryRequest):
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = rag_engine.query(payload.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")
