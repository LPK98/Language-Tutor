import uuid

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel, Name, UtcDateTime


def _normalise_email(value: str) -> str:
    return value.strip().lower()


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: Name = "Student"

    _email = field_validator("email")(_normalise_email)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one letter and one number")
        return value


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    _email = field_validator("email")(_normalise_email)


class AccountOut(CamelModel):
    id: uuid.UUID
    email: str
    name: str
    created_at: UtcDateTime


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: AccountOut
