from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings


def test_featured_lessons_match_home_carousel(client):
    response = client.get("/api/lessons/featured")

    assert response.status_code == 200
    lessons = response.json()
    assert [lesson["id"] for lesson in lessons] == ["modals-deduction", "ordering-food", "th-sounds"]
    assert lessons[0] == {
        "id": "modals-deduction",
        "title": "Modals of Deduction",
        "category": "grammar",
        "categoryLabel": "Grammar",
        "description": "Must, might, can’t — talk about how sure you are.",
        "imageKey": "grammar",
    }


def test_get_lesson_and_404(client):
    assert client.get("/api/lessons/th-sounds").json()["categoryLabel"] == "Pronunciation"

    response = client.get("/api/lessons/does-not-exist")
    assert response.status_code == 404
    assert response.json() == {"detail": "Lesson not found"}


def test_learning_paths_match_app_levels(client):
    paths = client.get("/api/learning-paths").json()

    assert [(path["id"], path["level"]) for path in paths] == [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("expert", "Expert"),
    ]
    assert [lesson["id"] for lesson in paths[0]["lessons"]] == [
        "hello", "magic-words", "who-am-i", "this-is-my", "how-are-you", "my-day", "i-like",
    ]
    assert all(len(path["lessons"]) == 7 for path in paths)
    assert paths[0]["lessons"][0] == {
        "id": "hello", "title": "Hello!", "emoji": "\U0001f44b", "imageKey": None, "completed": False,
    }


def test_learning_paths_show_completion_only_for_that_user(client, auth_headers):
    client.post("/api/progress/lessons/hello/complete", headers=auth_headers)

    mine = client.get("/api/learning-paths", headers=auth_headers).json()
    guest = client.get("/api/learning-paths").json()

    assert mine[0]["lessons"][0]["completed"] is True
    assert mine[0]["lessons"][1]["completed"] is False
    assert guest[0]["lessons"][0]["completed"] is False


def test_guest_pages_ignore_an_expired_or_revoked_token(client, auth_headers):
    """The app may still hold an old token; public screens must load as a guest."""
    user_id = client.get("/api/auth/me", headers=auth_headers).json()["id"]
    expired = jwt.encode(
        {"sub": user_id, "ver": 0, "exp": datetime.now(UTC) - timedelta(minutes=1)},
        get_settings().jwt_secret_key,
        algorithm="HS256",
    )
    client.post("/api/auth/logout", headers=auth_headers)

    for headers in ({"Authorization": f"Bearer {expired}"}, auth_headers):
        assert client.get("/api/learning-paths", headers=headers).status_code == 200
        assert client.get("/api/practice/sets/vocab", headers=headers).status_code == 200
        # Endpoints that need an account still refuse the token.
        assert client.get("/api/users/me", headers=headers).status_code == 401
