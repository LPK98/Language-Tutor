import uuid

from pydantic import Field, StrictInt, field_validator

from app.models.enums import Level
from app.schemas.common import CamelModel, Name
from app.schemas.progress import DailyGoalOut, StreakOut
from app.schemas.tutor import TutorOut

# The only language the app teaches today (AppHeader, Profile "Language" card).
SUPPORTED_LANGUAGES: dict[str, tuple[str, str]] = {
    "en-GB": ("English (UK)", "\U0001f1ec\U0001f1e7"),
}


class LanguageOut(CamelModel):
    code: str
    label: str
    flag: str


class ProfileOut(CamelModel):
    """Matches `Profile` in src/constants/profile.ts.

    `interest` is left out: the app only shows a "Choose an interest"
    placeholder and has no list of interests to choose from yet.
    """

    id: uuid.UUID
    email: str
    name: str
    avatar_url: str | None
    tutor: TutorOut | None
    language: LanguageOut
    level: Level
    daily_goal: DailyGoalOut
    streak: StreakOut


class ProfileUpdate(CamelModel):
    """Only the fields sent are changed."""

    name: Name | None = None
    level: Level | None = None
    language_code: str | None = None
    tutor_id: str | None = Field(default=None, max_length=50)
    daily_goal_minutes: StrictInt | None = Field(default=None, ge=1, le=240)

    @field_validator("language_code")
    @classmethod
    def supported_language(cls, value: str | None) -> str | None:
        if value is not None and value not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language. Choose one of: {', '.join(SUPPORTED_LANGUAGES)}")
        return value


class AccountDeleteRequest(CamelModel):
    password: str = Field(min_length=1, max_length=128)
