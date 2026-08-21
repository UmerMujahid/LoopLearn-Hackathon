from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from agent_matcher import matching_agent

router = APIRouter(prefix="/api/ai", tags=["Agentic AI Matching"])


class AgentQueryRequest(BaseModel):
    query: str
    groqApiKey: Optional[str] = None


@router.post("/agent")
async def run_food_matching_agent(
    payload: AgentQueryRequest,
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key")
):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    active_key = (x_groq_api_key or "").strip() or (payload.groqApiKey or "").strip()

    try:
        result = matching_agent.run(payload.query, api_key=active_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent matching loop failed: {str(e)}")

