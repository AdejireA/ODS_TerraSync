"""Reference data shared by the API and the voice agent.

LGA lists match frontend/src/data/locations.ts. Coordinates are state capitals and
are only used as an approximate weather location until LGA coordinates are added.
"""

CROPS = {
    "maize": {"name_en": "Maize", "name_yo": "Àgbàdo"},
    "cassava": {"name_en": "Cassava", "name_yo": "Ẹgẹ́"},
    "tomato": {"name_en": "Tomato", "name_yo": "Tòmátì"},
    "pepper": {"name_en": "Pepper", "name_yo": "Ata"},
    "yam": {"name_en": "Yam", "name_yo": "Iṣu"},
    "groundnut": {"name_en": "Groundnut", "name_yo": "Ẹ̀pà"},
}

UNITS = ["bags", "kg", "tons", "baskets", "crates", "tubers"]
UNIT_ALIASES = {
    "bag": "bags", "sack": "bags", "sacks": "bags", "kilogram": "kg", "kilograms": "kg", "kgs": "kg",
    "ton": "tons", "tonne": "tons", "tonnes": "tons", "basket": "baskets", "crate": "crates",
    "tuber": "tubers",
}

STATES = {
    "Ogun": {
        "capital": "Abeokuta", "lat": 7.1475, "lon": 3.3619, "pilot": True,
        "lgas": [
            "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North (Yewa North)",
            "Egbado South (Yewa South)", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North",
            "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia",
            "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Sagamu",
        ],
    },
    "Ondo": {
        "capital": "Akure", "lat": 7.2571, "lon": 5.2058, "pilot": False,
        "lgas": [
            "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West",
            "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje",
            "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West",
            "Ose", "Owo",
        ],
    },
    "Osun": {
        "capital": "Osogbo", "lat": 7.7827, "lon": 4.5418, "pilot": False,
        "lgas": [
            "Atakumosa East", "Atakumosa West", "Aiyedaade", "Aiyedire", "Boluwaduro",
            "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central",
            "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila",
            "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo",
            "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo",
        ],
    },
    "Lagos": {
        "capital": "Ikeja", "lat": 6.6018, "lon": 3.3515, "pilot": False,
        "lgas": [
            "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
            "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe",
            "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu",
            "Surulere",
        ],
    },
}


def active_states() -> list[str]:
    """States open for use. Ogun is the pilot; others are kept as data for later expansion."""
    from app.core.config import env
    raw = env("TERRASYNC_ACTIVE_STATES", "Ogun")
    names = [name.strip() for name in raw.split(",") if name.strip() in STATES]
    return names or ["Ogun"]


def _key(text: str) -> str:
    return "".join(ch for ch in (text or "").lower() if ch.isalnum())


def normalize_crop(value: str) -> str:
    key = _key(value)
    for crop_id, names in CROPS.items():
        if key in (crop_id, _key(names["name_en"]), _key(names["name_yo"])):
            return crop_id
    raise ValueError(f"Unsupported crop. Choose one of: {', '.join(CROPS)}")


def normalize_unit(value: str) -> str:
    unit = (value or "").strip().lower()
    unit = UNIT_ALIASES.get(unit, unit)
    if unit not in UNITS:
        raise ValueError(f"Unsupported unit. Choose one of: {', '.join(UNITS)}")
    return unit


def normalize_state(value: str) -> str:
    key = _key(value.removesuffix(" State") if value else value)
    active = active_states()
    for name in active:
        if key == _key(name):
            return name
    raise ValueError(f"TerraSync currently covers {', '.join(active)} State only")


def normalize_lga(state: str, value: str) -> str:
    key = _key(value)
    for lga in STATES[state]["lgas"]:
        # Also accept the bracketed alternative name, e.g. "Yewa North".
        alternatives = [lga] + [part.strip(" )") for part in lga.split("(")[1:]]
        if any(key == _key(alt) for alt in alternatives):
            return lga
    raise ValueError(f"'{value}' is not an LGA in {state} State")
