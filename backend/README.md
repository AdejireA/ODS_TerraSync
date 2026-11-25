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
