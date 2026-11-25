# TerraSync API contracts (v0.2)

Base path: `/api/v1`. Live schema: `/docs` (Swagger) or `/openapi.json`.
Errors: `{"detail": "message"}` (string), or FastAPI's list form for body validation (422).
Auth: `Authorization: Bearer <access_token>` from `/auth/register` or `/auth/login`.

| Access | Meaning |
|---|---|
| public | no token needed |
| optional | works for guests; links data to the account when a token is sent |
| farmer / coordinator | token with that role required (401 without token, 403 wrong role) |

## Auth
| Method | Path | Access | Body → Response |
|---|---|---|---|
| POST | `/auth/register` | public, rate-limited | `{phone, pin (4–8 digits), name?, language: en\|yo, role: farmer\|coordinator, coordinator_code?}` → `201 {access_token, token_type, expires_at, user}`; 409 duplicate phone; 403 bad coordinator code |
| POST | `/auth/login` | public, rate-limited | `{phone, pin}` → same as register; 401 wrong PIN |
| GET | `/auth/me` | any signed-in | → `{id, phone, name, role, language}` |

Phones are normalised to `+234…` (`08012345678` works). Tokens last 72 h by default.

## Reference data
| GET | Access | Response |
|---|---|---|
| `/locations` | public | `{states: [{name, capital, pilot, lgas: [..]}]}` — Ogun, Ondo, Osun, Lagos |
| `/crops` | public | `{crops: [{id, name_en, name_yo, has_rules}], units: ["bags","kg","tons","baskets","crates","tubers"]}` |

## Harvest (Supply intelligence)
`HarvestReport` body: `{crop, quantity > 0, unit, state, lga, available_date: YYYY-MM-DD, contact, contact_consent?: bool = false, status?: "expected"|"available" = "expected", farm_id?}`
- crop accepts id, English or Yorùbá name (`"Maize"` → `"maize"`); unit accepts common aliases (`"bag"` → `"bags"`).
- state/LGA must be a valid pair; date within −30 days … +2 years. Invalid → 422.

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/harvest-reports` | optional, rate-limited | → `201 {id, status: "created"}`. Confirm with the farmer first. |
| GET | `/harvest-reports` | public | Board. Filters: `crop, state, lga, status, available_from, available_to, include_expired, limit`. Default: only `expected`/`available`, not expired. **Never includes contact.** |
| GET | `/harvest-reports/mine` | signed-in | Farmer's own reports, all statuses |
| GET | `/harvest-reports/{id}` | public | One report (no contact) |
| PATCH | `/harvest-reports/{id}/status` | owner or coordinator | `{status: expected\|available\|sold\|withdrawn}` |
| POST | `/harvest-reports/{id}/interest` | coordinator | `{note?}` → `{id, interested: true, interest_count}` |
| GET | `/harvest-reports/{id}/contact` | coordinator | `{id, contact}`; 403 if farmer did not consent |

Board item: `{id, crop, quantity, unit, state, lga, available_date, status, effective_status ("expired" when > 14 days past date), source ("web"|"voice"), created_at, updated_at, interested, interest_count}`.

Drafts (used by voice; usable by forms): `POST /harvest-drafts` (body HarvestReport) → `{id, report, confirmed}`, `GET|PUT /harvest-drafts/{id}`, `POST /harvest-drafts/{id}/confirm` → `{id, status}` (idempotent). Drafts made with a token can only be changed by that account.

## Farms
Farmer only. Body: `{name?, state, lga, crop, planting_date?, approximate_age_weeks?, soil_type?, farm_size_ha?}`
`GET /farms`, `POST /farms` (201), `GET /farms/{id}`, `PUT /farms/{id}`. Another user's farm → 404.

## Farm intelligence
`GET /insights/today` (optional auth)
- Signed-in: `?farm_id=…`; guest: `?crop=maize&state=Ogun&lga=Odeda&planting_date=2026-11-01`
- Also `language=en|yo`, `include_weather=true|false`.
- Response:
```json
{ "date": "2026-11-25",
  "context": {"farm_id": null, "crop": "maize", "state": "Ogun", "lga": "Odeda", "planting_date": "…", "days_after_planting": 24},
  "items": [{ "rule_id": "maize-weed-early", "category": "crop_care", "priority": 1, "urgency": "high",
              "title": "…", "reason": "…", "action": "…", "rationale": "…",
              "evidence": {"source_title": "…", "source_url": "…", "source_verified": false},
              "review_status": "unreviewed", "uncertainty": "…", "contraindications": "…", "escalation": "…",
              "region_level": "southwest", "language": "en" }],
  "missing_context": [{"field": "planting_date", "message": "…"}],
  "notes": ["Some advice is pending expert review; …"],
  "weather": { … same as /weather … } | null,
  "status": "ok" | "no_applicable_rules" }
```
Show `review_status`/`uncertainty` in the UI. Rules exist only for maize and cassava; other crops return `no_applicable_rules` with a note. Insight text is English only for now (a note says so when `language=yo`).

`GET /knowledge?crop=maize&category=post_harvest&state=Ogun&q=storage` (public) → `{crop, category, items: [same item shape], status}`. Categories: `crop_care, harvest, post_harvest, weather`.

`GET /weather?state=Ogun&lga=Odeda` (public) → `{available, provider: "Open-Meteo", location: {name, lat, lon, resolution: "state_capital", note}, fetched_at, current: {time, temperature_c, relative_humidity_pct, precipitation_mm}, daily: [{date, temperature_max_c, temperature_min_c, precipitation_mm, precipitation_probability_pct}]}`. On failure: `{available: false, reason, location…}` — show "weather unavailable", never placeholder numbers.

## Tasks
Farmer only. `GET /tasks?farm_id&status`, `POST /tasks {action, farm_id?, due_date?, rule_id?}`, `PATCH /tasks/{id} {status: pending|done|skipped}`.

## Voice
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/voice/session` | optional, rate-limited | `{language: en\|yo, farm_id?}` → `201 {session_id, room, url, token, identity, language, farm_id, expires_at, transcripts_stored}`. 503 when LiveKit isn't configured. `farm_id` requires sign-in. |
| GET | `/voice/sessions` | signed-in | Past calls `{session_id, language, farm_id, created_at, ended_at, turns}` |
| GET | `/voice/sessions/{id}/transcript` | owner | `{session_id, language, created_at, ended_at, items: [{role: user\|assistant, text, created_at}]}` |

Browser flow: call `/voice/session`, then `room.connect(url, token)` with `livekit-client`, enable the microphone. The token dispatches `terrasync-farmer-assistant` into the room. Live captions arrive as text streams on topic `lk.transcription`; agent state is in participant attribute `lk.agent.state` (`listening|thinking|speaking`). Implemented in `frontend/src/hooks/useVoiceCall.ts`.

Calls are **browser-only (WebRTC)**. GSM/basic-phone calls need a SIP trunk and phone number routed to LiveKit; not set up.

Guest calls: general advice and harvest drafts; no saved farm, no tasks, transcripts not stored. Signed-in calls with `farm_id`: the agent uses that farm automatically and saves the transcript (the agent tells the caller).

Agent tools (same services as the API): `get_farm_profile, get_daily_insights, search_agricultural_knowledge, get_local_weather, get_harvest_readiness, list_harvest_reports, prepare_harvest_report, publish_confirmed_harvest, create_farm_task`.

## Health
`GET /health` → `{status: ok|degraded, version, database, voice_configured, weather_enabled}`.
