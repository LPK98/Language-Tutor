from datetime import date, timedelta

from app.services.progress_service import best_streak, current_streak, server_today


def test_record_practice_accumulates(client, auth_headers):
    first = client.post("/api/progress/practice", headers=auth_headers, json={"seconds": 90})
    second = client.post("/api/progress/practice", headers=auth_headers, json={"seconds": 30})

    assert first.status_code == second.status_code == 200
    assert second.json() == {"goalMinutes": 60, "practisedSeconds": 120, "completedLessons": 0}
    assert client.get("/api/progress/daily-goal", headers=auth_headers).json()["practisedSeconds"] == 120


def test_record_practice_validation(client, auth_headers):
    def post(body):
        return client.post("/api/progress/practice", headers=auth_headers, json=body)

    assert post({"seconds": 0}).status_code == 422
    assert post({"seconds": 4 * 60 * 60 + 1}).status_code == 422
    assert post({"seconds": 10, "date": "not-a-date"}).status_code == 422

    old_day = (server_today() - timedelta(days=5)).isoformat()
    response = post({"seconds": 10, "date": old_day})
    assert response.status_code == 400
    assert response.json() == {"detail": "date must be today's date in your local timezone"}


def test_complete_lesson_counts_once(client, auth_headers):
    first = client.post("/api/progress/lessons/hello/complete", headers=auth_headers)
    again = client.post("/api/progress/lessons/hello/complete", headers=auth_headers)

    assert first.status_code == again.status_code == 200
    assert again.json()["lessonId"] == "hello"
    assert again.json()["dailyGoal"]["completedLessons"] == 1


def test_complete_unknown_lesson_is_404(client, auth_headers):
    response = client.post("/api/progress/lessons/nope/complete", headers=auth_headers)
    assert response.status_code == 404


def test_streak_counts_consecutive_local_days(client, auth_headers):
    today = server_today()
    yesterday = today - timedelta(days=1)
    client.post("/api/progress/practice", headers=auth_headers, json={"seconds": 60, "date": yesterday.isoformat()})
    client.post("/api/progress/practice", headers=auth_headers, json={"seconds": 60, "date": today.isoformat()})

    streak = client.get("/api/progress/streak", headers=auth_headers).json()
    assert streak == {
        "practisedDates": [yesterday.isoformat(), today.isoformat()],
        "currentStreak": 2,
        "bestStreak": 2,
    }
    # The Profile screen gets the same data in one call.
    assert client.get("/api/users/me", headers=auth_headers).json()["streak"] == streak


def test_progress_requires_auth(client):
    assert client.get("/api/progress/daily-goal").status_code == 401
    assert client.get("/api/progress/streak").status_code == 401
    assert client.post("/api/progress/practice", json={"seconds": 60}).status_code == 401


# --- Streak rules, same as currentStreak/bestStreak in the app's profile.ts ---

D = date(2026, 9, 16)


def days(*offsets: int) -> list[date]:
    return [D + timedelta(days=offset) for offset in offsets]


def test_current_streak_rules():
    assert current_streak([], D) == 0
    assert current_streak(days(0), D) == 1
    assert current_streak(days(-2, -1, 0), D) == 3
    # Today not practised yet: the streak up to yesterday still counts.
    assert current_streak(days(-2, -1), D) == 2
    # A missed day breaks it.
    assert current_streak(days(-3, -2), D) == 0


def test_best_streak_rules():
    assert best_streak([]) == 0
    assert best_streak(days(0, 1, 2, 5, 6)) == 3
    assert best_streak(days(0, 0, 1)) == 2


def test_practice_rejects_boolean_seconds(client, auth_headers):
    response = client.post("/api/progress/practice", headers=auth_headers, json={"seconds": True})
    assert response.status_code == 422


def test_practice_time_is_capped_at_24_hours_a_day(client, auth_headers):
    for _ in range(7):  # 7 x 4 hours
        response = client.post("/api/progress/practice", headers=auth_headers, json={"seconds": 4 * 60 * 60})
    assert response.json()["practisedSeconds"] == 24 * 60 * 60


def test_completed_at_is_utc(client, auth_headers):
    response = client.post("/api/progress/lessons/hello/complete", headers=auth_headers)
    assert response.json()["completedAt"].endswith("Z")
