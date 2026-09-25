from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


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
