"""Supply intelligence: expected produce availability from farmer reports.

Aggregates only reports on the TerraSync board (participating farmers). It is not
an estimate of total production, and quantities in different units are never added.
"""
from collections import defaultdict
from datetime import date, timedelta

from app.data.catalog import CROPS
from app.services.harvest import list_reports
from app.services.insights import search_knowledge

DISCLAIMER = ("Totals cover reports from farmers using TerraSync only, not total production. "
              "Quantities in different units are kept separate.")


def _week_start(day: date) -> date:
    return day - timedelta(days=day.weekday())


def supply_summary(crop: str | None = None, lga: str | None = None, state: str | None = None,
                   days: int = 60) -> dict:
    today = date.today()
    horizon = today + timedelta(days=days)
    reports = list_reports(crop=crop, state=state, lga=lga, available_to=horizon, limit=500)

    by_week: dict[tuple, dict] = {}
    by_crop: dict[tuple, dict] = defaultdict(lambda: {"total_quantity": 0.0, "reports": 0, "with_interest": 0})
    lgas: dict[str, set] = defaultdict(set)
    for report in reports:
        available = date.fromisoformat(report["available_date"])
        week = _week_start(max(available, today)).isoformat()
        key = (report["crop"], report["lga"], report["unit"], week)
        bucket = by_week.setdefault(key, {"crop": report["crop"], "lga": report["lga"], "unit": report["unit"],
                                          "week_start": week, "total_quantity": 0.0, "reports": 0,
                                          "with_interest": 0, "available_now": 0})
        for target in (bucket, by_crop[(report["crop"], report["unit"])]):
            target["total_quantity"] += report["quantity"]
            target["reports"] += 1
            target["with_interest"] += int(report["interested"])
        bucket["available_now"] += int(report["status"] == "available" or available <= today)
        lgas[report["crop"]].add(report["lga"])

    crops = sorted({c for c, _ in by_crop})
    return {
        "generated_at": today.isoformat(),
        "horizon_days": days,
        "filters": {"crop": crop, "state": state, "lga": lga},
        "totals": [{"crop": c, "unit": u, **v, "lgas": sorted(lgas[c])}
                   for (c, u), v in sorted(by_crop.items())],
        "weekly": sorted(by_week.values(), key=lambda b: (b["week_start"], b["crop"], b["lga"], b["unit"])),
        "post_harvest_guidance": {
            c: [{"rule_id": i["rule_id"], "title": i["title"], "action": i["action"],
                 "review_status": i["review_status"]}
                for i in search_knowledge(c, "post_harvest")["items"]]
            for c in crops if c in CROPS
        },
        "disclaimer": DISCLAIMER,
    }
