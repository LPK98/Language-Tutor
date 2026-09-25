from conftest import register


def test_register_returns_token_and_account(client):
    response = register(client, name="Lal")

    assert response.status_code == 201
    body = response.json()
    assert body["tokenType"] == "bearer"
    assert body["accessToken"]
    assert body["user"]["email"] == "learner@example.com"
    assert body["user"]["name"] == "Lal"
    assert "password" not in str(body).lower()


def test_register_defaults_name_to_student(client):
    assert register(client).json()["user"]["name"] == "Student"


def test_register_duplicate_email_is_409_case_insensitive(client):
    register(client, email="learner@example.com")
    response = register(client, email="Learner@Example.com")

    assert response.status_code == 409
    assert response.json() == {"detail": "An account with this email already exists"}


def test_register_rejects_invalid_email(client):
    assert register(client, email="not-an-email").status_code == 422


def test_register_rejects_weak_passwords(client):
    assert register(client, password="short1").status_code == 422
    assert register(client, password="onlyletters").status_code == 422
    assert register(client, password="12345678").status_code == 422


def test_login_success(client):
    register(client)
    response = client.post(
        "/api/auth/login", json={"email": "LEARNER@example.com", "password": "Secret123"}
    )

    assert response.status_code == 200
    assert response.json()["accessToken"]


def test_login_wrong_password_and_unknown_email_look_the_same(client):
    register(client)
    wrong_password = client.post(
        "/api/auth/login", json={"email": "learner@example.com", "password": "Wrong1234"}
    )
    unknown_email = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": "Secret123"}
    )

    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json() == {"detail": "Incorrect email or password"}


def test_me_requires_a_valid_token(client, auth_headers):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401

    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "learner@example.com"


def login(client, password: str, email: str = "learner@example.com"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_login_is_blocked_after_repeated_failures(client):
    register(client)
    for _ in range(5):
        assert login(client, "Wrong1234").status_code == 401

    blocked = login(client, "Secret123")  # even the right password waits
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) > 0
    # Other accounts are not affected.
    register(client, email="other@example.com")
    assert login(client, "Secret123", email="other@example.com").status_code == 200


def test_successful_login_resets_the_failure_count(client):
    register(client)
    for _ in range(4):
        login(client, "Wrong1234")
    assert login(client, "Secret123").status_code == 200
    for _ in range(4):
        assert login(client, "Wrong1234").status_code == 401


def test_logout_revokes_the_token(client, auth_headers):
    assert client.post("/api/auth/logout", headers=auth_headers).status_code == 204

    assert client.get("/api/auth/me", headers=auth_headers).status_code == 401
    # Signing in again issues a working token.
    token = login(client, "Secret123").json()["accessToken"]
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 200


def test_created_at_is_utc(client):
    assert register(client).json()["user"]["createdAt"].endswith("Z")


def test_register_trims_name_before_length_check(client):
    response = register(client, name=" " + "a" * 100)
    assert response.status_code == 201
    assert response.json()["user"]["name"] == "a" * 100
    assert register(client, email="x@example.com", name="a" * 101).status_code == 422
