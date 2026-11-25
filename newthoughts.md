Read TERRASYNC_DEVELOPMENT_PLAN.md in full and treat it as our shared development specification.

Inspect the current repository and existing implementation before making changes. Understand the complete TerraSync product vision, your assigned responsibilities, development phases, API dependencies and acceptance criteria.

Use the previous TerraSync codebase as an authorised product and architecture reference, while respecting the organisers' code-reuse clarification.

Implement incrementally, preserve existing team changes and coordinate frontend/backend contracts. Do not unnecessarily reduce the product to a harvest reporting form or introduce unverified functionality.

After each phase, report implementation progress, files changed, test results, integration requirements, blockers and next steps.



Quick TerraSync alignment so we can develop in parallel.

We're retaining three core pillars:

1. Farm Intelligence — regional crop guidance, Daily Insights, weather and farm context.
2. Voice Intelligence — LiveKit + Spitch, English/Yorùbá agricultural conversations.
3. Supply Intelligence — harvest reporting, post-harvest guidance and produce availability.

I'm building the frontend in phases and integrating your FastAPI backend.

I'll use the existing POST/GET /api/v1/harvest-reports contract after checking its schema.

Please share the working API contracts as you implement:

- Harvest reports.
- Farm/crop context.
- Regional agricultural recommendations.
- Daily Insights.
- Weather, if available.
- LiveKit room/token creation.
- Voice agent language and farm context configuration.
- Call transcripts or summaries, if supported.

The voice agent should be able to access the same agricultural intelligence and harvest reporting capabilities as the frontend.

Also confirm whether we're doing browser-based LiveKit calls only or actual GSM calls through a SIP provider.

Please communicate endpoint changes early so we can keep both implementations aligned. I'll isolate API integration in the frontend service layer.