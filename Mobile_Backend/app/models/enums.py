"""Fixed option lists shared by the models and the API schemas.

Values match the string unions in the React Native code, e.g.
`CategoryKey` in src/constants/theme.ts and `TermStatus` in
src/constants/vocabulary.ts.
"""

from enum import StrEnum

from sqlalchemy import Enum


class Category(StrEnum):
    GRAMMAR = "grammar"
    LESSON = "lesson"
    PRONUNCIATION = "pronunciation"
    VOCABULARY = "vocabulary"


CATEGORY_LABELS: dict[Category, str] = {
    Category.GRAMMAR: "Grammar",
    Category.LESSON: "Lesson",
    Category.PRONUNCIATION: "Pronunciation",
    Category.VOCABULARY: "Vocabulary",
}


class PracticeSetKind(StrEnum):
    TERMS = "terms"
    SPEECH = "speech"


class TermStatus(StrEnum):
    STILL_LEARNING = "still-learning"
    KNOWN = "known"
    MY_LIST = "my-list"


class Level(StrEnum):
    """CEFR levels, shown on the Profile screen's Level card."""

    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


def db_enum(enum_cls: type[StrEnum], name: str) -> Enum:
    """Stores an enum as VARCHAR plus a CHECK constraint.

    Easier to evolve than a native PostgreSQL ENUM type: adding an option is
    an ordinary migration instead of an ALTER TYPE.
    """
    return Enum(
        enum_cls,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=32,
        values_callable=lambda cls: [member.value for member in cls],
    )
