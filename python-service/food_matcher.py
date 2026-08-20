import math
from typing import List, Dict, Any, Optional


class FoodMatcher:
    """
    Evaluates compatibility between surplus food listings and verified 
    community organizations based on category alignment, quantity fit, 
    and geographic proximity[cite: 1].
    """

    def __init__(
        self,
        available_listings: Optional[List[Dict[str, Any]]] = None,
        organizations: Optional[List[Dict[str, Any]]] = None
    ):
        self.available_listings = available_listings or []
        self.organizations = organizations or []

    def _calculate_haversine_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """Calculates great-circle distance between coordinates in kilometers."""
        earth_radius_km = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)

        a = (
            math.sin(d_lat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(d_lon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return earth_radius_km * c

    def _score_proximity(self, listing: Dict[str, Any], org: Dict[str, Any]) -> float:
        """Scores distance between 0 and 100 based on coordinates or address matching."""
        l_lat = listing.get("pickupLat")
        l_lng = listing.get("pickupLng")
        o_lat = org.get("lat") or org.get("pickupLat")
        o_lng = org.get("lng") or org.get("pickupLng")

        # Coordinate-based proximity calculation
        if l_lat is not None and l_lng is not None and o_lat is not None and o_lng is not None:
            dist_km = self._calculate_haversine_distance(
                float(l_lat), float(l_lng), float(o_lat), float(o_lng)
            )
            # Full points within 2 km, decays to 0 beyond 25 km
            return max(0.0, min(100.0, 100.0 - (dist_km * 4.0)))

        # Substring / city keyword heuristic fallback
        listing_loc = str(listing.get("pickupLocation", "")).lower()
        org_loc = str(org.get("address", "")).lower()

        if not listing_loc or not org_loc:
            return 50.0

        listing_tokens = set(listing_loc.replace(",", " ").split())
        org_tokens = set(org_loc.replace(",", " ").split())
        shared_tokens = listing_tokens.intersection(org_tokens)

        return 90.0 if len(shared_tokens) > 0 else 40.0

    def _score_category(self, listing: Dict[str, Any], org: Dict[str, Any]) -> float:
        """Scores category preference alignment out of 100."""
        listing_category = str(listing.get("category", "")).lower()
        org_categories = [
            str(cat).lower() for cat in org.get("preferredCategories", [])
        ]

        if not org_categories:
            return 85.0  # General food aid organizations accept most food categories

        if listing_category in org_categories:
            return 100.0

        return 35.0

    def _score_quantity(self, listing: Dict[str, Any], org: Dict[str, Any]) -> float:
        """Scores capacity and volume fit out of 100."""
        quantity = listing.get("quantity", 0)
        max_capacity = org.get("capacity", org.get("maxQuantity", 100))

        if quantity <= 0:
            return 0.0

        if quantity <= max_capacity:
            ratio = quantity / max_capacity
            return 70.0 + (ratio * 30.0)

        # Quantity exceeds typical capacity
        excess = quantity - max_capacity
        penalty = (excess / max_capacity) * 50.0
        return max(20.0, 100.0 - penalty)

    def calculate_match_score(self, listing: Dict[str, Any], org: Dict[str, Any]) -> float:
        """
        Calculates compatibility score (0-100) combining category (40%), 
        proximity (35%), and quantity fit (25%)[cite: 1].
        """
        category_score = self._score_category(listing, org)
        proximity_score = self._score_proximity(listing, org)
        quantity_score = self._score_quantity(listing, org)

        composite_score = (
            (category_score * 0.40)
            + (proximity_score * 0.35)
            + (quantity_score * 0.25)
        )
        return round(composite_score, 2)

    def find_matches(self, listing: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scores all registered organizations against a target food listing[cite: 1].
        """
        matches = []
        for org in self.organizations:
            score = self.calculate_match_score(listing, org)
            matches.append({
                "organizationId": str(org.get("_id", org.get("id", ""))),
                "organizationName": org.get("organizationName", org.get("name", "Unnamed Organization")),
                "email": org.get("email"),
                "phone": org.get("phone"),
                "address": org.get("address"),
                "matchScore": score,
                "listingId": str(listing.get("_id", listing.get("id", ""))),
                "foodName": listing.get("foodName")
            })

        return self.rank_matches(matches)

    def rank_matches(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sorts match entries in descending order of compatibility score[cite: 1]."""
        return sorted(matches, key=lambda match: match["matchScore"], reverse=True)