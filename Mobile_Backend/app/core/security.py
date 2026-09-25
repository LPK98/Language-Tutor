"""Password hashing and JWT access tokens."""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

# Argon2, the current recommended algorithm for storing passwords.
password_hash = PasswordHash.recommended()

# Verified against when an email is unknown, so a failed login takes the same
# time whether or not the account exists (hides which emails are registered).
_DUMMY_HASH = password_hash.hash("dummy-password-for-timing")


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str | None) -> bool:
    if hashed is None:
        password_hash.verify(password, _DUMMY_HASH)
        return False
    return password_hash.verify(password, hashed)


@dataclass(frozen=True)
class TokenClaims:
    user_id: uuid.UUID
    # Must equal users.token_version; logging out increases that number, which
    # revokes every token issued before it.
    token_version: int


def create_access_token(user_id: uuid.UUID, token_version: int) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "ver": token_version,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenClaims | None:
    """Returns the token's claims, or None if it is invalid or expired."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub", "ver"]},
        )
        version = payload["ver"]
        if type(version) is not int:
            return None
        return TokenClaims(user_id=uuid.UUID(payload["sub"]), token_version=version)
    except (jwt.InvalidTokenError, ValueError, TypeError, AttributeError):
        return None
