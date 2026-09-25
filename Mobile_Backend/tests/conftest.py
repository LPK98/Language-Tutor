"""Shared test setup.

By default tests use a throwaway in-memory SQLite database, so they need no
setup. To run them against PostgreSQL instead, set TEST_DATABASE_URL to an
EMPTY database (its tables are dropped after every test):

    TEST_DATABASE_URL=postgresql+psycopg://postgres:...@localhost:5432/language_tutor_test
"""

import os

# Settings must exist before the app is imported.
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-key-that-is-long-enough-0123456789")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.models  # noqa: E402,F401
from app.core.database import Base, get_db  # noqa: E402
from app.core.rate_limit import login_failures_by_email, login_failures_by_ip  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402


@pytest.fixture(scope="session")
def engine():
    if TEST_DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            TEST_DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,  # one shared connection keeps the in-memory DB alive
        )

        @event.listens_for(engine, "connect")
        def enable_foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
    else:
        engine = create_engine(TEST_DATABASE_URL)
    yield engine
    engine.dispose()


@pytest.fixture
def session_factory(engine):
    """Fresh, seeded tables for every test, so tests never affect each other."""
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as db:
        seed(db)
    yield factory
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def reset_login_limits():
    """Failed-login counts live in memory; start every test from zero."""
    login_failures_by_email.clear()
    login_failures_by_ip.clear()


@pytest.fixture
def client(session_factory):
    def override_get_db():
        with session_factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register(client: TestClient, email: str = "learner@example.com", password: str = "Secret123", **extra):
    return client.post("/api/auth/register", json={"email": email, "password": password, **extra})


@pytest.fixture
def auth_headers(client) -> dict[str, str]:
    token = register(client).json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}
