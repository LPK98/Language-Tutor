import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Level, db_enum
from app.models.tutor import Tutor


class User(Base):
    """An account plus its learning profile (Profile screen).

    Profile fields live on this table rather than a separate `user_profiles`
    table: every user has exactly one profile, so a split would only add a join.
    """

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "daily_goal_minutes BETWEEN 1 AND 240", name="daily_goal_minutes_range"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    name: Mapped[str] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    level: Mapped[Level] = mapped_column(db_enum(Level, "level"), default=Level.A1)
    language_code: Mapped[str] = mapped_column(String(10), default="en-GB")
    daily_goal_minutes: Mapped[int] = mapped_column(Integer, default=60)
    tutor_id: Mapped[str | None] = mapped_column(
        ForeignKey("tutors.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tutor: Mapped[Tutor | None] = relationship(lazy="joined")
