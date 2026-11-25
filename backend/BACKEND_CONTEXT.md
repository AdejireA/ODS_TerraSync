# TerraSync backend — context for the Ogun research work

Status as of 25 Nov 2026. No credentials in this document.

## TL;DR for researchers
- Agronomic advice is a **list of structured rules** in [`backend/app/data/rules.py`](app/data/rules.py). There is no vector store and no free-text retrieval. The web dashboard and the voice agent read the same rules, so one rule edit changes both.
- To integrate research, deliver rules in the **rule format below** (one row per rule, in a spreadsheet or JSON). These drop straight in; no backend refactoring is needed.
- The current 9 rules (maize, cassava) are **placeholders**. Every one is `review_status: "unreviewed"` with unverified sources and placeholder stage windows. Research rules should replace them.
- Ogun-only scope: the rule engine already supports `lga`-level and `state`-level rules. The location list still includes Ondo, Osun and Lagos; removing them is a one-file change in [`app/data/catalog.py`](app/data/catalog.py), waiting on a team decision.

## 1. Branch and commit
- Branch **`codex/backend-ci-cd`**, head `02489f2`, pushed to `origin`. **Not merged to `main` yet.** `origin/main` is at `3cee760` (merge of PR #1 from `feranmi`).
- Not yet committed in the working tree: `backend/tests/` (pytest suite), `backend/Dockerfile.voice`, `backend/API_CONTRACTS.md`, this file.
- Full endpoint reference: [`backend/API_CONTRACTS.md`](API_CONTRACTS.md). Live schema is at `/docs` once the API is running.

## 2. Layout
```
backend/app/
  main.py              app, CORS, error handlers, /health
  core/config.py       env settings      core/database.py   SQLite schema + light migrations
  core/security.py     phone+PIN auth, signed bearer tokens, role checks
  core/ratelimit.py    in-memory per-IP limits
  data/catalog.py      crops, units, states/LGAs (+ name normalisation)
  data/rules.py        agronomic rules  ← research plugs in here
  services/            business logic shared by API and voice agent
    harvest.py  farms.py  insights.py  weather.py  tasks.py  voice.py
  api/                 thin HTTP routes over services
backend/voice/agent.py LiveKit worker (Spitch STT/TTS + LLM + tools)
backend/deploy/        Nobus install script + CI smoke test
```

## 3. Endpoints (prefix `/api/v1`)
| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Reference | `GET /locations`, `GET /crops`, `GET /weather?state=&lga=` |
| Harvest | `POST/GET /harvest-reports`, `GET /harvest-reports/mine`, `GET /harvest-reports/{id}`, `PATCH /{id}/status`, `POST /{id}/interest` (coordinator), `GET /{id}/contact` (coordinator + consent) |
| Drafts | `POST /harvest-drafts`, `GET/PUT /harvest-drafts/{id}`, `POST /{id}/confirm` |
| Farms | `GET/POST /farms`, `GET/PUT /farms/{id}` (farmer only) |
| Intelligence | `GET /insights/today`, `GET /knowledge`, `GET /guidance` (legacy, empty) |
| Tasks | `GET/POST /tasks`, `PATCH /tasks/{id}` |
| Voice | `POST /voice/session`, `GET /voice/sessions`, `GET /voice/sessions/{id}/transcript` |
| Health | `GET /health` |

Request and response schemas are in `API_CONTRACTS.md`; the Pydantic models are `HarvestReport` ([services/harvest.py](app/services/harvest.py)), `FarmInput` ([services/farms.py](app/services/farms.py)) and `TaskInput` ([services/tasks.py](app/services/tasks.py)).

## 4. Database (SQLite, [core/database.py](app/core/database.py))
| Table | Key columns |
|---|---|
| `users` | id, phone (unique, `+234…`), name, role (`farmer`/`coordinator`), pin_hash (scrypt), language |
| `farms` | id, user_id, name, state, lga, crop, planting_date, approximate_age_weeks, soil_type, farm_size_ha |
| `harvest_reports` | id, crop, quantity, unit, state, lga, available_date, contact, contact_consent, status (`expected/available/sold/withdrawn`), user_id, farm_id, source (`web/voice`) |
| `harvest_drafts` | id, payload (JSON), report_id, user_id, source |
| `harvest_interests` | report_id, user_id (coordinator), note |
| `tasks` | id, user_id, farm_id, action, due_date, status, rule_id, source |
| `voice_sessions` | id, room, user_id, farm_id, language, created_at, ended_at |
| `voice_transcripts` | session_id, role (`user/assistant`), text |
| `guidance` | crop, language, title, content, source_url, reviewed (legacy table, empty) |

Rules are **not** in the database; they're version-controlled Python data, so every change is reviewed in Git.

## 5. Agricultural knowledge format (what research should produce)
Each rule in [`app/data/rules.py`](app/data/rules.py):

| Field | Type / allowed values | Notes for researchers |
|---|---|---|
| `id` | `"maize-weed-early"` | unique, kebab-case |
| `crop` | `maize, cassava, tomato, pepper, yam, groundnut` | new crops need adding to `catalog.py` |
| `category` | `crop_care, harvest, post_harvest, weather` | |
| `region` | `{"level": "lga", "lgas": ["Odeda", …]}` · `{"level": "state", "states": ["Ogun"]}` · `{"level": "southwest", …}` · `{"level": "national"}` | at equal priority, more local rules rank first. LGA names must match `catalog.py` exactly |
| `trigger` | `{"type": "always"}` · `{"type": "stage", "window_days": [min, max]}` · `{"type": "rain_during_window", "window_days": [..], "rain_probability": 60}` | days after planting. New trigger types (e.g. calendar month, soil type) are a small engine change; tell us what you need |
| `requires` | `["planting_date"]`, `["weather"]` | context the rule needs |
| `priority` | `1` high · `2` medium · `3` low | |
| `title`, `action`, `rationale` | short plain English | `action` is read aloud by the voice agent, so keep it to 1–2 sentences |
| `uncertainty` | text | shown to the farmer |
| `contraindications` | text or null | |
| `escalation` | text or null | e.g. when to contact the Ogun State ADP or an extension officer |
| `source` | `{"title", "url", "verified": bool}` | `verified: true` only after someone checks the claim against the source |
| `review_status` | `"unreviewed"` / `"reviewed"` | `reviewed` only after agronomist sign-off |

Rules: no pesticide product names or doses; no invented thresholds. Every stage window and trigger value needs a source.

**Yorùbá:** rule text is English only right now, and the API tells the user so. If research supplies reviewed Yorùbá text, we'll add `title_yo`/`action_yo` fields. This is additive, not a refactor.

Easiest handover: a spreadsheet with exactly these columns, one row per rule. We convert it to `rules.py`.

## 6. Daily Insights engine ([services/insights.py](app/services/insights.py))
Deterministic; no LLM is involved in choosing advice.
1. Context comes from the saved farm (`farm_id`) or guest query parameters: crop, state, LGA, planting date. If there's no planting date, it's estimated from `approximate_age_weeks`.
2. Filter rules by crop and region (`lga` → `state` → `southwest` → `national`).
3. Fire triggers: stage window against days after planting; rain triggers use the Open-Meteo forecast.
4. Sort by priority, then by locality.
5. The response includes `missing_context` (e.g. "add planting date"), `notes` (pending review, no rules for this crop, Yorùbá unavailable) and the weather block.

`GET /knowledge` searches the same rules by crop, category and keywords. It backs the voice agent's knowledge tool.

## 7. Weather ([services/weather.py](app/services/weather.py))
Open-Meteo (no key), 3-day forecast, cached for 30 minutes. **The location is the state capital (Abeokuta for Ogun), not the LGA**, and the response says so. Adding Ogun LGA coordinates is an easy improvement the research team could supply (one lat/lon per LGA). On failure the API returns `available: false`, never made-up numbers.

## 8. Voice agent ([voice/agent.py](voice/agent.py))
- **Pipeline:** LiveKit Agents 1.x. Silero VAD, then Spitch STT (`en`/`yo`), then the LLM (`inference.LLM`, model from `TERRASYNC_LLM_MODEL`, default `google/gemma-4-31b-it`), then Spitch TTS (voice `lina` for English, `sade` for Yorùbá). Agent name: `terrasync-farmer-assistant`.
- **Session and farmer context:** the browser calls `POST /voice/session {language, farm_id?}`. The API stores a `voice_sessions` row and returns a 15-minute LiveKit token that also dispatches the agent with metadata `{session_id, language}`. The agent loads the session row from the shared database (trusted), then the farm. A guest gets general advice only.
- **System prompt (summary; full text in `FarmerAssistant.__init__`):** automated TerraSync assistant for Southwest Nigerian smallholders. Speaks the chosen language in short sentences. Today's date and farm context are injected. It must use tools for facts and never invent weather, maturity, quantities, diagnoses, pesticides or doses. It says plainly when guidance is missing and suggests an extension officer. It flags advice pending review. Harvest reports and tasks need a full read-back and explicit confirmation. It never promises buyers or prices.
- **Tools** (all call the same services as the API): `get_farm_profile`, `get_daily_insights`, `search_agricultural_knowledge`, `get_local_weather`, `get_harvest_readiness`, `list_harvest_reports`, `prepare_harvest_report`, `publish_confirmed_harvest`, `create_farm_task` (signed-in only).
- **Transcripts:** saved for signed-in callers (with a spoken notice), not for guests.
- **Frontend:** [`frontend/src/hooks/useVoiceCall.ts`](../frontend/src/hooks/useVoiceCall.ts) and [`pages/Voice.tsx`](../frontend/src/pages/Voice.tsx): connect, mute, end, agent state, live captions, microphone-denied and unavailable states.

**Spitch status:** the code is wired up, but **no real call has been made yet**. Spitch credentials, LiveKit project credentials and Yorùbá recognition and speech quality are all unverified. The LLM model id also needs confirming against what LiveKit Inference offers.

## 9. Browser voice vs ordinary GSM calls
- **Browser (WebRTC) only.** That's what's implemented.
- **GSM:** not set up. It needs a phone number plus a SIP trunk from a provider that supports Nigerian numbers, routed to LiveKit SIP with a dispatch rule to the same agent. The agent code would work unchanged, but callers would be guests (caller ID isn't authentication). Don't claim basic-phone access until a real call works.

## 10. Harvest and produce status
Working and covered by tests: validated submission (crop, unit, Ogun LGA checks, date window), drafts with confirmation for voice, a public board with filters that never shows contact details, expiry 14 days after the availability date, status changes, coordinator interest, and contact visible only with farmer consent.
Not built: buyer accounts beyond the coordinator role, notifications, prices, logistics.

## 11. Nobus deployment
- CI workflow [`.github/workflows/backend.yml`](../.github/workflows/backend.yml): smoke test on PRs; deploys over SSH to Nobus **on push to `main` only**. It needs repo secrets `NOBUS_DEPLOY_KEY`, `NOBUS_KNOWN_HOSTS` and `NOBUS_HOST`.
- [`deploy/install.sh`](deploy/install.sh): release directories, a virtual environment, an auto-generated secret key, a systemd unit `terrasync-api` on `127.0.0.1:8000`, a health check, and rollback.
- **Current state:** the branch isn't merged, so nothing has been deployed by CI. I can't see whether the secrets or the VM exist. Still missing: a public reverse proxy and HTTPS (nginx/Caddy), `TERRASYNC_CORS_ORIGINS`, `TERRASYNC_COORDINATOR_CODE` and LiveKit/Spitch env on the server, the **voice worker service** (`Dockerfile.voice` exists, but there's no systemd unit or deploy step yet), and frontend hosting.

## 12. Blockers
1. Sourced, reviewed Ogun rules and Yorùbá text: **research team.**
2. LiveKit and Spitch credentials, plus a first real two-way call test with a fluent Yorùbá speaker.
3. Nobus: VM access, secrets, domain and HTTPS, voice worker deployment.
4. Decision: limit `catalog.py` to Ogun only (and its effect on the frontend location list).
5. GSM: SIP provider and number, if it will be demonstrated at all.
6. Organiser confirmation on external services and code reuse (plan §2).
