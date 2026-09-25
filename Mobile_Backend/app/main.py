"""FastAPI application: creates the app and plugs in every router.

Run from the Mobile_Backend folder:
    uvicorn app.main:app --reload
"""

import logging

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.core.database import engine
from app.core.errors import register_error_handlers
from app.routers import auth, lessons, practice, progress, tutors, users

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title="Language Tutor API",
    version="1.0.0",
    description=(
        "Backend for the Language Tutor mobile app.\n\n"
        "**Signing in here:** call `POST /api/auth/login`, copy `accessToken`, "
        "click **Authorize** and paste it."
    ),
)

# Browsers (Expo web) enforce CORS; the iOS/Android apps do not. Tokens travel
# in the Authorization header, not cookies, so credentials stay disabled.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)



@app.middleware("http")
async def security_headers(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    if settings.is_production:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000")
    return response


register_error_handlers(app)

for module in (auth, users, tutors, lessons, practice, progress):
    app.include_router(module.router)


@app.get("/", tags=["Health"], summary="Is the server running?")
def home() -> dict[str, str]:
    return {"message": "Language Tutor Backend is running!"}


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Is the database reachable?",
    responses={503: {"description": "The database is down"}},
)
def health(response: Response) -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logging.getLogger("app").exception("Health check: database unreachable")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "database": "down"}
    return {"status": "ok", "database": "ok"}
