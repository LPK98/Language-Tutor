"""Daily goal, streak and lesson completion logic."""

from datetime import UTC, date, datetime, timedelta

from sqlalchemy import case, or_, select
from sqlalchemy.orm import Session

from app.core.database import upsert
from app.core.errors import BadRequestError, NotFoundError
from app.models import DailyActivity, Lesson, LessonCompletion, User
from app.schemas.progress import DailyGoalOut, LessonCompleteOut, StreakOut


def server_today() -> date:
    return datetime.now(UTC).date()


def resolve_day(requested: date | None) -> date:
    """The day to record activity against.

    The app sends the learner's local date, because "today" depends on their
    timezone. Every timezone is within one day of UTC, so anything further
    away is rejected; that stops a client back-filling an old streak.
    """
    today = server_today()
    if requested is None:
        return today
    if abs((requested - today).days) > 1:
        raise BadRequestError("date must be today's date in your local timezone")
    return requested


# --- Streak maths (same rules as currentStreak/bestStreak in profile.ts) ---


def current_streak(practised: list[date], today: date) -> int:
    """Consecutive practised days ending today, or ending yesterday when today
    has not been practised yet, so an unfinished day does not reset the count."""
    days = set(practised)
    cursor = today if today in days else today - timedelta(days=1)
    count = 0
    while cursor in days:
        count += 1
        cursor -= timedelta(days=1)
    return count


def best_streak(practised: list[date]) -> int:
    best = run = 0
    previous: date | None = None
    for day in sorted(set(practised)):
        run = run + 1 if previous == day - timedelta(days=1) else 1
        best = max(best, run)
        previous = day
    return best


# --- Queries ---


def practised_dates(db: Session, user: User) -> list[date]:
    return list(
        db.scalars(
            select(DailyActivity.activity_date)
            .where(
                DailyActivity.user_id == user.id,
                or_(DailyActivity.practised_seconds > 0, DailyActivity.completed_lessons > 0),
            )
            .order_by(DailyActivity.activity_date)
        )
    )


def get_streak(db: Session, user: User, today: date) -> StreakOut:
    dates = practised_dates(db, user)
    return StreakOut(
        practised_dates=dates,
        current_streak=current_streak(dates, today),
        best_streak=best_streak(dates),
    )


def get_daily_goal(db: Session, user: User, day: date) -> DailyGoalOut:
    activity = db.get(DailyActivity, (user.id, day))
    return DailyGoalOut(
        goal_minutes=user.daily_goal_minutes,
        practised_seconds=activity.practised_seconds if activity else 0,
        completed_lessons=activity.completed_lessons if activity else 0,
    )


# --- Writes ---

# A day has 24 hours; more than that can only come from a buggy or dishonest
# client, and would inflate the daily goal.
MAX_SECONDS_PER_DAY = 24 * 60 * 60


def _add_activity(db: Session, user: User, day: date, *, seconds: int = 0, lessons: int = 0) -> None:
    """Creates the day's row or adds to it, in one atomic statement.

    Two requests arriving together can neither fail on a duplicate row nor
    overwrite each other's numbers.
    """
    stmt = upsert(db, DailyActivity).values(
        user_id=user.id,
        activity_date=day,
        practised_seconds=min(seconds, MAX_SECONDS_PER_DAY),
        completed_lessons=lessons,
    )
    seconds_total = DailyActivity.practised_seconds + stmt.excluded.practised_seconds
    db.execute(
        stmt.on_conflict_do_update(
            index_elements=[DailyActivity.user_id, DailyActivity.activity_date],
            set_={
                "practised_seconds": case(
                    (seconds_total > MAX_SECONDS_PER_DAY, MAX_SECONDS_PER_DAY),
                    else_=seconds_total,
                ),
                "completed_lessons": DailyActivity.completed_lessons
                + stmt.excluded.completed_lessons,
            },
        )
    )


def add_practice_time(db: Session, user: User, seconds: int, day: date) -> DailyGoalOut:
    _add_activity(db, user, day, seconds=seconds)
    db.commit()
    return get_daily_goal(db, user, day)


def complete_lesson(db: Session, user: User, lesson_id: str, day: date) -> LessonCompleteOut:
    if db.get(Lesson, lesson_id) is None:
        raise NotFoundError("Lesson not found")

    # Returns a row only for the request that actually created the completion,
    # so a double tap counts the lesson once towards the daily goal.
    created = db.execute(
        upsert(db, LessonCompletion)
        .values(user_id=user.id, lesson_id=lesson_id, completed_at=datetime.now(UTC))
        .on_conflict_do_nothing(index_elements=[LessonCompletion.user_id, LessonCompletion.lesson_id])
        .returning(LessonCompletion.lesson_id)
    ).first()
    if created is not None:
        _add_activity(db, user, day, lessons=1)
    db.commit()

    completed_at = db.scalar(
        select(LessonCompletion.completed_at).where(
            LessonCompletion.user_id == user.id, LessonCompletion.lesson_id == lesson_id
        )
    )
    return LessonCompleteOut(
        lesson_id=lesson_id,
        completed_at=completed_at,
        daily_goal=get_daily_goal(db, user, day),
    )
