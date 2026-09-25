from fastapi.testclient import TestClient

from app.main import app
from app.services import lesson_service


def test_root_and_docs(client):
    assert client.get("/").json() == {"message": "Language Tutor Backend is running!"}
    assert client.get("/docs").status_code == 200
    assert client.get("/openapi.json").json()["info"]["title"] == "Language Tutor API"


def test_unexpected_errors_do_not_leak_details(client, monkeypatch):
    def explode(_db):
        raise RuntimeError("secret database detail")

    monkeypatch.setattr(lesson_service, "featured_lessons", explode)
    with TestClient(app, raise_server_exceptions=False) as quiet_client:
        response = quiet_client.get("/api/lessons/featured")

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}


def test_cors_allows_expo_web(client):
    response = client.options(
        "/api/lessons/featured",
        headers={"Origin": "http://localhost:8081", "Access-Control-Request-Method": "GET"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:8081"
