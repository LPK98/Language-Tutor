from app.schemas.common import CamelModel


class TutorOut(CamelModel):
    """Matches `Tutor` in src/constants/lessons.ts (`avatar` -> `avatarUrl`)."""

    id: str
    name: str
    avatar_url: str | None
