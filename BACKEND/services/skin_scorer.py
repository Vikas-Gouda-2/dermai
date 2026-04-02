import random
import math
from typing import Dict, List, Any

# Skin condition keys
ALL_CONDITIONS = [
    "dark_spots", "open_pores", "oily_skin", "dry_patches",
    "acne", "blackheads", "redness", "uneven_tone",
    "fine_lines", "dark_circles", "rough_texture"
]

# Labels for display
CONDITION_LABELS = {
    "dark_spots": "Dark Spots / Hyperpigmentation",
    "open_pores": "Open / Enlarged Pores",
    "oily_skin": "Oily Skin",
    "dry_patches": "Dry / Dehydrated Patches",
    "acne": "Active Acne / Pimples",
    "blackheads": "Blackheads / Whiteheads",
    "redness": "Redness / Inflammation",
    "uneven_tone": "Uneven Skin Tone",
    "fine_lines": "Fine Lines / Early Wrinkles",
    "dark_circles": "Under-Eye Dark Circles",
    "rough_texture": "Rough Skin Texture"
}

SEVERITY_LABELS = {
    (0, 2): "None",
    (2, 4): "Minimal",
    (4, 6): "Moderate",
    (6, 8): "Significant",
    (8, 10): "Severe"
}

SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"]

ZONES = ["Forehead", "T-Zone", "Left Cheek", "Right Cheek", "Chin", "Under-Eye", "Nose"]


def get_severity_label(score: float) -> str:
    for (low, high), label in SEVERITY_LABELS.items():
        if low <= score < high:
            return label
    return "Severe" if score >= 8 else "None"


def generate_mock_analysis(seed: int = None) -> Dict[str, Any]:
    """
    Generate a realistic mock skin analysis result.
    In production, this would be replaced with actual AI model inference.
    """
    if seed is not None:
        random.seed(seed)

    # Generate condition scores with realistic distributions
    # Typically 3-5 conditions are significant (score > 4)
    scores = {}
    
    # Pick 3-6 dominant conditions
    dominant_conditions = random.sample(ALL_CONDITIONS, k=random.randint(3, 6))
    
    for condition in ALL_CONDITIONS:
        if condition in dominant_conditions:
            # Dominant: score 4-9
            score = round(random.uniform(4.0, 9.0), 1)
        else:
            # Minor: score 0-4
            score = round(random.uniform(0.5, 3.8), 1)
        scores[condition] = score

    # Determine overall skin type based on scores
    if scores["oily_skin"] > 5 and scores["acne"] > 4:
        skin_type = "Oily"
    elif scores["dry_patches"] > 5:
        skin_type = "Dry"
    elif scores["redness"] > 5:
        skin_type = "Sensitive"
    elif scores["oily_skin"] > 4 and scores["dry_patches"] > 3:
        skin_type = "Combination"
    else:
        skin_type = "Normal"

    # Calculate overall skin health score (inverse of average condition score)
    avg_score = sum(scores.values()) / len(scores)
    overall_health = round(10 - avg_score, 1)
    overall_health = max(2.0, min(9.5, overall_health))

    # Generate zone-specific analysis
    zone_issues = {}
    for zone in ZONES:
        zone_conditions = random.sample(
            [k for k, v in scores.items() if v > 3],
            k=min(random.randint(1, 3), len([k for k, v in scores.items() if v > 3]))
        )
        zone_issues[zone] = zone_conditions if zone_conditions else []

    # Format conditions with labels and severity
    conditions_detail = []
    for condition, score in scores.items():
        conditions_detail.append({
            "key": condition,
            "label": CONDITION_LABELS[condition],
            "score": score,
            "severity": get_severity_label(score),
            "detected": score >= 3.0
        })

    # Sort by score descending
    conditions_detail.sort(key=lambda x: x["score"], reverse=True)

    return {
        "overall_score": overall_health,
        "skin_type": skin_type,
        "conditions": conditions_detail,
        "zone_issues": zone_issues,
        "analysis_confidence": round(random.uniform(0.82, 0.97), 2),
        "top_concerns": [c["key"] for c in conditions_detail[:3]],
        "positive_aspects": [
            c["key"] for c in conditions_detail
            if c["score"] < 2.5
        ][:2]
    }


def score_to_color(score: float) -> str:
    """Return a color category for a condition score."""
    if score < 3:
        return "green"
    elif score < 6:
        return "yellow"
    elif score < 8:
        return "orange"
    else:
        return "red"
