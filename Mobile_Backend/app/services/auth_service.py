from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import ConflictError
from app.core.security import hash_password, verify_password
from app.models import Tutor, User
from app.schemas.auth import RegisterRequest


def register_user(db: Session, data: RegisterRequest) -> User:
    if db.scalar(select(User.id).where(User.email == data.email)):
        raise ConflictError("An account with this email already exists")

    # New learners start with the first tutor (Emma), as the app shows today.
    default_tutor_id = db.scalar(select(Tutor.id).order_by(Tutor.position).limit(1))

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
        tutor_id=default_tutor_id,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Two sign-ups with the same email at the same moment.
        db.rollback()
        raise ConflictError("An account with this email already exists") from None
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email))
    if not verify_password(password, user.hashed_password if user else None):
        return None
    return user
