from typing import List, Dict, Any, Optional


class SustainabilityCalculator:
    """
    Calculates environmental and social impact metrics from food rescue records[cite: 3].
    """

    CO2_PER_KG_FOOD = 2.5  # Standard benchmark: 1 kg food waste ≈ 2.5 kg CO2[cite: 3]
    KG_PER_PORTION = 0.4   # Average portion ≈ 0.4 kg

    def __init__(self, donation_records: Optional[List[Dict[str, Any]]] = None):
        self.donation_records = donation_records or []

    def calculate_co2_saved(self, kg_food: float) -> float:
        """
        Calculates CO2 emissions prevented in kg (1 kg food waste ≈ 2.5 kg CO2)[cite: 3].
        """
        if kg_food <= 0:
            return 0.0
        return round(kg_food * self.CO2_PER_KG_FOOD, 2)

    def calculate_meals_saved(self, portions: float) -> int:
        """
        Calculates total meals saved from rescued portions[cite: 3].
        """
        return int(max(0, portions))

    def normalize_to_kg(self, quantity: float, unit: str) -> float:
        """
        Normalizes various food units to equivalent kilograms.
        """
        unit_lower = str(unit).lower()
        if unit_lower == "kg":
            return float(quantity)
        elif unit_lower in ("portions", "items"):
            return float(quantity) * self.KG_PER_PORTION
        elif unit_lower == "liters":
            return float(quantity) * 1.0
        return float(quantity) * self.KG_PER_PORTION

    def generate_impact_report(self, provider_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a summary dictionary with SDG-aligned impact metrics[cite: 3].
        """
        records = self.donation_records
        if provider_id:
            records = [
                r for r in records
                if str(r.get("providerId", r.get("userId", ""))) == str(provider_id)
            ]

        total_weight_kg = 0.0
        total_portions = 0.0
        collected_count = 0

        for record in records:
            status = record.get("status", "collected")
            if status in ("collected", "donated", "approved"):
                qty = float(record.get("quantity", record.get("totalDonated", 0)))
                unit = record.get("unit", "portions")

                weight = self.normalize_to_kg(qty, unit)
                total_weight_kg += weight
                total_portions += qty if unit in ("portions", "items") else (weight / self.KG_PER_PORTION)
                collected_count += 1

        co2_saved = self.calculate_co2_saved(total_weight_kg)
        meals_saved = self.calculate_meals_saved(total_portions)
        trees_equivalent = round(co2_saved / 21.77, 2)  # 1 mature tree absorbs ~21.77 kg CO2/year

        return {
            "total_donations_completed": collected_count,
            "total_waste_diverted_kg": round(total_weight_kg, 2),
            "total_co2_saved_kg": co2_saved,
            "total_meals_saved": meals_saved,
            "equivalent_tree_years": trees_equivalent,
            "sdg_impact": {
                "SDG_2_Zero_Hunger": f"{meals_saved} meals provided to vulnerable populations",
                "SDG_12_Responsible_Consumption": f"{round(total_weight_kg, 2)} kg food diverted from landfills",
                "SDG_13_Climate_Action": f"{co2_saved} kg GHG emissions mitigated"
            }
        }