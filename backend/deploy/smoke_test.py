import os
from datetime import date, timedelta

from fastapi.testclient import TestClient
from app.main import app

os.environ['TERRASYNC_COORDINATOR_CODE'] = 'test-coordinator-code'
os.environ['TERRASYNC_SECRET_KEY'] = 'ci-only-test-secret'

with TestClient(app) as client:
    assert client.get('/health').json()['status'] == 'ok'
    report = {'crop': 'maize', 'quantity': 12, 'unit': 'bags', 'state': 'Ogun', 'lga': 'Odeda', 'available_date': (date.today() + timedelta(days=7)).isoformat(), 'contact': '08012345678'}
    draft = client.post('/api/v1/harvest-drafts', json=report)
    assert draft.status_code == 201, draft.text
    draft_id = draft.json()['id']
    report['quantity'] = 20
    updated = client.put(f'/api/v1/harvest-drafts/{draft_id}', json=report)
    assert updated.status_code == 200, updated.text
    first_response = client.post(f'/api/v1/harvest-drafts/{draft_id}/confirm')
    assert first_response.status_code == 200, first_response.text
    first = first_response.json()
    assert client.post(f'/api/v1/harvest-drafts/{draft_id}/confirm').json() == first
    rows = client.get('/api/v1/harvest-reports').json()
    assert len(rows) == 1 and rows[0]['quantity'] == 20 and 'contact' not in rows[0]
    registered = client.post('/api/v1/auth/register', json={'phone': '08012345679', 'pin': '1234', 'role': 'coordinator', 'coordinator_code': 'test-coordinator-code'})
    assert registered.status_code == 201, registered.text
    token = registered.json()['access_token']
    response = client.post(f"/api/v1/harvest-reports/{first['id']}/interest", headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200, response.text
