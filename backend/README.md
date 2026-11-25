# TerraSync backend

An initial FastAPI scaffold for the farmer-to-coordinator workflow. It stores farmer-reported harvest estimates in SQLite. `POST /api/v1/harvest-reports` creates a report and `GET /api/v1/harvest-reports` lists reports without contact details. Interactive API documentation is at `/docs`.

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The client must obtain the farmer's confirmation before calling the create endpoint. SQLite is for local prototyping. Authentication, access-controlled contact retrieval, coordinator interest, reviewed guidance, localization, LiveKit/Spitch integration, and production deployment remain to be implemented. Do not expose this prototype publicly with real farmer data before access controls are in place.

Structure: `app/api` contains HTTP routes, `app/core` holds infrastructure, and `app/services` is reserved for business logic and integrations. Set `TERRASYNC_DATABASE_PATH` to select the SQLite file.

Additional endpoints: `GET /api/v1/guidance?crop=maize&language=en` returns reviewed guidance only, and `POST /api/v1/harvest-reports/{id}/interest` marks a report as having interest. Guidance starts empty until sourced content is reviewed and added. Interest is currently a single anonymous flag, not a buyer contact or notification. These endpoints are prototypes and require authentication and authorization before public use.

Voice and form clients can use `POST /api/v1/harvest-drafts` with a complete harvest report, correct it with `PUT /api/v1/harvest-drafts/{id}`, then publish it with `POST /api/v1/harvest-drafts/{id}/confirm`. Repeating confirmation returns the same report. Drafts are not included in the board. The original direct-create endpoint remains available and must only be called after client-side confirmation. Draft IDs do not replace authentication; add access controls before using real data.

For a container-based local prototype, build with `docker build -t terrasync-backend backend` from the repository root and run with `docker run --rm -p 8000:8000 -v terrasync-data:/data terrasync-backend`. The named volume persists the SQLite database. Set deployment secrets through your runtime rather than building them into the image. The API is not ready for public deployment until authentication and authorization are implemented.
