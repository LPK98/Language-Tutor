from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Category, db_enum


class LearningLevel(Base):
    """A section of the Lessons screen path: Beginner, Intermediate, Expert."""

    __tablename__ = "learning_levels"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(Integer, unique=True)

    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="level", order_by="Lesson.position"
    )


class Lesson(Base):
    """One lesson.

    Covers both places lessons appear in the app:
    - learning-path nodes (Lessons tab): `level_id` is set, `emoji` is shown;
    - the Home carousel: `is_featured` is true, `description` is shown.
    """

    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("level_id", "position"),)

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[Category] = mapped_column(
        db_enum(Category, "lesson_category"), default=Category.LESSON
    )
    emoji: Mapped[str | None] = mapped_column(String(16))
    # Name of an image bundled in the app, e.g. "grammar" -> Grammer.png.
    image_key: Mapped[str | None] = mapped_column(String(100))

    level_id: Mapped[str | None] = mapped_column(
        ForeignKey("learning_levels.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    level: Mapped[LearningLevel | None] = relationship(back_populates="lessons")
