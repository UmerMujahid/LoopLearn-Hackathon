import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from config import db, groq_client, GROQ_MODEL
from waste_analyzer import WasteAnalyzer
from sustainability_calculator import SustainabilityCalculator

router = APIRouter(prefix="/api/ai", tags=["Generative AI"])


def clean_llm_response(text: str) -> str:
    """Strips <think> blocks whether they are closed or truncated."""
    # Strips everything inside <think>...</think> or any unclosed <think> up to the end
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


@router.post("/recommendations")
async def generate_waste_recommendations(payload: RecommendationRequest):
    if not groq_client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    stats = payload.stats
    patterns = {}

    if payload.providerId:
        listings = list(db.foodlistings.find({"providerId": payload.providerId}))
        analyzer = WasteAnalyzer(provider_history=listings)
        stats = analyzer.calculate_waste_stats()
        patterns = analyzer.identify_patterns()
    elif not stats:
        raise HTTPException(
            status_code=400,
            detail="Either providerId or a stats object must be provided."
        )

    system_prompt = (
        "You are an expert commercial kitchen operations and sustainability consultant for FoodLoop. "
        "Provide direct, highly actionable recommendations without any preamble, thoughts, or conversational filler."
    )

    user_prompt = f"""
    Analyze these surplus and waste metrics for a food provider:
    - Total Listings Logged: {stats.get('total_listings', 0)}
    - Total Surplus Quantity: {stats.get('total_surplus_quantity', 0)}
    - Expired Items: {stats.get('expired_count', 0)}
    - Collected Items: {stats.get('collected_count', 0)}
    - Expiration Rate: {stats.get('waste_rate_pct', 0)}%
    - Collection Rate: {stats.get('collection_rate_pct', 0)}%
    - Highest Surplus Category: {patterns.get('top_surplus_category', 'Mixed / Varied')}
    - Highest Wasted Category: {patterns.get('top_wasted_category', 'None')}

    Task:
    Provide 3 to 4 concise, high-impact recommendations with bold headers and bullet points.
    """

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2048
        )
        raw_content = completion.choices[0].message.content or ""
        clean_content = clean_llm_response(raw_content)

        return {
            "success": True,
            "providerStats": stats,
            "patterns": patterns,
            "recommendations": clean_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq generation error: {str(e)}")


@router.post("/sustainability-summary")
async def generate_sustainability_summary(payload: SustainabilitySummaryRequest):
    if not groq_client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    calc = SustainabilityCalculator()
    co2_saved = payload.totalCo2SavedKg or calc.calculate_co2_saved(payload.totalWasteReducedKg)

    system_prompt = (
        "You are an ESG and Sustainability Reporting Specialist for the FoodLoop platform. "
        "Provide a direct executive summary without conversational filler or internal thoughts."
    )

    user_prompt = f"""
    Platform Metrics:
    - Total Food Listings: {payload.totalListings}
    - Total Rescued Food Deliveries: {payload.foodRescued}
    - Total Food Waste Diverted: {payload.totalWasteReducedKg:.2f} kg
    - Total GHG Emissions Mitigated: {co2_saved:.2f} kg CO2e
    - Active Community Organizations: {payload.activeOrgs}

    Task:
    Write an executive sustainability impact summary highlighting achievements across:
    1. SDG 2 (Zero Hunger)
    2. SDG 12 (Responsible Consumption and Production)
    3. SDG 13 (Climate Action)

    Keep it inspiring, professional, and concise (approx. 150-200 words).
    """

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2048
        )
        raw_content = completion.choices[0].message.content or ""
        clean_content = clean_llm_response(raw_content)

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
        raise HTTPException(status_code=500, detail=f"Groq generation error: {str(e)}")