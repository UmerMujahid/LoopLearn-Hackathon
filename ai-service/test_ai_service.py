import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
PYTHON_SERVICE_DIR = os.path.join(PROJECT_ROOT, "python-service")

for path in [CURRENT_DIR, PROJECT_ROOT, PYTHON_SERVICE_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from food_matcher import FoodMatcher
from waste_analyzer import WasteAnalyzer
from sustainability_calculator import SustainabilityCalculator
from rag_engine import rag_engine
from agent_matcher import matching_agent, find_available_food_tool, find_organizations_tool


def test_python_oop_modules():
    print("\n--- 1. Testing Python OOP Modules ---")

    # A. FoodMatcher
    matcher = FoodMatcher()
    sample_listing = {
        "_id": "listing-1",
        "foodName": "50 Veg Meals",
        "category": "meals",
        "quantity": 50,
        "pickupLocation": "Downtown 4th St",
        "pickupLat": 37.7749,
        "pickupLng": -122.4194
    }
    sample_org = {
        "_id": "org-1",
        "organizationName": "Hope Haven Shelter",
        "address": "Downtown 5th St",
        "lat": 37.7755,
        "lng": -122.4180,
        "preferredCategories": ["meals", "produce"],
        "maxQuantity": 60
    }
    score = matcher.calculate_match_score(sample_listing, sample_org)
    assert 50 <= score <= 100, f"Score should be high for matching category/location, got {score}"
    print(f"[PASS] FoodMatcher calculated score: {score}/100")

    # B. WasteAnalyzer
    sample_history = [
        {"providerId": "p1", "category": "meals", "quantity": 30, "status": "collected"},
        {"providerId": "p1", "category": "meals", "quantity": 20, "status": "collected"},
        {"providerId": "p1", "category": "bakery", "quantity": 10, "status": "expired"},
    ]
    analyzer = WasteAnalyzer(provider_history=sample_history)
    stats = analyzer.calculate_waste_stats("p1")
    assert stats["total_listings"] == 3
    assert stats["collected_count"] == 2
    assert stats["expired_count"] == 1
    assert stats["collection_rate_pct"] == 66.67
    patterns = analyzer.identify_patterns()
    assert patterns["top_surplus_category"] == "meals"
    print(f"[PASS] WasteAnalyzer stats: {stats['collection_rate_pct']}% collection rate, top surplus: {patterns['top_surplus_category']}")

    # C. SustainabilityCalculator
    calc = SustainabilityCalculator()
    co2 = calc.calculate_co2_saved(100.0)
    assert co2 == 250.0, f"100 kg food waste should equal 250.0 kg CO2, got {co2}"
    meals = calc.calculate_meals_saved(50)
    assert meals == 50
    report = calc.generate_impact_report()
    assert "sdg_impact" in report
    print(f"[PASS] SustainabilityCalculator: 100 kg food = {co2} kg CO2e, {meals} meals saved.")


def test_langchain_rag_engine():
    print("\n--- 2. Testing LangChain RAG Knowledge Base Retrieval & Splitters ---")
    assert len(rag_engine.documents) > 0, "LangChain RAGEngine should have indexed Document chunks."
    print(f"[PASS] LangChain RAGEngine has {len(rag_engine.documents)} indexed Document chunks.")

    retrieved = rag_engine.retrieve("What temperature should cold food be held at?", top_k=2)
    assert len(retrieved) > 0, "Should retrieve relevant LangChain Document chunks."
    print(f"[PASS] Retrieved Document: '{retrieved[0].metadata.get('title')}' ({len(retrieved[0].page_content)} chars)")


def test_langchain_agent_matcher():
    print("\n--- 3. Testing LangChain Tools and Autonomous Agent Matching ---")
    food_res = find_available_food_tool.invoke({"category": "all", "location": ""})
    orgs_res = find_organizations_tool.invoke({"location": "", "verified_only": True})
    assert len(food_res) > 10, "find_available_food_tool should return JSON array."
    assert len(orgs_res) > 10, "find_organizations_tool should return JSON array."
    print(f"[PASS] LangChain Tools: find_available_food_tool & find_organizations_tool executed.")

    agent_result = matching_agent.run("Find 50 meals for downtown shelter")
    assert agent_result["success"] is True
    assert len(agent_result["actions"]) >= 3
    assert len(agent_result["response"]) > 20
    print(f"[PASS] LangChain Agent loop executed with {len(agent_result['actions'])} tool actions.")


if __name__ == "__main__":
    print("==========================================================")
    print("RUNNING FOODLOOP LANGCHAIN & PYTHON OOP TEST SUITE")
    print("==========================================================")
    test_python_oop_modules()
    test_langchain_rag_engine()
    test_langchain_agent_matcher()
    print("\n==========================================================")
    print("[PASS] ALL LANGCHAIN & PYTHON TESTS PASSED!")
    print("==========================================================")
