from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agent_matcher import matching_agent

router = APIRouter(prefix="/api/ai", tags=["Agentic AI Matching"])


class AgentQueryRequest(BaseModel):
    query: str


@router.post("/agent")
async def run_food_matching_agent(payload: AgentQueryRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        result = matching_agent.run(payload.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent matching loop failed: {str(e)}")
