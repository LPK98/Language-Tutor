from fastapi import APIRouter, Path

from app.core.deps import CurrentUser, DbSession, OptionalUser
from app.models import PracticeCategory, PracticeSet
from app.schemas.practice import (
    PracticeCategoryOut,
    PracticeSectionOut,
    PracticeSetOut,
    RecommendedItemOut,
    SpeechSetOut,
    TermsSetOut,
    TermStatusOut,
    TermStatusUpdate,
)
from app.services import practice_service

router = APIRouter(prefix="/api/practice", tags=["Practice"])

SetId = Path(max_length=50, description="Practice set id, e.g. `vocab`, `grammar`, `pronunciation`.")


@router.get(
    "/recommended",
    response_model=list[RecommendedItemOut],
    summary='"Recommended for you" cards',
)
def recommended(db: DbSession) -> list[PracticeSet]:
    """Each card's `id` opens `GET /api/practice/sets/{id}`."""
    return practice_service.recommended(db)


@router.get("/categories", response_model=list[PracticeCategoryOut], summary="Category chips")
def categories(db: DbSession) -> list[PracticeCategory]:
    return practice_service.categories(db)


@router.get("/sections", response_model=list[PracticeSectionOut], summary="Topic rails")
def sections(db: DbSession) -> list[PracticeSectionOut]:
    return practice_service.sections(db)


@router.get(
    "/sets/{set_id}",
    response_model=PracticeSetOut,
    summary="Practice set detail (/practice/[id] screen)",
    responses={404: {"description": "Practice set not found"}},
)
def get_practice_set(
    db: DbSession, user: OptionalUser, set_id: str = SetId
) -> TermsSetOut | SpeechSetOut:
    """`kind` is `terms` (Vocab, Grammar) or `speech` (Pronunciation).

    With a token, each term includes the user's `status`.
    """
    return practice_service.get_set(db, set_id, user)


@router.put(
    "/sets/{set_id}/terms/{term_id}/status",
    response_model=TermStatusOut,
    summary="Mark a term as Still Learning, Known or My List",
    responses={404: {"description": "Practice set or term not found"}},
)
def set_term_status(
    data: TermStatusUpdate,
    user: CurrentUser,
    db: DbSession,
    set_id: str = SetId,
    term_id: str = Path(max_length=100),
) -> TermStatusOut:
    """Send `{"status": null}` to clear it."""
    practice_service.set_term_status(db, user, set_id, term_id, data.status)
    return TermStatusOut(set_id=set_id, term_id=term_id, status=data.status)
