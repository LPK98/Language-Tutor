from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import BadRequestError, NotFoundError
from app.models import PracticeCategory, PracticeSet, PracticeTerm, TermStatusEntry, User
from app.models.enums import PracticeSetKind, TermStatus
from app.schemas.practice import (
    PracticeSectionOut,
    PracticeTopicOut,
    SpeechCollectionOut,
    SpeechSetOut,
    SpeechWordOut,
    TermOut,
    TermsSetOut,
)


def recommended(db: Session) -> list[PracticeSet]:
    return list(db.scalars(select(PracticeSet).order_by(PracticeSet.position)))


def categories(db: Session) -> list[PracticeCategory]:
    return list(db.scalars(select(PracticeCategory).order_by(PracticeCategory.position)))


def sections(db: Session) -> list[PracticeSectionOut]:
    rows = db.scalars(
        select(PracticeCategory)
        .where(PracticeCategory.section_position.is_not(None))
        .options(selectinload(PracticeCategory.topics))
        .order_by(PracticeCategory.section_position)
    )
    return [
        PracticeSectionOut(
            id=category.id,
            title=category.label,
            topics=[PracticeTopicOut.model_validate(topic) for topic in category.topics],
        )
        for category in rows
    ]


def get_set(db: Session, set_id: str, user: User | None) -> TermsSetOut | SpeechSetOut:
    practice_set = db.scalar(
        select(PracticeSet)
        .where(PracticeSet.id == set_id)
        .options(selectinload(PracticeSet.terms), selectinload(PracticeSet.words))
    )
    if practice_set is None:
        raise NotFoundError("Practice set not found")

    if practice_set.kind == PracticeSetKind.SPEECH:
        return SpeechSetOut(
            id=practice_set.id,
            title=practice_set.title,
            collection=SpeechCollectionOut(
                title=practice_set.collection_title or "",
                subtitle=practice_set.collection_subtitle or "",
                emoji=practice_set.collection_emoji,
            ),
            words=[SpeechWordOut(id=word.slug, word=word.word) for word in practice_set.words],
        )

    statuses: dict[int, TermStatus] = {}
    if user is not None:
        rows = db.execute(
            select(TermStatusEntry.term_id, TermStatusEntry.status)
            .join(PracticeTerm, PracticeTerm.id == TermStatusEntry.term_id)
            .where(TermStatusEntry.user_id == user.id, PracticeTerm.set_id == set_id)
        )
        statuses = {term_id: status for term_id, status in rows}

    return TermsSetOut(
        id=practice_set.id,
        title=practice_set.title,
        unit_label=practice_set.unit_label or "",
        terms=[
            TermOut(
                id=term.slug,
                term=term.term,
                definition=term.definition,
                example=term.example,
                status=statuses.get(term.id),
            )
            for term in practice_set.terms
        ],
    )


def set_term_status(
    db: Session, user: User, set_id: str, term_slug: str, status: TermStatus | None
) -> None:
    practice_set = db.get(PracticeSet, set_id)
    if practice_set is None:
        raise NotFoundError("Practice set not found")
    if practice_set.kind != PracticeSetKind.TERMS:
        raise BadRequestError("Only vocabulary and grammar sets have term statuses")

    term = db.scalar(
        select(PracticeTerm).where(PracticeTerm.set_id == set_id, PracticeTerm.slug == term_slug)
    )
    if term is None:
        raise NotFoundError("Term not found")

    entry = db.get(TermStatusEntry, (user.id, term.id))
    if status is None:
        if entry is not None:
            db.delete(entry)
    elif entry is None:
        db.add(TermStatusEntry(user_id=user.id, term_id=term.id, status=status))
    else:
        entry.status = status
    db.commit()
