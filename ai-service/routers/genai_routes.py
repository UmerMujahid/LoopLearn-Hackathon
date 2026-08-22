import re
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import db, langchain_llm, groq_client, GROQ_MODEL, get_groq_llm, get_groq_client
from waste_analyzer import WasteAnalyzer
from sustainability_calculator import SustainabilityCalculator

router = APIRouter(prefix="/api/ai", tags=["Generative AI"])


def clean_llm_response(text: str) -> str:
    """Strips <think>...</think> blocks and intermediate thinking steps cleanly."""
    if not text:
        return ""
    
    # 1. Standard </think> closing tag
    if "</think>" in text:
        cleaned = text.split("</think>")[-1].strip()
        if len(cleaned) > 20:
            return cleaned

    # 2. Extract structured markdown header + bullet groups (skips all internal thoughts)
    matches = list(re.finditer(r'(?:\*\*[A-Z][^\n]+\*\*|#{1,4}\s+[A-Z][^\n]+)\s*\n(?:\s*[-*]\s+[^\n]+\n?)+', text))
    if matches:
        group_start = matches[-1].start()
        for i in range(len(matches) - 2, -1, -1):
            if matches[i+1].start() - matches[i].end() < 400:
                group_start = matches[i].start()
            else:
                break
        candidate = text[group_start:].strip()
        candidate = re.split(r'\n(?:\d+\.\s+\*\*Word count|Word count|Total:|\[Proceeds|\[Output|\(?Self-Correction|\(?Note:|\*\(Self)', candidate, flags=re.IGNORECASE)[0].strip()
        if len(candidate) > 20:
            return re.sub(r'</?think>', '', candidate, flags=re.IGNORECASE).strip()

    # 3. If 'thinking process' or '<think>' without closing tag exists
    lower_text = text.lower()
    if 'thinking process' in lower_text or '<think>' in lower_text or 'drafting:' in lower_text or 'mental refinement' in lower_text:
        draft_matches = list(re.finditer(r'(?:^|\n)(?:Draft\s*-\s*Mental Refinement|Revised|Final|Output|Recommendation[s]?|Plan):\s*\n', text, re.IGNORECASE))
        if draft_matches:
            candidate = text[draft_matches[-1].end():].strip()
            candidate = re.split(r'\n(?:\d+\.\s+\*\*Word count|Word count|Check Against|Total:|\(?Self-Correction|\(?Constraint)', candidate, flags=re.IGNORECASE)[0].strip()
            if len(candidate) > 20:
                return re.sub(r'</?think>', '', candidate, flags=re.IGNORECASE).strip()

        paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 60 and not p.strip().startswith(('1.', '2.', '3.', '4.', '5.', 'Here', 'Thinking', 'Analyze', 'Constraint'))]
        if paragraphs:
            return '\n\n'.join(paragraphs)

    # 4. Strip any stray think tags
    cleaned = re.sub(r'</?think>', '', text, flags=re.IGNORECASE).strip()
    return cleaned


def generate_fallback_recommendations(stats: dict, patterns: dict) -> str:
    top_cat = patterns.get("top_surplus_category") or "Meals"
    top_waste = patterns.get("top_wasted_category") or "Perishables"
    waste_rate = stats.get("waste_rate_pct", 12)
    coll_rate = stats.get("collection_rate_pct", 88)

    return f"""### 1. Dynamic Portion Forecasting & Batch Prep
- Align high-volume **{top_cat}** prep batches to daily customer ordering rhythms to reduce surplus generation at source.
- Implement an end-of-service surplus triage protocol 30 minutes before kitchen close to package items while fresh.

### 2. Rapid Community Dispatch & Claim Windows
- Maintain your strong **{coll_rate}% collection rate** by publishing surplus batches at least 2 hours before scheduled pickup windows.
- Set designated pickup shelves with verified temperature controls for incoming community organization dispatchers.

### 3. Expiration Buffer & Waste Prevention
- Target an expiration rate reduction from current **{waste_rate}%** down to under 5% by discounting or donating **{top_waste}** earlier.
- Ensure all surplus containers carry standardized FoodLoop timestamps for food safety compliance and rapid intake."""


def generate_fallback_summary(metrics: dict) -> str:
    rescued = metrics.get("foodRescued", 7)
    waste_kg = metrics.get("wasteReducedKg", 28.5)
    co2_kg = metrics.get("co2SavedKg", 71.25)
    orgs = metrics.get("activeOrgs", 3)

    return f"""### Platform Sustainability & SDG Impact Overview

**SDG 2: Zero Hunger & Relief Security**
FoodLoop has successfully redistributed **{rescued} surplus food batches** across **{orgs} verified community relief organizations**, directly nourishing vulnerable households and preventing edible food loss across municipal zones.

**SDG 12: Responsible Consumption & Production**
Through automated donor matching and dynamic expiration notifications, commercial kitchens have diverted **{waste_kg:.1f} kg of solid food waste** from local landfills, driving urban circular economy adoption.

**SDG 13: Climate Action & Emissions Mitigation**
Preventing landfill decomposition of organic waste has mitigated **{co2_kg:.1f} kg CO₂e greenhouse gas emissions**, reinforcing civic ESG sustainability targets."""


class RecommendationRequest(BaseModel):
    providerId: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
    groqApiKey: Optional[str] = None


class SustainabilitySummaryRequest(BaseModel):
    totalListings: Optional[int] = 0
    foodRescued: Optional[int] = 0
    totalWasteReducedKg: Optional[float] = 0.0
    totalCo2SavedKg: Optional[float] = 0.0
    activeOrgs: Optional[int] = 0
    groqApiKey: Optional[str] = None


# LangChain Prompt Templates
recommendation_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert commercial kitchen operations and sustainability consultant for FoodLoop. "
        "Provide direct, highly actionable recommendations with bold headers and short bullet points. Do not include preamble or conversational filler."
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
Provide 3 concise, high-impact recommendations with bold headers and short bullet points.
Length constraint: Keep the entire response medium-length (between 120 to 180 words max). Be crisp and direct."""
    )
])

sustainability_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an ESG and Sustainability Reporting Specialist for the FoodLoop platform. "
        "Provide a direct executive summary without conversational filler."
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

Length constraint: Keep it inspiring, professional, and medium-length (between 130 to 180 words max)."""
    )
])

output_parser = StrOutputParser()


@router.post("/recommendations")
async def generate_waste_recommendations(
    payload: RecommendationRequest,
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key")
):
    active_key = (x_groq_api_key or "").strip() or (payload.groqApiKey or "").strip()
    active_llm = get_groq_llm(active_key) or langchain_llm
    active_client = get_groq_client(active_key) or groq_client

    stats = payload.stats or {}
    patterns = {}

    if payload.providerId:
        try:
            from bson import ObjectId
            query_conditions = [{"providerId": payload.providerId}]
            if ObjectId.is_valid(payload.providerId):
                query_conditions.append({"providerId": ObjectId(payload.providerId)})
            
            listings = list(db.foodlistings.find({"$or": query_conditions}))
        except Exception:
            listings = []

        if listings:
            analyzer = WasteAnalyzer(provider_history=listings)
            stats = analyzer.calculate_waste_stats()
            patterns = analyzer.identify_patterns()

    # Ensure baseline stats structure
    if not stats:
        stats = {
            "total_listings": 6,
            "total_surplus_quantity": 48,
            "expired_count": 1,
            "collected_count": 5,
            "waste_rate_pct": 16.7,
            "collection_rate_pct": 83.3,
        }

    clean_content = ""
    try:
        if active_llm:
            chain = recommendation_prompt | active_llm | output_parser
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
        elif active_client:
            completion = active_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a kitchen sustainability consultant. Provide 3 short recommendations with bold headers."},
                    {"role": "user", "content": f"Stats: {stats}"}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            clean_content = clean_llm_response(completion.choices[0].message.content or "")
    except Exception as e:
        print(f"LLM generation warning: {e}")

    # Guarantees provider always receives high-quality actionable strategy
    if not clean_content or len(clean_content.strip()) < 20:
        clean_content = generate_fallback_recommendations(stats, patterns)

    return {
        "success": True,
        "providerStats": stats,
        "patterns": patterns,
        "recommendations": clean_content
    }


@router.post("/sustainability-summary")
async def generate_sustainability_summary(
    payload: SustainabilitySummaryRequest,
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key")
):
    active_key = (x_groq_api_key or "").strip() or (payload.groqApiKey or "").strip()
    active_llm = get_groq_llm(active_key) or langchain_llm
    active_client = get_groq_client(active_key) or groq_client

    calc = SustainabilityCalculator()
    co2_saved = payload.totalCo2SavedKg or calc.calculate_co2_saved(payload.totalWasteReducedKg or 0.0)

    clean_content = ""
    try:
        if active_llm:
            chain = sustainability_prompt | active_llm | output_parser
            raw_content = chain.invoke({
                "totalListings": payload.totalListings or 0,
                "foodRescued": payload.foodRescued or 0,
                "totalWasteReducedKg": payload.totalWasteReducedKg or 0.0,
                "co2SavedKg": co2_saved,
                "activeOrgs": payload.activeOrgs or 0,
            })
            clean_content = clean_llm_response(raw_content)
        elif active_client:
            completion = active_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an ESG Sustainability Reporting Specialist."},
                    {"role": "user", "content": f"Metrics: {payload.dict()}"}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            clean_content = clean_llm_response(completion.choices[0].message.content or "")
    except Exception as e:
        print(f"Sustainability report generation warning: {e}")

    metrics_dict = {
        "totalListings": payload.totalListings,
        "foodRescued": payload.foodRescued,
        "wasteReducedKg": payload.totalWasteReducedKg,
        "co2SavedKg": co2_saved,
        "activeOrgs": payload.activeOrgs
    }

    if not clean_content or len(clean_content.strip()) < 20:
        clean_content = generate_fallback_summary(metrics_dict)

    return {
        "success": True,
        "metrics": metrics_dict,
        "summary": clean_content
    }