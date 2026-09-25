import datetime as dt

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbSession
from app.schemas.user import ProfileOut, ProfileUpdate
from app.services import progress_service, user_service

router = APIRouter(prefix="/api/users", tags=["Profile"])

LocalDate = Query(
    default=None,
    description="The learner's local date (yyyy-mm-dd), used for today's goal and the streak.",
)


@router.get("/me", response_model=ProfileOut, summary="Profile screen data")
def get_my_profile(user: CurrentUser, db: DbSession, date: dt.date | None = LocalDate) -> ProfileOut:
    """Everything the Profile screen shows: tutor, language, level, today's goal and streak."""
    return user_service.build_profile(db, user, progress_service.resolve_day(date))


@router.patch("/me", response_model=ProfileOut, summary="Update profile settings")
def update_my_profile(
    data: ProfileUpdate, user: CurrentUser, db: DbSession, date: dt.date | None = LocalDate
) -> ProfileOut:
    """Partial update: send only the fields to change (e.g. `{"dailyGoalMinutes": 30}`)."""
    user = user_service.update_profile(db, user, data)
    return user_service.build_profile(db, user, progress_service.resolve_day(date))
