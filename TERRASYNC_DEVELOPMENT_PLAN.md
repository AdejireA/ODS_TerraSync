# TerraSync --- Development Specification & Execution Plan

**Team Zenith \| Ogun Innovate Hackathon 2026 \| Agritech and Food Security**

Status: working specification, not a report of completed implementation. This document supersedes earlier brainstorming for development coordination. Update contracts and completion status as the team integrates.

## 1. Product definition

TerraSync is a bilingual, voice-enabled agricultural decision-support and food supply chain platform for smallholder farmers in Ogun, Ondo, Osun and Lagos, with Ogun as the primary pilot. It answers: what needs attention today, why does it matter, and what should I do next? It connects farm decisions to harvest preparation, post-harvest handling and produce discovery.

Three pillars:

-   **Farm intelligence:** regional crop context, deterministic Daily Insights, weather and actionable guidance.
-   **Voice intelligence:** LiveKit and Spitch conversations in English and Yorùbá, sharing the same agricultural knowledge as the web interface.
-   **Supply intelligence:** harvest reporting, expected availability, post-harvest guidance and a produce board for potential buyers and aggregators.

The platform supports production and supply visibility; it does not itself transport food, guarantee sales or demonstrate reduced losses without pilot evidence.

## 2. Starting point and constraints

Repository: `AdejireA/ODS_TerraSync`. The uploaded development transcript reports `main`, `feranmi` and `game-plan` branches; the latter holds planning notes. Main was reported to contain `thoughts.md` and a FastAPI skeleton. A Vite React TypeScript frontend was scaffolded and Tailwind installation initiated. The latest remote state has not been independently checked.

Previous TerraSync: React/Vite/TypeScript/Tailwind PWA and Django REST backend with farm onboarding, crop tracking, weather, tasks, deterministic insights, assistant and image screening. Use these as product and architecture references. The new backend is FastAPI; do not assume old Django endpoints exist.

The team reports permission to use old flows and details while writing separate files in the new public repository. The written handbook requires fresh competition code. Confirm the exact permission with organisers, avoid copying files or history, and retain a record of clarification. Never publish old credentials or private data.

The reported build window is two hours. Preserve the full product roadmap but ship working vertical slices first. Nobus Cloud deployment is mandatory. External media and speech service use should be confirmed with organisers.

## 3. Architecture

``` mermaid
flowchart TD
  W[React bilingual web app] --> A[FastAPI backend]
  W --> L[LiveKit audio room]
  P[Basic GSM phone] -. SIP provider required .-> L
  L <--> V[Python voice agent / Spitch speech pipeline]
  V <--> A
  A --> R[Regional agronomic rules and knowledge]
  A --> D[(Persistent data)]
  A --> E[Weather provider]
  A --> H[Harvest reports and supply board]
```

Deploy frontend, API, persistence and voice worker on Nobus where feasible. Decide whether LiveKit media is self-hosted or managed after checking credits, networking and rules. Retain existing FastAPI persistence until verified; use a persistent volume for SQLite if that is the current implementation, or PostgreSQL if already available. Do not introduce a database migration merely for sophistication.

### Shared intelligence

The web dashboard, text assistant and voice agent must consume the same backend rules and knowledge. The LLM explains and retrieves; it must not override validated rules or fabricate weather, crop maturity or harvest quantities. Use explicit missing-context responses.

## 4. Frontend specification

  -------------------------------------------------------------------------------------------------------------------------------------------
  Screen                  Requirements                                                                                Priority
  ----------------------- ------------------------------------------------------------------------------------------- -----------------------
  Landing                 Regional positioning, start farming, talk to TerraSync, produce discovery                   P0

  Dashboard               Farm location, prominent call action, daily insights, weather, harvest and crop shortcuts   P0

  Farm setup              State/LGA, crop, planting date or approximate age, optional soil and farm size              P0

  Voice call              Language, connect, mute, end, listening/speaking/thinking, reconnect/error                  P0

  Harvest report          Crop, quantity, unit, state, LGA, available date, contact consent                           P0

  Produce board           Live reports, filters, expected vs confirmed availability                                   P0

  Crop detail/advisory    Stage, relevant rules, evidence and next actions                                            P1

  Harvest detail          Readiness, preparation, handling and storage guidance                                       P1

  Weather/tasks           Forecast details, agricultural implications, task completion                                P1

  Assistant               Text and image interaction if backend supports it                                           P2

  Settings                Language, farm context, privacy                                                             P1
  -------------------------------------------------------------------------------------------------------------------------------------------

Suggested navigation: Home / Farm / Call / Harvest / Settings. Keep weather, pests and tasks accessible from dashboard or farm pages. Preserve old visual identity conceptually; mobile-first, large controls, simple language, low bandwidth, clear urgency labels. Translate new UI strings centrally; verify Yorùbá with a fluent reviewer. No decorative buttons implying working functionality.

Suggested structure (adapt to existing conventions):

``` text
frontend/src/
  pages/        Landing, Dashboard, FarmSetup, VoiceCall, HarvestReport, ProduceBoard
  components/   layout, navigation, dashboard, voice, harvest, agronomy, ui
  contexts/     LanguageContext, FarmContext
  hooks/        useVoiceCall, useHarvestReports, useDailyInsights
  lib/          api, types, config
  data/         locations, translations
```

Use a typed central API client, environment-based API URL, accessible forms, consistent loading/empty/error/success states and responsive layouts. If farm context is temporarily local, label it as device-local and do not imply account synchronisation. Do not store secrets in Vite environment variables.

## 5. Backend and integration contracts

Feranmi owns backend and voice. Inspect actual FastAPI OpenAPI/schema before integration. Only the harvest endpoints below are reported to exist; all others are proposed contracts to agree, not implemented endpoints.

  ---------------------------------------------------------------------------------------------------------------------------------------
  Capability              Method / proposed path         Contract
  ----------------------- ------------------------------ --------------------------------------------------------------------------------
  Harvest submission      POST /api/v1/harvest-reports   crop, quantity, unit, state, lga, available_date, contact (verify exact types)

  Harvest board           GET /api/v1/harvest-reports    Verify response shape and filtering; exclude private contact by default

  Locations               GET /api/v1/locations          state and LGA identifiers/names

  Farm context            GET/POST /api/v1/farms         location, crop context, optional soil/area

  Daily Insights          GET /api/v1/insights/today     ranked recommendations, reason, action, evidence, status

  Weather                 GET /api/v1/weather            location, forecast, timestamps, provider, unavailable state

  Voice session           POST /api/v1/voice/session     language and authorised context; returns room URL/token and session identifier

  Tasks                   GET/POST /api/v1/tasks         action, due date, status; confirm mutations

  Health                  GET /health                    service readiness (agree path)
  ---------------------------------------------------------------------------------------------------------------------------------------

Freeze actual contracts early; communicate changes in a shared document. Validate quantity \> 0, supported units, valid state/LGA pairs and dates. Agree error format and authentication. Avoid exposing contact details in unauthenticated board responses. Use explicit consent and rate limits for public submissions.

## 6. Voice development

LiveKit transports real-time audio; Spitch is the proposed speech integration. Confirm supported STT/TTS languages, credentials and actual Yoruba quality. Use server-issued short-lived room tokens, audio-only calls, HTTPS, microphone permission handling and connection recovery. Never expose provider secrets.

Voice agent flow:

1.  Greet and establish language.
2.  Retrieve authorised farm context or ask for state, LGA, crop and planting information.
3.  Identify intent: daily advice, weather, crop symptoms, harvest readiness, reporting produce.
4.  Call backend tools for real context and evidence.
5.  Respond briefly, explain uncertainty and ask relevant follow-up questions.
6.  For harvest submission or task creation, read back details and obtain explicit confirmation before saving.

Proposed tools: `get_farm_profile`, `get_daily_insights`, `get_local_weather`, `search_agricultural_knowledge`, `get_harvest_readiness`, `list_harvest_reports`, `create_harvest_report`, `create_farm_task`. Implement only against real services.

Browser calling is not the same as basic-phone calling. GSM access requires a dialable telephone number, compatible SIP provider/trunk, routing to LiveKit and an end-to-end test. Caller ID alone is not authentication. Allow guest general advice; protect private records. Do not claim no-internet access until an actual basic-phone call succeeds. If SIP is blocked, demonstrate browser audio and disclose the limitation. Recording/transcripts require appropriate notice, consent and retention policy.

## 7. Southwest agronomic layer

Scope: Ogun, Ondo, Osun, Lagos (not all Southwest states). Retain six legacy crop candidates: cassava, maize, tomato, pepper, groundnut and yam; prioritise evidence-backed cassava/maize demonstration rules. Do not claim all six are validated or available until tested.

Use geography hierarchy: farm → LGA → state → Southwest → national guidance. Fall back transparently when local evidence is missing. LGA selection alone does not establish soil conditions or crop suitability.

Each rule should include: ID, crop, applicable region, stage/window, required inputs, trigger, priority, action, rationale, source URL/title, review status, uncertainty, contraindications and escalation. Separate weather observations from agronomic conclusions. Avoid invented thresholds and pesticide dosages. Retain the old concept of rule governance, ranked candidates and inspection deduplication where practical.

Curate credible sources from agricultural institutions (e.g. IITA, FAO, NIHORT, IAR&T, FUNAAB); these are research candidates, not verified references for specific rules. Track licensing, geography, publication date and review status. A small curated knowledge base is preferable to a complex unvalidated retrieval system. Crop image screening is preliminary, not diagnosis.

## 8. Harvest and food supply chain

Farmer records expected crop availability, quantity, unit, location and date. Backend validates and stores the report. Board exposes consented availability to potential buyers/aggregators. Voice agent can submit the same report after confirmation. Post-harvest advice uses the regional knowledge layer. Distinguish expected, confirmed available, sold and expired records if supported. Do not aggregate incompatible units or present participating-farm reports as total state production.

Defer payments, logistics optimisation, automated yield prediction, market prices without reliable feeds and full buyer transaction management. Potential impact metrics: successful reports, buyer enquiries, completed harvest preparation tasks and measured spoilage in a later pilot; no unsupported yield or loss-reduction claims.

## 9. Phased delivery

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Phase                     Frontend                                              Backend / voice                       Acceptance gate
  ------------------------- ----------------------------------------------------- ------------------------------------- -------------------------------------------
  0 Foundation              Inspect scaffold, routing, localisation, API client   Confirm schema, environment, health   App builds; contracts shared

  1 Supply vertical slice   Report form and board                                 Persist and list reports              Submit and retrieve real record

  2 Voice vertical slice    Call UI, token integration                            Agent, speech, backend tools          Real two-way call; accurate tool response

  3 Farm intelligence       Setup and insight cards                               Regional context, reviewed rules      Same farm advice in UI and voice

  4 Product polish          Landing, dashboard, harvest guidance, mobile UX       Error handling, evidence, privacy     Coherent bilingual journey

  5 Enhancements            Tasks, weather, text/image assistant                  Corresponding services                Only add if core stable

  6 Final verification      Production build and smoke tests                      Nobus deploy, logs, health            Public working demo
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------

Deploy the earliest working slice in parallel with development. For a two-hour window, use indicative checkpoints: first 15 minutes contracts and setup; next 35 minutes harvest and voice foundations in parallel; next 35 minutes integration and regional guidance; final 35 minutes freeze, deploy, test and rehearse. Adjust to actual progress checks and time remaining. Cut enhancements before sacrificing a working call, report flow or deployment.

## 10. Team coordination and repository hygiene

-   Adejire: frontend, UX, bilingual interface and integration (as reported in transcript).
-   Feranmi: FastAPI, LiveKit/Spitch, agricultural tools and data contracts.
-   Deployment/testing owner: assign explicitly; third member responsibilities not confirmed.
-   Use dedicated feature branches; pull and inspect status before changes. Coordinate merges, avoid overwriting teammates' work, commit small tested slices. Keep planning branch separate unless agreed.
-   Public repo: exclude `.env`, credentials, local databases, private transcripts, build caches and personal information. Provide `.env.example` with placeholders and README setup instructions. Audit staged files before push.

## 11. Nobus deployment and testing

Confirm credits, VM access, ports and DNS. Build frontend, configure API and reverse proxy, set secrets server-side, persist data, run API and voice worker, enable HTTPS, verify public URL and health. Use appropriate LiveKit networking for the chosen hosting model. Document restart and rollback procedures. Do not rely on a laptop-only service for the live demo.

Acceptance checklist:

-   [ ] Production frontend build and type checks pass.
-   [ ] API reachable on Nobus; report survives restart.
-   [ ] Harvest form validates and board shows actual submitted report.
-   [ ] English/Yorùbá interface tested; unsupported speech languages clearly labelled.
-   [ ] LiveKit call connects, speaks, listens, mutes and ends.
-   [ ] Voice uses real backend data and handles missing context.
-   [ ] GSM call tested if claimed.
-   [ ] Regional advice has evidence and uncertainty handling.
-   [ ] No public secrets or unauthorised contact disclosure.
-   [ ] API outage, denied microphone and empty board handled honestly.
-   [ ] Mobile demo and pitch rehearsed.

## 12. Demonstration and judging

Use one hypothetical Ogun farmer with clearly labelled demo context. Show farm location and crop, start a real call, ask for guidance, report expected harvest by voice or form, then show the actual persisted report on the produce board. Explain post-harvest guidance and buyer visibility. If GSM works, demonstrate with a keypad phone; otherwise use browser audio and explain the roadmap.

Judging weights from handbook: live product 30%, problem understanding 20%, originality/local fit 20%, impact 15%, presentation 15%. Five-minute pitch: 45 seconds problem, 45 seconds solution, 150 seconds live demo, 60 seconds impact/team/next steps. Do not claim unimplemented features or measured impact.

## 13. Open decisions and blockers

-   Latest repository and branch contents, actual endpoint schemas and deployment status need verification.
-   Nigerian SIP number/provider, Spitch credentials and Yoruba speech quality are unconfirmed.
-   Agronomic sources and regional rules require evidence and review.
-   Authentication, contact privacy, persistence and deployment owner need agreement.
-   Organiser clarification on old-code reuse and external services should be recorded.
-   Proposed routes, component names, priorities and timing are planning decisions, not existing functionality.

## 14. Instructions for coding agents

Read this document, `thoughts.md`, current repository and relevant old product reference. Inspect before editing. Follow the actual backend contract. Implement one vertical slice at a time, preserve team changes, run tests/builds, report files changed, verified functionality, blockers and next action. Do not silently replace the product with a harvest-only form or create fake integrations. Do not expand scope at the expense of a working deployment. Ask only for consequential missing contracts, credentials or permissions.

## Source basis

-   ODS2026OgunInnovateHackathonGuide_2.pdf, especially pages 2, 4--8 (rules, judging, deployment and pitch).
-   Uploaded `Pasted markdown.md` development transcript, reported Git state, roles, FastAPI harvest contract and scaffold.
-   Previous TerraSync frontend/backend archives and prior product planning in this conversation; legacy capabilities are reference context, not proof of new implementation.
-   Repository reported in transcript: https://github.com/AdejireA/ODS_TerraSync
-   LiveKit documentation for implementation verification: https://docs.livekit.io/ (consult current SDK and telephony docs before integrating).
