from fastapi.testclient import TestClient
import src.app as app_module

client = TestClient(app_module.app)


def setup_function():
    # Reset activities to original state before each test
    app_module.activities = {
        "Chess Club": {
            "description": "Learn strategies and compete in chess tournaments",
            "schedule": "Fridays, 3:30 PM - 5:00 PM",
            "max_participants": 12,
            "participants": ["michael@mergington.edu", "daniel@mergington.edu"],
        },
        "Programming Class": {
            "description": "Learn programming fundamentals and build software projects",
            "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
            "max_participants": 20,
            "participants": ["emma@mergington.edu", "sophia@mergington.edu"],
        },
    }


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_success():
    resp = client.post("/activities/Chess%20Club/signup?email=test@school.edu")
    assert resp.status_code == 200
    assert "Signed up test@school.edu for Chess Club" in resp.json()["message"]
    # verify participant was added
    resp2 = client.get("/activities")
    assert "test@school.edu" in resp2.json()["Chess Club"]["participants"]


def test_signup_duplicate():
    # michael is already signed up in setup
    resp = client.post("/activities/Chess%20Club/signup?email=michael@mergington.edu")
    assert resp.status_code == 400


def test_unregister_success():
    # unregister existing
    resp = client.delete("/activities/Chess%20Club/unregister?email=michael@mergington.edu")
    assert resp.status_code == 200
    assert "Removed michael@mergington.edu from Chess Club" in resp.json()["message"]
    # verify removed
    resp2 = client.get("/activities")
    assert "michael@mergington.edu" not in resp2.json()["Chess Club"]["participants"]


def test_unregister_not_registered():
    resp = client.delete("/activities/Chess%20Club/unregister?email=not@here.edu")
    assert resp.status_code == 400