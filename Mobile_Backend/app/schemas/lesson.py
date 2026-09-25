from pydantic import computed_field

from app.models.enums import CATEGORY_LABELS, Category
from app.schemas.common import CamelModel


class LessonOut(CamelModel):
    """Matches `Lesson` in src/constants/lessons.ts (Home carousel).

    `image` becomes `imageKey`: the API cannot send a `require(...)`, so it
    names which bundled image to use and the app maps the name to the file.
    """

    id: str
    title: str
    category: Category
    description: str | None
    image_key: str | None

    @computed_field
    @property
    def category_label(self) -> str:
        return CATEGORY_LABELS[self.category]


class PathLessonOut(CamelModel):
    """Matches `PathNode` in src/constants/learningPath.ts.

    `color` is not sent: the app cycles its pastel palette by position.
    """

    id: str
    title: str
    emoji: str | None
    image_key: str | None
    completed: bool = False


class LearningPathOut(CamelModel):
    """One level of the path. Rows and connectors are layout, so the app still
    builds them from `lessons` (see buildLevel in learningPath.ts)."""

    id: str
    level: str
    lessons: list[PathLessonOut]
