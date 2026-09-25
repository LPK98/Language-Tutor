"""Daily goal, streak and lesson completion logic."""

from datetime import UTC, date, datetime, timedelta

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

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


def _activity_row(db: Session, user: User, day: date) -> DailyActivity:
    activity = db.get(DailyActivity, (user.id, day))
    if activity is None:
        activity = DailyActivity(
            user_id=user.id, activity_date=day, practised_seconds=0, completed_lessons=0
        )
        db.add(activity)
        db.flush()
    return activity


def add_practice_time(db: Session, user: User, seconds: int, day: date) -> DailyGoalOut:
    activity = _activity_row(db, user, day)
    # Adds in SQL (practised_seconds = practised_seconds + n), so two requests
    # arriving together cannot overwrite each other.
    activity.practised_seconds = DailyActivity.practised_seconds + seconds
    db.commit()
    return get_daily_goal(db, user, day)


def complete_lesson(db: Session, user: User, lesson_id: str, day: date) -> LessonCompleteOut:
    if db.get(Lesson, lesson_id) is None:
        raise NotFoundError("Lesson not found")

    completion = db.get(LessonCompletion, (user.id, lesson_id))
    if completion is None:
        completion = LessonCompletion(
            user_id=user.id, lesson_id=lesson_id, completed_at=datetime.now(UTC)
        )
        db.add(completion)
        activity = _activity_row(db, user, day)
        activity.completed_lessons = DailyActivity.completed_lessons + 1
        db.commit()
    # Completing a lesson twice is harmless and is not counted twice.

    return LessonCompleteOut(
        lesson_id=lesson_id,
        completed_at=completion.completed_at,
        daily_goal=get_daily_goal(db, user, day),
    )
