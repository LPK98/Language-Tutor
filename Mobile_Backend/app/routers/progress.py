import datetime as dt

from fastapi import APIRouter, Path, Query

from app.core.deps import CurrentUser, DbSession
from app.schemas.progress import (
    DailyGoalOut,
    LessonCompleteOut,
    LessonCompleteRequest,
    PracticeTimeRequest,
    StreakOut,
)
from app.services import progress_service

router = APIRouter(prefix="/api/progress", tags=["Progress"])

LocalDate = Query(default=None, description="The learner's local date (yyyy-mm-dd).")


@router.get("/daily-goal", response_model=DailyGoalOut, summary="Today's goal progress")
def daily_goal(user: CurrentUser, db: DbSession, date: dt.date | None = LocalDate) -> DailyGoalOut:
    return progress_service.get_daily_goal(db, user, progress_service.resolve_day(date))


@router.get("/streak", response_model=StreakOut, summary="Practised days and streak totals")
def streak(user: CurrentUser, db: DbSession, date: dt.date | None = LocalDate) -> StreakOut:
    return progress_service.get_streak(db, user, progress_service.resolve_day(date))


@router.post("/practice", response_model=DailyGoalOut, summary="Record practice time")
def record_practice(data: PracticeTimeRequest, user: CurrentUser, db: DbSession) -> DailyGoalOut:
    """Adds `seconds` to the day's practice time and returns the updated daily goal.

    Any practice on a day marks that day in the streak.
    """
    day = progress_service.resolve_day(data.date)
    return progress_service.add_practice_time(db, user, data.seconds, day)


@router.post(
    "/lessons/{lesson_id}/complete",
    response_model=LessonCompleteOut,
    summary="Mark a lesson completed",
    responses={404: {"description": "Lesson not found"}},
)
def complete_lesson(
    user: CurrentUser,
    db: DbSession,
    data: LessonCompleteRequest | None = None,
    lesson_id: str = Path(max_length=100),
) -> LessonCompleteOut:
    """Safe to call more than once: a lesson is only counted the first time."""
    day = progress_service.resolve_day(data.date if data else None)
    return progress_service.complete_lesson(db, user, lesson_id, day)
