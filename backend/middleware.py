from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import sys

from backend.exceptions import NotFoundException

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            status_code = 500
            detail = "Internal Server Error"

            if isinstance(e, NotFoundException):
                status_code = 404
                detail = str(e)
            elif isinstance(e, HTTPException):
                status_code = e.status_code
                detail = e.detail

            return JSONResponse(
                status_code=status_code,
                content={"status_code": str(status_code), "message": detail, "detail": str(e) if sys.gettrace() else None}
            )