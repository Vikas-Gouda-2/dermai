import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

router = APIRouter()

# Load product database
_products_path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")

def load_products():
    with open(_products_path, "r") as f:
        return json.load(f)

# Condition → recommended product categories
CONDITION_TO_CATEGORIES = {
    "dark_spots": ["serum", "sunscreen", "spot_treatment"],
    "open_pores": ["serum", "facewash", "clay_mask"],
    "oily_skin": ["facewash", "moisturiser", "sunscreen"],
    "dry_patches": ["moisturiser", "serum", "facewash"],
    "acne": ["facewash", "spot_treatment", "serum", "sunscreen"],
    "blackheads": ["facewash", "serum", "clay_mask"],
    "redness": ["moisturiser", "facewash", "sunscreen"],
    "uneven_tone": ["serum", "sunscreen", "spot_treatment"],
    "fine_lines": ["serum", "moisturiser", "sunscreen"],
    "dark_circles": ["eye_cream"],
    "rough_texture": ["serum", "facewash", "moisturiser"],
}


@router.get("/recommendations")
async def get_recommendations(
    conditions: str = Query(..., description="Comma-separated condition keys"),
    tier: Optional[str] = Query(None, description="Filter tier: budget/mid/premium"),
    limit: int = Query(12, ge=1, le=30)
):
    """
    Get product recommendations based on detected skin conditions.
    """
    try:
        all_products = load_products()
        condition_list = [c.strip() for c in conditions.split(",") if c.strip()]

        if not condition_list:
            raise HTTPException(status_code=400, detail="No conditions provided")

        # Collect relevant categories based on conditions
        relevant_categories = set()
        for condition in condition_list:
            cats = CONDITION_TO_CATEGORIES.get(condition, [])
            relevant_categories.update(cats)

        # Score products by how many detected conditions they address
        scored_products = []
        seen_ids = set()

        for category in relevant_categories:
            category_products = all_products.get(category, [])
            for product in category_products:
                if product["id"] in seen_ids:
                    continue
                # Skip if tier filter applied and doesn't match
                if tier and product.get("tier") != tier:
                    continue

                # Count how many detected conditions this product addresses
                matching_conditions = [
                    c for c in condition_list
                    if c in product.get("conditions", [])
                ]
                relevance_score = len(matching_conditions)

                if relevance_score > 0:
                    scored_products.append({
                        **product,
                        "category": category,
                        "relevance_score": relevance_score,
                        "matching_conditions": matching_conditions
                    })
                    seen_ids.add(product["id"])

        # Sort by relevance, then by category priority
        scored_products.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Ensure variety: at most 2 per category
        final_products = []
        category_counts = {}
        for product in scored_products:
            cat = product["category"]
            if category_counts.get(cat, 0) < 2:
                final_products.append(product)
                category_counts[cat] = category_counts.get(cat, 0) + 1
            if len(final_products) >= limit:
                break

        return {
            "success": True,
            "conditions_analysed": condition_list,
            "total": len(final_products),
            "products": final_products
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.get("/products")
async def get_all_products(
    category: Optional[str] = Query(None),
    tier: Optional[str] = Query(None)
):
    """Get all products, optionally filtered by category and tier."""
    all_products = load_products()

    if category:
        products = all_products.get(category, [])
    else:
        products = []
        for cat_products in all_products.values():
            products.extend(cat_products)

    if tier:
        products = [p for p in products if p.get("tier") == tier]

    return {"success": True, "total": len(products), "products": products}
