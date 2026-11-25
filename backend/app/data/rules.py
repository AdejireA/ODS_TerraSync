"""Regional agronomic rules (Section 7 of the development plan).

STATUS: every rule below is a DRAFT for demonstration. Sources are research
candidates that have not been checked against the specific claim, and stage
windows are broad placeholders. An agronomist must review each rule and set
`review_status` to "reviewed" before it is presented as verified advice.
No pesticide products or doses are given anywhere, by design.

Region hierarchy used for fallback: lga -> state -> southwest -> national.
Trigger types:
  - "stage":   days after planting within `window_days` (needs planting context)
  - "always":  applies whenever the crop matches
  - "rain_during_window": stage window AND forecast rain chance >= rain_probability
"""

SOUTHWEST = ["Ogun", "Ondo", "Osun", "Lagos"]

IITA_MAIZE = {"title": "IITA — Maize (crop overview)", "url": "https://www.iita.org/cropsnew/maize/", "verified": False}
IITA_CASSAVA = {"title": "IITA — Cassava (crop overview)", "url": "https://www.iita.org/cropsnew/cassava/", "verified": False}
FAO_FAW = {"title": "FAO — Fall armyworm programme", "url": "https://www.fao.org/fall-armyworm/en/", "verified": False}
FAO_LOSS = {"title": "FAO — Food loss and waste", "url": "https://www.fao.org/food-loss-and-food-waste/en/", "verified": False}

RULES = [
    # ---------------------------------------------------------------- maize
    {
        "id": "maize-weed-early", "crop": "maize", "category": "crop_care",
        "region": {"level": "southwest", "states": SOUTHWEST},
        "trigger": {"type": "stage", "window_days": [0, 42]}, "requires": ["planting_date"],
        "priority": 1,
        "title": "Keep young maize free of weeds",
        "action": "Weed the field during the early weeks after planting, by hoeing or another method you already use safely.",
        "rationale": "Young maize competes poorly with weeds for light, water and nutrients, so early weeding protects yield.",
        "uncertainty": "The 0–6 week window is a broad placeholder; the critical period varies by variety, weed pressure and season.",
        "contraindications": "Avoid deep hoeing close to the plants, which can damage roots.",
        "escalation": "Ask an extension officer before using any herbicide.",
        "source": IITA_MAIZE, "review_status": "unreviewed",
    },
    {
        "id": "maize-faw-scouting", "crop": "maize", "category": "crop_care",
        "region": {"level": "national", "states": None},
        "trigger": {"type": "stage", "window_days": [7, 60]}, "requires": ["planting_date"],
        "priority": 1,
        "title": "Check maize leaves for fall armyworm",
        "action": "Walk the field and inspect the funnel (whorl) of several plants for ragged holes and sawdust-like droppings.",
        "rationale": "Fall armyworm damages young maize quickly; early detection gives more options for control.",
        "uncertainty": "Leaf damage can have other causes. TerraSync cannot confirm a pest from a description.",
        "contraindications": "Do not apply pesticides without label instructions and expert advice.",
        "escalation": "If you see caterpillars or heavy damage, contact your extension officer or ADP office.",
        "source": FAO_FAW, "review_status": "unreviewed",
    },
    {
        "id": "maize-harvest-readiness", "crop": "maize", "category": "harvest",
        "region": {"level": "southwest", "states": SOUTHWEST},
        "trigger": {"type": "stage", "window_days": [85, 150]}, "requires": ["planting_date"],
        "priority": 2,
        "title": "Check whether your maize is ready to harvest",
        "action": "Look for dry, brown husks and hard grain. Prepare bags, labour and a clean drying surface before harvesting.",
        "rationale": "Harvesting at maturity and drying promptly reduces mould and storage losses.",
        "uncertainty": "Maturity timing depends strongly on variety; the window shown is a broad placeholder.",
        "contraindications": "Do not leave mature maize in the field for long during rainy periods.",
        "escalation": None,
        "source": IITA_MAIZE, "review_status": "unreviewed",
    },
    {
        "id": "maize-rain-at-harvest", "crop": "maize", "category": "weather",
        "region": {"level": "southwest", "states": SOUTHWEST},
        "trigger": {"type": "rain_during_window", "window_days": [85, 150], "rain_probability": 60},
        "requires": ["planting_date", "weather"],
        "priority": 1,
        "title": "Rain is forecast during your harvest period",
        "action": "Plan harvesting around dry days and keep harvested cobs or grain covered and off the ground.",
        "rationale": "Wet grain is more likely to develop mould during drying and storage.",
        "uncertainty": "Forecasts are approximate and use the state capital's location, not your farm.",
        "contraindications": None, "escalation": None,
        "source": FAO_LOSS, "review_status": "unreviewed",
    },
    {
        "id": "maize-dry-before-storage", "crop": "maize", "category": "post_harvest",
        "region": {"level": "national", "states": None},
        "trigger": {"type": "stage", "window_days": [85, 200]}, "requires": ["planting_date"],
        "priority": 2,
        "title": "Dry maize well before storing it",
        "action": "Dry shelled grain thoroughly, store it in clean, airtight bags off the floor, and check regularly for insects.",
        "rationale": "Moist grain and storage insects are major causes of post-harvest loss.",
        "uncertainty": "TerraSync cannot measure grain moisture; use a moisture meter or local testing method if available.",
        "contraindications": "Do not mix new grain with old, infested grain.",
        "escalation": None,
        "source": FAO_LOSS, "review_status": "unreviewed",
    },
    # -------------------------------------------------------------- cassava
    {
        "id": "cassava-weed-early", "crop": "cassava", "category": "crop_care",
        "region": {"level": "southwest", "states": SOUTHWEST},
        "trigger": {"type": "stage", "window_days": [0, 90]}, "requires": ["planting_date"],
        "priority": 1,
        "title": "Keep young cassava weeded",
        "action": "Weed regularly in the first months after planting until the canopy closes.",
        "rationale": "Cassava grows slowly at first, so early weed competition can greatly reduce root yield.",
        "uncertainty": "The 0–3 month window is a broad placeholder pending review.",
        "contraindications": "Avoid damaging the stems and shallow roots while weeding.",
        "escalation": "Ask an extension officer before using any herbicide.",
        "source": IITA_CASSAVA, "review_status": "unreviewed",
    },
    {
        "id": "cassava-mosaic-check", "crop": "cassava", "category": "crop_care",
        "region": {"level": "national", "states": None},
        "trigger": {"type": "stage", "window_days": [14, 120]}, "requires": ["planting_date"],
        "priority": 2,
        "title": "Look for yellow, twisted cassava leaves",
        "action": "Check leaves for yellow-green mottling or twisting. Note affected plants and use cuttings only from healthy plants next season.",
        "rationale": "Mosaic-type diseases spread through infected cuttings and insects and can reduce yield.",
        "uncertainty": "Leaf symptoms are not a diagnosis; nutrient problems can look similar.",
        "contraindications": None,
        "escalation": "If many plants are affected, contact your extension officer for confirmation.",
        "source": IITA_CASSAVA, "review_status": "unreviewed",
    },
    {
        "id": "cassava-harvest-planning", "crop": "cassava", "category": "harvest",
        "region": {"level": "southwest", "states": SOUTHWEST},
        "trigger": {"type": "stage", "window_days": [240, 540]}, "requires": ["planting_date"],
        "priority": 2,
        "title": "Plan cassava harvest around processing or sale",
        "action": "Arrange processing, transport or a buyer before you uproot, and harvest only what can be handled quickly.",
        "rationale": "Harvest timing depends on variety and market; roots stored in the ground keep longer than harvested roots.",
        "uncertainty": "Maturity varies widely by variety; the window shown is a broad placeholder.",
        "contraindications": None, "escalation": None,
        "source": IITA_CASSAVA, "review_status": "unreviewed",
    },
    {
        "id": "cassava-process-quickly", "crop": "cassava", "category": "post_harvest",
        "region": {"level": "national", "states": None},
        "trigger": {"type": "always"}, "requires": [],
        "priority": 3,
        "title": "Process or sell harvested cassava quickly",
        "action": "Move harvested roots to processing or buyers as soon as possible and avoid bruising them.",
        "rationale": "Fresh cassava roots spoil within a few days after harvest.",
        "uncertainty": "Exact shelf life depends on handling and conditions.",
        "contraindications": None, "escalation": None,
        "source": IITA_CASSAVA, "review_status": "unreviewed",
    },
]

RULES_BY_ID = {rule["id"]: rule for rule in RULES}
CROPS_WITH_RULES = sorted({rule["crop"] for rule in RULES})
