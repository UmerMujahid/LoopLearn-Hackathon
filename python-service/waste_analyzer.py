from typing import List, Dict, Any, Optional
from collections import Counter


class WasteAnalyzer:
    """
    Analyzes historical surplus listings and expiration patterns to compute
    waste metrics and suggest reduction strategies.
    """

    def __init__(self, provider_history: Optional[List[Dict[str, Any]]] = None):
        self.provider_history = provider_history or []

    def calculate_waste_stats(self, provider_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates total surplus volume, expired count, collected count,
        and overall collection rate.
        """
        records = self.provider_history
        if provider_id:
            records = [
                r for r in records
                if str(r.get("providerId", "")) == str(provider_id)
            ]

        total_listings = len(records)
        if total_listings == 0:
            return {
                "total_listings": 0,
                "total_surplus_quantity": 0,
                "expired_count": 0,
                "collected_count": 0,
                "available_count": 0,
                "collection_rate_pct": 0.0,
                "waste_rate_pct": 0.0
            }

        total_quantity = sum(r.get("quantity", 0) for r in records)
        expired_records = [r for r in records if r.get("status") == "expired"]
        collected_records = [r for r in records if r.get("status") == "collected"]
        available_records = [r for r in records if r.get("status") == "available"]

        expired_count = len(expired_records)
        collected_count = len(collected_records)
        available_count = len(available_records)

        resolved_count = expired_count + collected_count
        collection_rate = (
            (collected_count / resolved_count) * 100.0 if resolved_count > 0 else 0.0
        )
        waste_rate = (
            (expired_count / resolved_count) * 100.0 if resolved_count > 0 else 0.0
        )

        return {
            "total_listings": total_listings,
            "total_surplus_quantity": total_quantity,
            "expired_count": expired_count,
            "collected_count": collected_count,
            "available_count": available_count,
            "collection_rate_pct": round(collection_rate, 2),
            "waste_rate_pct": round(waste_rate, 2)
        }

    def identify_patterns(self) -> Dict[str, Any]:
        """
        Identifies which categories and units generate the highest surplus and waste.
        """
        if not self.provider_history:
            return {
                "top_surplus_category": None,
                "top_wasted_category": None,
                "category_surplus_quantities": {},
                "category_expired_quantities": {},
                "most_frequent_unit": None
            }

        category_surplus = Counter()
        category_expired = Counter()
        unit_counts = Counter()

        for record in self.provider_history:
            cat = record.get("category", "other")
            qty = record.get("quantity", 0)
            status = record.get("status", "")
            unit = record.get("unit", "items")

            category_surplus[cat] += qty
            unit_counts[unit] += 1

            if status == "expired":
                category_expired[cat] += qty

        top_surplus_cat = category_surplus.most_common(1)[0][0] if category_surplus else None
        top_wasted_cat = category_expired.most_common(1)[0][0] if category_expired else None
        most_frequent_unit = unit_counts.most_common(1)[0][0] if unit_counts else None

        return {
            "top_surplus_category": top_surplus_cat,
            "top_wasted_category": top_wasted_cat,
            "category_surplus_quantities": dict(category_surplus),
            "category_expired_quantities": dict(category_expired),
            "most_frequent_unit": most_frequent_unit
        }

    def suggest_reduction(self, stats: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Generates actionable reduction recommendations based on observed stats[cite: 3].
        """
        stats = stats or self.calculate_waste_stats()
        patterns = self.identify_patterns()
        suggestions = []

        if stats.get("total_listings", 0) == 0:
            return ["Log more food listings to receive automated reduction insights."]

        waste_rate = stats.get("waste_rate_pct", 0)
        if waste_rate > 30:
            suggestions.append(
                f"High expiration rate detected ({waste_rate}%). Consider listing items earlier in the day or shortening pickup windows."
            )

        top_wasted = patterns.get("top_wasted_category")
        if top_wasted:
            suggestions.append(
                f"Category '{top_wasted}' has the highest rate of expiration. Optimize portioning and inventory prep for this category."
            )

        top_surplus = patterns.get("top_surplus_category")
        if top_surplus:
            suggestions.append(
                f"Consistent surplus found in '{top_surplus}'. Consider partnering with recurring shelter pickup schedules for automated dispatch."
            )

        if not suggestions:
            suggestions.append(
                "Great efficiency! Your current collection rate exceeds 85%. Maintain your current batching schedule."
            )

        return suggestions