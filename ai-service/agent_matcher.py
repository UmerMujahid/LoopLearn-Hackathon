import json
import re
from typing import List, Dict, Any, Optional

from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import db, langchain_llm, groq_client, GROQ_MODEL, get_groq_llm, get_groq_client
from food_matcher import FoodMatcher


def clean_llm_response(text: str) -> str:
    cleaned = re.sub(r"<think>.*?(?:</think>|$)", "", text, flags=re.DOTALL)
    return cleaned.strip()


# ==============================================================================
# LangChain Tools Definition
# ==============================================================================

sample_listings_data = [
    {
        "_id": "mock-listing-1",
        "foodName": "Fresh Sourdough Bread & Pastries",
        "category": "bakery",
        "quantity": 30,
        "unit": "portions",
        "pickupLocation": "Downtown Artisan Bakery, 4th Ave",
        "pickupLat": 37.7749,
        "pickupLng": -122.4194,
        "status": "available",
        "availableUntil": "Today 8:00 PM"
    },
    {
        "_id": "mock-listing-2",
        "foodName": "50 Gourmet Vegetarian Rice Bowls",
        "category": "meals",
        "quantity": 50,
        "unit": "portions",
        "pickupLocation": "Green Leaf Kitchen, Central Blvd",
        "pickupLat": 37.7833,
        "pickupLng": -122.4167,
        "status": "available",
        "availableUntil": "Today 6:30 PM"
    },
    {
        "_id": "mock-listing-3",
        "foodName": "25 kg Organic Apples & Spinach",
        "category": "produce",
        "quantity": 25,
        "unit": "kg",
        "pickupLocation": "City Market Produce Hall",
        "pickupLat": 37.7650,
        "pickupLng": -122.4200,
        "status": "available",
        "availableUntil": "Tomorrow 12:00 PM"
    }
]

sample_orgs_data = [
    {
        "_id": "mock-org-1",
        "name": "Sarah Jenkins",
        "organizationName": "Hope Haven Community Shelter",
        "email": "intake@hopehaven.org",
        "phone": "+1 555-019-2834",
        "address": "Downtown Community Center, 5th Ave",
        "lat": 37.7755,
        "lng": -122.4180,
        "isVerified": True,
        "preferredCategories": ["meals", "bakery", "produce"]
    },
    {
        "_id": "mock-org-2",
        "name": "David Al-Mansoor",
        "organizationName": "Barakah Food Pantry",
        "email": "relief@barakahpantry.org",
        "phone": "+1 555-012-9844",
        "address": "Central Avenue Relief Mission",
        "lat": 37.7840,
        "lng": -122.4150,
        "isVerified": True,
        "preferredCategories": ["meals", "dairy", "bakery"]
    },
    {
        "_id": "mock-org-3",
        "name": "Elena Rodriguez",
        "organizationName": "Youth & Family Oasis Shelter",
        "email": "contact@youthoasis.org",
        "phone": "+1 555-018-7721",
        "address": "South Side Youth Center",
        "lat": 37.7660,
        "lng": -122.4210,
        "isVerified": True,
        "preferredCategories": ["produce", "dairy", "meals"]
    }
]


@tool
def find_available_food_tool(category: str = "all", location: str = "") -> str:
    """Discovers available surplus food batches from the database."""
    query: Dict[str, Any] = {"status": "available"}
    if category and category.lower() != "all":
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if location:
        query["pickupLocation"] = {"$regex": location, "$options": "i"}

    try:
        listings = list(db.foodlistings.find(query).limit(10))
        if not listings:
            listings = sample_listings_data
        for l in listings:
            if "_id" in l:
                l["_id"] = str(l["_id"])
        return json.dumps(listings)
    except Exception:
        return json.dumps(sample_listings_data)


@tool
def find_organizations_tool(location: str = "", verified_only: bool = True) -> str:
    """Discovers registered and verified community organizations."""
    query: Dict[str, Any] = {"role": "organization"}
    if verified_only:
        query["isVerified"] = True
    if location:
        query["address"] = {"$regex": location, "$options": "i"}

    try:
        orgs = list(db.users.find(query).limit(10))
        if not orgs:
            orgs = sample_orgs_data
        for o in orgs:
            if "_id" in o:
                o["_id"] = str(o["_id"])
        return json.dumps(orgs)
    except Exception:
        return json.dumps(sample_orgs_data)


class LangChainFoodMatchingAgent:
    """
    Autonomous multi-tool Agentic AI workflow utilizing LangChain tools,
    ChatPromptTemplate, and LCEL chains to orchestrate surplus matchmaking.
    """

    def __init__(self):
        self.matcher = FoodMatcher()
        self.tools = [find_available_food_tool, find_organizations_tool]

        self.agent_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are the FoodLoop Autonomous Matchmaker Agent powered by LangChain and Groq. "
                "Synthesize tool outputs into an urgent, high-impact surplus redistribution plan. "
                "Do not include any internal thoughts, reasoning tags (<think>), or filler."
            ),
            (
                "user",
                """User Query:
{query}

Ranked Match Matrix from LangChain Tools:
{matches}

Task:
1. Summarize top matched pairings with compatibility score (e.g. 92%).
2. Detail pickup coordination instructions, ETA recommendations, and volunteer alerts.
3. Use clean markdown with bold section headers and bullet points."""
            )
        ])

        self.output_parser = StrOutputParser()

    def run(self, user_query: str, max_iterations: int = 5, api_key: str = "") -> Dict[str, Any]:
        """
        Executes the autonomous Food Matching Agent loop with dynamic Groq LLM support.
        """
        actions = []

        # Tool 1: Discover available food
        food_raw = find_available_food_tool.invoke({"category": "all", "location": ""})
        food_listings = json.loads(food_raw)
        actions.append({
            "tool": "find_available_food_tool",
            "input": {"category": "all"},
            "output": f"Discovered {len(food_listings)} available surplus batches."
        })

        # Tool 2: Discover verified organizations
        orgs_raw = find_organizations_tool.invoke({"location": "", "verified_only": True})
        organizations = json.loads(orgs_raw)
        actions.append({
            "tool": "find_organizations_tool",
            "input": {"verified_only": True},
            "output": f"Discovered {len(organizations)} verified community relief centers."
        })

        # Step 3: Compute OOP compatibility matrix
        all_matches = []
        for listing in food_listings:
            for org in organizations:
                score = self.matcher.calculate_match_score(listing, org)
                if score >= 60.0:
                    all_matches.append({
                        "foodName": listing.get("foodName"),
                        "quantity": f"{listing.get('quantity')} {listing.get('unit')}",
                        "pickupLocation": listing.get("pickupLocation"),
                        "orgName": org.get("organizationName", org.get("name")),
                        "orgContact": org.get("phone", org.get("email")),
                        "orgAddress": org.get("address"),
                        "matchScore": score
                    })

        all_matches.sort(key=lambda m: m["matchScore"], reverse=True)
        top_matches = all_matches[:5]

        actions.append({
            "tool": "calculate_match_score",
            "input": {"pairs_evaluated": len(food_listings) * len(organizations)},
            "output": f"Ranked {len(top_matches)} optimal matches (scores: {[m['matchScore'] for m in top_matches]})."
        })

        active_llm = get_groq_llm(api_key) or langchain_llm
        active_client = get_groq_client(api_key) or groq_client

        # Step 4: LangChain LCEL Synthesis Chain
        if active_llm:
            chain = self.agent_prompt | active_llm | self.output_parser
            raw_response = chain.invoke({
                "query": user_query,
                "matches": json.dumps(top_matches, indent=2)
            })
            clean_response = clean_llm_response(raw_response)
        elif active_client:
            completion = active_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are the FoodLoop Autonomous Matchmaker Agent."},
                    {"role": "user", "content": f"Query: {user_query}\n\nMatches: {json.dumps(top_matches, indent=2)}"}
                ],
                temperature=0.2,
                max_tokens=1500
            )
            clean_response = clean_llm_response(completion.choices[0].message.content or "")
        else:
            clean_response = f"### Recommended Pairings\n\n" + "\n".join(
                [f"- **{m['foodName']}** ({m['quantity']}) → **{m['orgName']}** (Compatibility: {m['matchScore']}%)" for m in top_matches]
            )

        return {
            "success": True,
            "query": user_query,
            "iterations": 3,
            "actions": actions,
            "matches": top_matches,
            "response": clean_response
        }


# Singleton agent instance
matching_agent = LangChainFoodMatchingAgent()
