from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, StringConstraints
from pydantic.alias_generators import to_camel


def _as_utc(value: datetime) -> datetime:
    # PostgreSQL returns timestamps in its own timezone (e.g. +05:30) and SQLite
    # without one; the API always answers in UTC ("...Z").
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


UtcDateTime = Annotated[datetime, AfterValidator(_as_utc)]


def _not_blank(value: str) -> str:
    if not value:
        raise ValueError("Name cannot be blank")
    return value


# Spaces are trimmed before the length is checked.
Name = Annotated[str, StringConstraints(strip_whitespace=True, max_length=100), AfterValidator(_not_blank)]


class CamelModel(BaseModel):
    """Base for every API schema.

    Python code uses snake_case (`goal_minutes`); JSON uses camelCase
    (`goalMinutes`), matching the TypeScript types in the app. Requests accept
    either spelling.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


class Message(CamelModel):
    message: str
