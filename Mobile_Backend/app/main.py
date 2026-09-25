"""FastAPI application: creates the app and plugs in every router.

Run from the Mobile_Backend folder:
    uvicorn app.main:app --reload
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

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

register_error_handlers(app)

for module in (auth, users, tutors, lessons, practice, progress):
    app.include_router(module.router)


@app.get("/", tags=["Health"], summary="Is the server running?")
def home() -> dict[str, str]:
    return {"message": "Language Tutor Backend is running!"}


@app.get("/api/health", tags=["Health"], summary="Is the database reachable?")
def health() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}
