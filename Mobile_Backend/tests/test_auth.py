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
