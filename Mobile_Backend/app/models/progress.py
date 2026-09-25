"""Per-user learning progress. Every row belongs to one user and is deleted
with them (ON DELETE CASCADE)."""

import uuid
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Integer, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import TermStatus, db_enum


class LessonCompletion(Base):
    """A lesson the user finished; drives `completed` on learning-path nodes."""

    __tablename__ = "lesson_completions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    lesson_id: Mapped[str] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class TermStatusEntry(Base):
    """How the user classified a glossary term: Still Learning, Known or My List.

    No row means "not classified yet".
    """

    __tablename__ = "term_statuses"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    term_id: Mapped[int] = mapped_column(
        ForeignKey("practice_terms.id", ondelete="CASCADE"), primary_key=True
    )
    status: Mapped[TermStatus] = mapped_column(db_enum(TermStatus, "term_status"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class DailyActivity(Base):
    """What the user did on one calendar day (in their own timezone).

    Feeds the Daily Goal card (today's row) and the streak (every date that
    has a row with activity).
    """

    __tablename__ = "daily_activity"
    __table_args__ = (
        CheckConstraint("practised_seconds >= 0", name="practised_seconds_non_negative"),
        CheckConstraint("completed_lessons >= 0", name="completed_lessons_non_negative"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    activity_date: Mapped[date] = mapped_column(Date, primary_key=True)
    practised_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0)
