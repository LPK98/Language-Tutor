import datetime as dt

from pydantic import Field

from app.schemas.common import CamelModel


class DailyGoalOut(CamelModel):
    """Matches `DailyGoal` in src/constants/profile.ts."""

    goal_minutes: int
    practised_seconds: int
    completed_lessons: int


class StreakOut(CamelModel):
    """Matches `Streak` in src/constants/profile.ts, plus the two derived totals."""

    practised_dates: list[dt.date]
    current_streak: int
    best_streak: int


class PracticeTimeRequest(CamelModel):
    seconds: int = Field(gt=0, le=4 * 60 * 60, description="Practice time to add, in seconds.")
    date: dt.date | None = Field(
        default=None,
        description="The learner's local date (yyyy-mm-dd). Defaults to today in UTC.",
    )


class LessonCompleteRequest(CamelModel):
    date: dt.date | None = Field(
        default=None,
        description="The learner's local date (yyyy-mm-dd). Defaults to today in UTC.",
    )


class LessonCompleteOut(CamelModel):
    lesson_id: str
    completed_at: dt.datetime
    daily_goal: DailyGoalOut
