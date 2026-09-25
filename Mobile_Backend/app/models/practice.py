"""Practice tab content.

Vocabulary, grammar and pronunciation are not separate tables: in the app they
are all "practice sets" opened from /practice/[id]. Vocab and Grammar are
`terms` sets (a glossary); Pronunciation is a `speech` set (listen and repeat).
"""

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Category, PracticeSetKind, db_enum


class PracticeCategory(Base):
    """A chip in the Practice screen's "Categories" grid."""

    __tablename__ = "practice_categories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    label: Mapped[str] = mapped_column(String(100))
    # Ionicons glyph name, e.g. "airplane-outline".
    icon: Mapped[str] = mapped_column(String(50))
    position: Mapped[int] = mapped_column(Integer, default=0)
    # Order of this category's topic rail on the Practice screen; NULL = no rail.
    section_position: Mapped[int | None] = mapped_column(Integer)

    topics: Mapped[list["PracticeTopic"]] = relationship(
        back_populates="category", order_by="PracticeTopic.position"
    )


class PracticeTopic(Base):
    """A card in a category's topic rail, e.g. "Airport check-in & security"."""

    __tablename__ = "practice_topics"
    __table_args__ = (CheckConstraint("minutes > 0", name="minutes_positive"),)

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    category_id: Mapped[str] = mapped_column(
        ForeignKey("practice_categories.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    minutes: Mapped[int] = mapped_column(Integer)
    image_key: Mapped[str | None] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(Integer, default=0)

    category: Mapped[PracticeCategory] = relationship(back_populates="topics")


class PracticeSet(Base):
    """A practice set: also the "Recommended for you" card that opens it."""

    __tablename__ = "practice_sets"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    kind: Mapped[PracticeSetKind] = mapped_column(db_enum(PracticeSetKind, "practice_set_kind"))
    title: Mapped[str] = mapped_column(String(100))
    category: Mapped[Category] = mapped_column(db_enum(Category, "practice_set_category"))
    emoji: Mapped[str | None] = mapped_column(String(16))
    image_key: Mapped[str | None] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(Integer, default=0)

    # `terms` sets only: e.g. "Practiced Vocabulary".
    unit_label: Mapped[str | None] = mapped_column(String(100))

    # `speech` sets only: the collection card above the word list.
    collection_title: Mapped[str | None] = mapped_column(String(100))
    collection_subtitle: Mapped[str | None] = mapped_column(String(200))
    collection_emoji: Mapped[str | None] = mapped_column(String(16))

    terms: Mapped[list["PracticeTerm"]] = relationship(
        back_populates="practice_set", order_by="PracticeTerm.position"
    )
    words: Mapped[list["PracticeWord"]] = relationship(
        back_populates="practice_set", order_by="PracticeWord.position"
    )


class PracticeTerm(Base):
    """A glossary entry in a `terms` set.

    `slug` is the id the app uses ("processed"); it is only unique within its
    set, so the table has its own integer primary key.
    """

    __tablename__ = "practice_terms"
    __table_args__ = (UniqueConstraint("set_id", "slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    set_id: Mapped[str] = mapped_column(ForeignKey("practice_sets.id", ondelete="CASCADE"))
    slug: Mapped[str] = mapped_column(String(100))
    term: Mapped[str] = mapped_column(String(200))
    definition: Mapped[str] = mapped_column(Text)
    example: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, default=0)

    practice_set: Mapped[PracticeSet] = relationship(back_populates="terms")


class PracticeWord(Base):
    """A word or phrase in a `speech` set."""

    __tablename__ = "practice_words"
    __table_args__ = (UniqueConstraint("set_id", "slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    set_id: Mapped[str] = mapped_column(ForeignKey("practice_sets.id", ondelete="CASCADE"))
    slug: Mapped[str] = mapped_column(String(100))
    word: Mapped[str] = mapped_column(String(200))
    position: Mapped[int] = mapped_column(Integer, default=0)

    practice_set: Mapped[PracticeSet] = relationship(back_populates="words")
