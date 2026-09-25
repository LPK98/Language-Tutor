from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, ForbiddenError, TooManyRequestsError
from app.core.rate_limit import login_failures_by_email, login_failures_by_ip
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


def login(db: Session, email: str, password: str, client_ip: str) -> User | None:
    """`authenticate`, with brute-force protection.

    Raises TooManyRequestsError while the email or the IP address is blocked.
    The check runs before the (deliberately slow) password hash, so blocked
    attempts cost the server nothing.
    """
    email_key, ip_key = f"email:{email}", f"ip:{client_ip}"
    wait = max(
        login_failures_by_email.retry_after(email_key),
        login_failures_by_ip.retry_after(ip_key),
    )
    if wait:
        raise TooManyRequestsError(
            "Too many failed sign-in attempts. Please try again later.", retry_after=wait
        )

    user = authenticate(db, email, password)
    if user is None:
        login_failures_by_email.record_failure(email_key)
        login_failures_by_ip.record_failure(ip_key)
        return None
    login_failures_by_email.reset(email_key)
    return user


def logout(db: Session, user: User) -> None:
    """Revokes every token the user holds, on every device."""
    user.token_version = User.token_version + 1  # in SQL, safe with parallel logouts
    db.commit()


def delete_account(db: Session, user: User, password: str) -> None:
    """Deletes the account and, through ON DELETE CASCADE, all its progress."""
    if not verify_password(password, user.hashed_password):
        raise ForbiddenError("Incorrect password")
    db.delete(user)
    db.commit()
