"""Importing every model here registers it on Base.metadata, which Alembic
reads to generate migrations."""

from app.models.lesson import LearningLevel, Lesson
from app.models.practice import PracticeCategory, PracticeSet, PracticeTerm, PracticeTopic, PracticeWord
from app.models.progress import DailyActivity, LessonCompletion, TermStatusEntry
from app.models.tutor import Tutor
from app.models.user import User

__all__ = [
    "DailyActivity",
    "LearningLevel",
    "Lesson",
    "LessonCompletion",
    "PracticeCategory",
    "PracticeSet",
    "PracticeTerm",
    "PracticeTopic",
    "PracticeWord",
    "TermStatusEntry",
    "Tutor",
    "User",
]
