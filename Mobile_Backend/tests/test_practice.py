from conftest import register


def test_recommended_cards(client):
    items = client.get("/api/practice/recommended").json()

    assert items == [
        {"id": "grammar", "title": "Grammar", "category": "grammar", "emoji": "\U0001f4da", "imageKey": None},
        {"id": "pronunciation", "title": "Pronunciation", "category": "pronunciation", "emoji": "\U0001f3a4", "imageKey": None},
        {"id": "vocab", "title": "Vocab", "category": "vocabulary", "emoji": "\U0001f4d4", "imageKey": None},
    ]


def test_categories_and_sections(client):
    categories = client.get("/api/practice/categories").json()
    assert [category["id"] for category in categories] == [
        "travel", "work", "social", "dining", "health", "shopping",
    ]
    assert categories[0] == {"id": "travel", "label": "Travel & Transportation", "icon": "airplane-outline"}

    sections = client.get("/api/practice/sections").json()
    assert [section["id"] for section in sections] == ["travel", "dining", "work"]
    assert sections[0]["title"] == "Travel & Transportation"
    assert sections[0]["topics"][0] == {
        "id": "airport", "title": "Airport check-in & security", "minutes": 5, "imageKey": None,
    }


def test_terms_set_omits_status_when_unclassified(client):
    practice_set = client.get("/api/practice/sets/vocab").json()

    assert practice_set["kind"] == "terms"
    assert practice_set["unitLabel"] == "Practiced Vocabulary"
    assert len(practice_set["terms"]) == 8
    # The app counts any term whose status is not `undefined` as practised.
    assert "status" not in practice_set["terms"][0]


def test_speech_set(client):
    practice_set = client.get("/api/practice/sets/pronunciation").json()

    assert practice_set["kind"] == "speech"
    assert practice_set["collection"] == {
        "title": "Lesson Vocabulary", "subtitle": "All lesson words", "emoji": "\U0001f30d",
    }
    assert len(practice_set["words"]) == 18
    assert practice_set["words"][6] == {"id": "nice-to-meet-you", "word": "Nice to meet you"}


def test_unknown_set_is_404(client):
    response = client.get("/api/practice/sets/nope")
    assert response.status_code == 404
    assert response.json() == {"detail": "Practice set not found"}


def test_term_status_is_personal(client, auth_headers):
    url = "/api/practice/sets/grammar/terms/must/status"
    response = client.put(url, headers=auth_headers, json={"status": "known"})
    assert response.status_code == 200
    assert response.json() == {"setId": "grammar", "termId": "must", "status": "known"}

    mine = client.get("/api/practice/sets/grammar", headers=auth_headers).json()
    assert mine["terms"][0]["status"] == "known"
    assert "status" not in mine["terms"][1]

    other_token = register(client, email="other@example.com").json()["accessToken"]
    theirs = client.get("/api/practice/sets/grammar", headers={"Authorization": f"Bearer {other_token}"}).json()
    assert "status" not in theirs["terms"][0]

    client.put(url, headers=auth_headers, json={"status": None})
    cleared = client.get("/api/practice/sets/grammar", headers=auth_headers).json()
    assert "status" not in cleared["terms"][0]


def test_term_status_errors(client, auth_headers):
    body = {"status": "known"}
    assert client.put("/api/practice/sets/grammar/terms/must/status", json=body).status_code == 401
    assert client.put("/api/practice/sets/grammar/terms/nope/status", headers=auth_headers, json=body).status_code == 404
    assert client.put("/api/practice/sets/pronunciation/terms/hello/status", headers=auth_headers, json=body).status_code == 400
    assert client.put(
        "/api/practice/sets/grammar/terms/must/status", headers=auth_headers, json={"status": "mastered"}
    ).status_code == 422
