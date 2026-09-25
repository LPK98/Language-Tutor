from fastapi import APIRouter, Path

from app.core.deps import DbSession, OptionalUser
from app.models import Lesson
from app.schemas.lesson import LearningPathOut, LessonOut
from app.services import lesson_service

router = APIRouter(prefix="/api", tags=["Lessons"])


@router.get("/lessons/featured", response_model=list[LessonOut], summary="Home carousel lessons")
def featured_lessons(db: DbSession) -> list[Lesson]:
    return lesson_service.featured_lessons(db)


@router.get(
    "/lessons/{lesson_id}",
    response_model=LessonOut,
    summary="One lesson",
    responses={404: {"description": "Lesson not found"}},
)
def get_lesson(db: DbSession, lesson_id: str = Path(max_length=100)) -> Lesson:
    return lesson_service.get_lesson(db, lesson_id)


@router.get(
    "/learning-paths",
    response_model=list[LearningPathOut],
    summary="Lessons screen path",
)
def learning_paths(db: DbSession, user: OptionalUser) -> list[LearningPathOut]:
    """Beginner, Intermediate and Expert levels with their lessons in order.

    Works without signing in. With a token, `completed` reflects the user's progress.
    """
    return lesson_service.learning_paths(db, user)
