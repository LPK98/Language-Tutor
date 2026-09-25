def test_profile_matches_app_profile_shape(client, auth_headers):
    response = client.get("/api/users/me", headers=auth_headers)

    assert response.status_code == 200
    profile = response.json()
    assert profile["name"] == "Student"
    assert profile["avatarUrl"] is None
    assert profile["tutor"] == {"id": "emma", "name": "Emma", "avatarUrl": None}
    assert profile["language"] == {"code": "en-GB", "label": "English (UK)", "flag": "\U0001f1ec\U0001f1e7"}
    assert profile["level"] == "A1"
    assert profile["dailyGoal"] == {"goalMinutes": 60, "practisedSeconds": 0, "completedLessons": 0}
    assert profile["streak"] == {"practisedDates": [], "currentStreak": 0, "bestStreak": 0}


def test_profile_requires_auth(client):
    assert client.get("/api/users/me").status_code == 401


def test_update_profile_changes_only_sent_fields(client, auth_headers):
    response = client.patch(
        "/api/users/me", headers=auth_headers, json={"dailyGoalMinutes": 30, "level": "B1"}
    )

    assert response.status_code == 200
    profile = response.json()
    assert profile["dailyGoal"]["goalMinutes"] == 30
    assert profile["level"] == "B1"
    assert profile["name"] == "Student"


def test_update_profile_validation(client, auth_headers):
    def patch(body):
        return client.patch("/api/users/me", headers=auth_headers, json=body)

    assert patch({"dailyGoalMinutes": 0}).status_code == 422
    assert patch({"dailyGoalMinutes": 241}).status_code == 422
    assert patch({"level": "Z9"}).status_code == 422
    assert patch({"languageCode": "fr-FR"}).status_code == 422
    assert patch({"name": "   "}).status_code == 422
    assert patch({"tutorId": "nobody"}).status_code == 400
