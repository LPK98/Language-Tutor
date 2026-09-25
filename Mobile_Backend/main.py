"""Kept so the old command `uvicorn main:app --reload` still works.

The application now lives in app/main.py; prefer `uvicorn app.main:app --reload`.
"""

from app.main import app  # noqa: F401
