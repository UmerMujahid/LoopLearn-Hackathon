import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import db, langchain_llm, groq_client, GROQ_MODEL
from waste_analyzer import WasteAnalyzer
from sustainability_calculator import SustainabilityCalculator

router = APIRouter(prefix="/api/ai", tags=["Generative AI"])


def clean_llm_response(text: str) -> str:
    """Strips <think> blocks whether they are closed or truncated."""
    cleaned = re.sub(r"<think>.*?(?:</think>|$)", "", text, flags=re.DOTALL)
    return cleaned.strip()


class RecommendationRequest(BaseModel):
    providerId: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None


class SustainabilitySummaryRequest(BaseModel):
    totalListings: Optional[int] = 0
    foodRescued: Optional[int] = 0
    totalWasteReducedKg: Optional[float] = 0.0
    totalCo2SavedKg: Optional[float] = 0.0
    activeOrgs: Optional[int] = 0


# LangChain Prompt Templates
recommendation_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert commercial kitchen operations and sustainability consultant for FoodLoop. "
        "Provide direct, highly actionable recommendations without any preamble, thoughts (<think>), or filler."
    ),
    (
        "user",
        """Analyze these surplus and waste metrics for a food provider:
- Total Listings Logged: {total_listings}
- Total Surplus Quantity: {total_surplus_quantity}
- Expired Items: {expired_count}
- Collected Items: {collected_count}
- Expiration Rate: {waste_rate_pct}%
- Collection Rate: {collection_rate_pct}%
- Highest Surplus Category: {top_surplus_category}
- Highest Wasted Category: {top_wasted_category}

Task:
Provide 3 to 4 concise, high-impact recommendations with bold headers and bullet points."""
    )
])

sustainability_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an ESG and Sustainability Reporting Specialist for the FoodLoop platform. "
        "Provide a direct executive summary without conversational filler or internal thoughts (<think>)."
    ),
    (
        "user",
        """Platform Metrics:
- Total Food Listings: {totalListings}
- Total Rescued Food Deliveries: {foodRescued}
- Total Food Waste Diverted: {totalWasteReducedKg:.2f} kg
- Total GHG Emissions Mitigated: {co2SavedKg:.2f} kg CO2e
- Active Community Organizations: {activeOrgs}

Task:
Write an executive sustainability impact summary highlighting achievements across:
1. SDG 2 (Zero Hunger)
2. SDG 12 (Responsible Consumption and Production)
3. SDG 13 (Climate Action)

Keep it inspiring, professional, and concise (approx. 150-200 words)."""
    )
])

output_parser = StrOutputParser()


@router.post("/recommendations")
async def generate_waste_recommendations(payload: RecommendationRequest):
    if not langchain_llm and not groq_client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    stats = payload.stats
    patterns = {}

    if payload.providerId:
        try:
            listings = list(db.foodlistings.find({"providerId": payload.providerId}))
        except Exception:
            listings = []
        analyzer = WasteAnalyzer(provider_history=listings)
        stats = analyzer.calculate_waste_stats()
        patterns = analyzer.identify_patterns()
    elif not stats:
        raise HTTPException(
            status_code=400,
            detail="Either providerId or a stats object must be provided."
        )

    try:
        if langchain_llm:
            chain = recommendation_prompt | langchain_llm | output_parser
            raw_content = chain.invoke({
                "total_listings": stats.get("total_listings", 0),
                "total_surplus_quantity": stats.get("total_surplus_quantity", 0),
                "expired_count": stats.get("expired_count", 0),
                "collected_count": stats.get("collected_count", 0),
                "waste_rate_pct": stats.get("waste_rate_pct", 0),
                "collection_rate_pct": stats.get("collection_rate_pct", 0),
                "top_surplus_category": patterns.get("top_surplus_category", "Meals"),
                "top_wasted_category": patterns.get("top_wasted_category", "None"),
            })
            clean_content = clean_llm_response(raw_content)
        else:
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a kitchen sustainability consultant."},
                    {"role": "user", "content": f"Stats: {stats}"}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            clean_content = clean_llm_response(completion.choices[0].message.content or "")

        return {
            "success": True,
            "providerStats": stats,
            "patterns": patterns,
            "recommendations": clean_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LangChain Groq generation error: {str(e)}")


@router.post("/sustainability-summary")
async def generate_sustainability_summary(payload: SustainabilitySummaryRequest):
    if not langchain_llm and not groq_client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    calc = SustainabilityCalculator()
    co2_saved = payload.totalCo2SavedKg or calc.calculate_co2_saved(payload.totalWasteReducedKg or 0.0)

    try:
        if langchain_llm:
            chain = sustainability_prompt | langchain_llm | output_parser
            raw_content = chain.invoke({
                "totalListings": payload.totalListings or 0,
                "foodRescued": payload.foodRescued or 0,
                "totalWasteReducedKg": payload.totalWasteReducedKg or 0.0,
                "co2SavedKg": co2_saved,
                "activeOrgs": payload.activeOrgs or 0,
            })
            clean_content = clean_llm_response(raw_content)
        else:
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an ESG Reporting Specialist."},
                    {"role": "user", "content": f"Metrics: {payload.dict()}"}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            clean_content = clean_llm_response(completion.choices[0].message.content or "")

        return {
            "success": True,
            "metrics": {
                "totalListings": payload.totalListings,
                "foodRescued": payload.foodRescued,
                "wasteReducedKg": payload.totalWasteReducedKg,
                "co2SavedKg": co2_saved,
                "activeOrgs": payload.activeOrgs
            },
            "summary": clean_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LangChain Groq generation error: {str(e)}")