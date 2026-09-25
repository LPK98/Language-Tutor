from typing import Annotated, Literal

from pydantic import Field

from app.models.enums import Category, TermStatus
from app.schemas.common import CamelModel


class RecommendedItemOut(CamelModel):
    """Matches `RecommendedItem` in src/constants/practice.ts."""

    id: str
    title: str
    category: Category
    emoji: str | None
    image_key: str | None


class PracticeCategoryOut(CamelModel):
    """Matches `PracticeCategory`; `icon` is an Ionicons glyph name."""

    id: str
    label: str
    icon: str


class PracticeTopicOut(CamelModel):
    id: str
    title: str
    minutes: int
    image_key: str | None


class PracticeSectionOut(CamelModel):
    """Matches `PracticeSection`: a titled rail of topic cards."""

    id: str
    title: str
    topics: list[PracticeTopicOut]


class TermOut(CamelModel):
    """Matches `Term` in src/constants/vocabulary.ts.

    `status` is omitted (not sent as null) when unclassified: the app's
    `practisedCount` treats any value other than `undefined` as practised.
    """

    id: str
    term: str
    definition: str
    example: str
    status: TermStatus | None = Field(default=None, exclude_if=lambda value: value is None)


class TermsSetOut(CamelModel):
    kind: Literal["terms"] = "terms"
    id: str
    title: str
    unit_label: str
    terms: list[TermOut]


class SpeechWordOut(CamelModel):
    id: str
    word: str


class SpeechCollectionOut(CamelModel):
    title: str
    subtitle: str
    emoji: str | None


class SpeechSetOut(CamelModel):
    kind: Literal["speech"] = "speech"
    id: str
    title: str
    collection: SpeechCollectionOut
    words: list[SpeechWordOut]


# Matches `PracticeSet = TermsSet | SpeechSet`; `kind` tells them apart.
PracticeSetOut = Annotated[TermsSetOut | SpeechSetOut, Field(discriminator="kind")]


class TermStatusUpdate(CamelModel):
    status: TermStatus | None = Field(description="null clears the classification.")


class TermStatusOut(CamelModel):
    set_id: str
    term_id: str
    status: TermStatus | None
