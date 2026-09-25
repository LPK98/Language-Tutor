from datetime import date

from sqlalchemy.orm import Session

from app.core.errors import BadRequestError
from app.models import Tutor, User
from app.schemas.tutor import TutorOut
from app.schemas.user import SUPPORTED_LANGUAGES, LanguageOut, ProfileOut, ProfileUpdate
from app.services import progress_service


def build_profile(db: Session, user: User, today: date) -> ProfileOut:
    label, flag = SUPPORTED_LANGUAGES.get(user.language_code, (user.language_code, ""))
    return ProfileOut(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        tutor=TutorOut.model_validate(user.tutor) if user.tutor else None,
        language=LanguageOut(code=user.language_code, label=label, flag=flag),
        level=user.level,
        daily_goal=progress_service.get_daily_goal(db, user, today),
        streak=progress_service.get_streak(db, user, today),
    )


def update_profile(db: Session, user: User, data: ProfileUpdate) -> User:
    # by_alias=False: we need Python names (daily_goal_minutes), not JSON names.
    changes = data.model_dump(exclude_unset=True, by_alias=False)

    # Fields that cannot be empty: sending null for them means "no change".
    for field in ("name", "level", "language_code", "daily_goal_minutes"):
        if changes.get(field, ...) is None:
            changes.pop(field)

    if changes.get("tutor_id") is not None and db.get(Tutor, changes["tutor_id"]) is None:
        raise BadRequestError("Unknown tutor")

    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
