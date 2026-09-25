from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import NotFoundError
from app.models import LearningLevel, Lesson, LessonCompletion, User
from app.schemas.lesson import LearningPathOut, PathLessonOut


def featured_lessons(db: Session) -> list[Lesson]:
    return list(
        db.scalars(select(Lesson).where(Lesson.is_featured).order_by(Lesson.position))
    )


def get_lesson(db: Session, lesson_id: str) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise NotFoundError("Lesson not found")
    return lesson


def learning_paths(db: Session, user: User | None) -> list[LearningPathOut]:
    levels = db.scalars(
        select(LearningLevel)
        .options(selectinload(LearningLevel.lessons))
        .order_by(LearningLevel.position)
    )

    completed: set[str] = set()
    if user is not None:
        completed = set(
            db.scalars(
                select(LessonCompletion.lesson_id).where(LessonCompletion.user_id == user.id)
            )
        )

    return [
        LearningPathOut(
            id=level.id,
            level=level.title,
            lessons=[
                PathLessonOut(
                    id=lesson.id,
                    title=lesson.title,
                    emoji=lesson.emoji,
                    image_key=lesson.image_key,
                    completed=lesson.id in completed,
                )
                for lesson in level.lessons
            ],
        )
        for level in levels
    ]
