"""Errors raised by services, and the handlers that turn every error into the
same JSON shape: {"detail": "..."}.

Services raise these instead of HTTPException so business logic does not
depend on the web layer.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("app")


class AppError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class TooManyRequestsError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS

    def __init__(self, detail: str, retry_after: int):
        super().__init__(detail)
        self.retry_after = retry_after


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        headers = None
        if isinstance(exc, TooManyRequestsError):
            headers = {"Retry-After": str(exc.retry_after)}
        return JSONResponse(
            status_code=exc.status_code, content={"detail": exc.detail}, headers=headers
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        # Full details go to the server log only; the client never sees
        # stack traces or database messages.
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
