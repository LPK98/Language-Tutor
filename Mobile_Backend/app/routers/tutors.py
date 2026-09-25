from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import Tutor
from app.schemas.tutor import TutorOut

router = APIRouter(prefix="/api/tutors", tags=["Tutors"])


@router.get("", response_model=list[TutorOut], summary="Available tutors")
def list_tutors(db: DbSession) -> list[Tutor]:
    """The tutor shown on Home, Lessons and Profile (currently Emma)."""
    return list(db.scalars(select(Tutor).order_by(Tutor.position)))
