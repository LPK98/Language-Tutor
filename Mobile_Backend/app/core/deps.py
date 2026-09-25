"""Reusable FastAPI dependencies for authentication.

- `CurrentUser`  : endpoint requires a valid token (401 otherwise).
- `OptionalUser` : endpoint works for guests too; a valid token only adds
                   personal data such as lesson completion, and an invalid or
                   expired one is ignored. The app has a guest mode
                   ("Sign in to keep your progress"), so content stays public.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False, description="Paste the accessToken from login.")

DbSession = Annotated[Session, Depends(get_db)]


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _user_from_token(db: Session, credentials: HTTPAuthorizationCredentials | None) -> User | None:
    if credentials is None:
        return None
    claims = decode_access_token(credentials.credentials)
    if claims is None:
        return None
    user = db.get(User, claims.user_id)
    if user is None or user.token_version != claims.token_version:
        return None
    return user


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User | None:
    # An expired or revoked token means "guest" here, not an error: the app may
    # still hold an old token, and public screens must keep loading.
    return _user_from_token(db, credentials)


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    if credentials is None:
        raise _unauthorized("Not authenticated")
    user = _user_from_token(db, credentials)
    if user is None:
        raise _unauthorized("Invalid or expired token")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]
