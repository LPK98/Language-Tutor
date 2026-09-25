import uuid
from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel


def _normalise_email(value: str) -> str:
    return value.strip().lower()


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(default="Student", min_length=1, max_length=100)

    _email = field_validator("email")(_normalise_email)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one letter and one number")
        return value

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank")
        return value


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    _email = field_validator("email")(_normalise_email)


class AccountOut(CamelModel):
    id: uuid.UUID
    email: str
    name: str
    created_at: datetime


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: AccountOut
