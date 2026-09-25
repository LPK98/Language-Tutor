from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.schemas.auth import AccountOut, LoginRequest, RegisterRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an account",
    responses={409: {"description": "Email already registered"}},
)
def register(data: RegisterRequest, db: DbSession) -> TokenResponse:
    """Creates the account and signs the user in straight away."""
    user = auth_service.register_user(db, data)
    return TokenResponse(
        access_token=create_access_token(user.id), user=AccountOut.model_validate(user)
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Sign in with email and password",
    responses={401: {"description": "Incorrect email or password"}},
)
def login(data: LoginRequest, db: DbSession) -> TokenResponse:
    user = auth_service.authenticate(db, data.email, data.password)
    if user is None:
        # Same message for unknown email and wrong password, on purpose.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=create_access_token(user.id), user=AccountOut.model_validate(user)
    )


@router.get("/me", response_model=AccountOut, summary="The signed-in account")
def me(user: CurrentUser) -> AccountOut:
    return AccountOut.model_validate(user)
