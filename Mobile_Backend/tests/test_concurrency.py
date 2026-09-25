"""Parallel requests (a double tap, or the app retrying on a slow network).

These need a real database server: in-memory SQLite runs everything on one
shared connection, so nothing actually happens at the same time. Run with
TEST_DATABASE_URL pointing to PostgreSQL (see conftest.py).
"""

import threading
from collections.abc import Callable

import pytest
from sqlalchemy import func, select

from app.models import DailyActivity, TermStatusEntry, User
from app.models.enums import TermStatus
from app.schemas.auth import RegisterRequest
from app.services import auth_service, practice_service, progress_service
from app.services.progress_service import server_today
from conftest import TEST_DATABASE_URL

pytestmark = pytest.mark.skipif(
    TEST_DATABASE_URL.startswith("sqlite"), reason="needs a real database server (PostgreSQL)"
)

PARALLEL = 10


def run_together(session_factory, action: Callable) -> list[BaseException]:
    """Runs `action(db, user)` in PARALLEL threads released at the same moment,
    each with its own session like separate requests. Returns the errors raised."""
    with session_factory() as db:
        user_id = auth_service.register_user(
            db, RegisterRequest(email="racer@example.com", password="Secret123")
        ).id

    barrier = threading.Barrier(PARALLEL)
    errors: list[BaseException] = []

    def worker():
        with session_factory() as db:
            user = db.get(User, user_id)
            barrier.wait()
            try:
                action(db, user)
            except BaseException as exc:  # noqa: BLE001 - collected for the assertion
                errors.append(exc)

    threads = [threading.Thread(target=worker) for _ in range(PARALLEL)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    return errors


def test_parallel_practice_time_is_all_saved(session_factory):
    today = server_today()
    errors = run_together(
        session_factory, lambda db, user: progress_service.add_practice_time(db, user, 10, today)
    )

    assert errors == []
    with session_factory() as db:
        assert db.scalar(select(DailyActivity.practised_seconds)) == 10 * PARALLEL


def test_parallel_lesson_completion_counts_once(session_factory):
    today = server_today()
    errors = run_together(
        session_factory, lambda db, user: progress_service.complete_lesson(db, user, "hello", today)
    )

    assert errors == []
    with session_factory() as db:
        assert db.scalar(select(DailyActivity.completed_lessons)) == 1


def test_parallel_term_status_keeps_one_row(session_factory):
    errors = run_together(
        session_factory,
        lambda db, user: practice_service.set_term_status(
            db, user, "vocab", "processed", TermStatus.KNOWN
        ),
    )

    assert errors == []
    with session_factory() as db:
        assert db.scalar(select(func.count()).select_from(TermStatusEntry)) == 1
