from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    assert client.get('/health').json() == {'status': 'ok'}
    report = {'crop': 'maize', 'quantity': 12, 'unit': 'bags', 'state': 'Ogun', 'lga': 'Odeda', 'available_date': '2027-01-01', 'contact': 'test'}
    draft = client.post('/api/v1/harvest-drafts', json=report)
    assert draft.status_code == 201, draft.text
    draft_id = draft.json()['id']
    report['quantity'] = 20
    assert client.put(f'/api/v1/harvest-drafts/{draft_id}', json=report).status_code == 200
    first = client.post(f'/api/v1/harvest-drafts/{draft_id}/confirm').json()
    assert client.post(f'/api/v1/harvest-drafts/{draft_id}/confirm').json() == first
    rows = client.get('/api/v1/harvest-reports').json()
    assert len(rows) == 1 and rows[0]['quantity'] == 20 and 'contact' not in rows[0]
    assert client.post(f"/api/v1/harvest-reports/{first['id']}/interest").status_code == 200
