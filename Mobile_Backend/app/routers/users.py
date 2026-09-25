import datetime as dt

from fastapi import APIRouter, Query, Response, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.user import AccountDeleteRequest, ProfileOut, ProfileUpdate
from app.services import auth_service, progress_service, user_service

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


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete the account and all its data",
    responses={403: {"description": "Incorrect password"}},
)
def delete_my_account(data: AccountDeleteRequest, user: CurrentUser, db: DbSession) -> Response:
    """Permanent. The password is asked again so a stolen token alone cannot delete the account."""
    auth_service.delete_account(db, user, data.password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
