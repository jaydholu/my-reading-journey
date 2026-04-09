from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager

import logging
from colorama import Fore, init

from app.core.config import settings
from app.core.database import db
from app.api.routes import auth, books, data, users, wishlist


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(Fore.GREEN + "Starting My Reading Journey API...")
    await db.connect()
    logger.info(Fore.GREEN + "Application startup complete")
    
    yield
    
    # Shutdown
    logger.info(Fore.GREEN + "Shutting down...")
    await db.close()
    logger.info(Fore.GREEN + "Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Track, rate, and organize your reading journey",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    root_path="/api/v1"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]       # Necessary for file downloads
)


# Request size limit middleware
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    """Limit request body size to prevent large file attacks"""
    
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        
        if content_length:
            if int(content_length) > settings.MAX_UPLOAD_SIZE:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "detail": f"Request body too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
                    }
                )
    
    response = await call_next(request)
    return response


# Custom exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors - properly format without trying to serialize bytes"""
    errors = []
    
    for error in exc.errors():
        error_detail = {
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        }
        
        # Don't include 'input' field if it contains bytes or other non-serializable data
        if "input" in error:
            input_value = error["input"]
            # Skip bytes, file objects, or other complex types
            if not isinstance(input_value, (bytes, bytearray)):
                try:
                    import json
                    json.dumps(input_value)
                    error_detail["input"] = input_value
                except (TypeError, ValueError):
                    pass
        
        errors.append(error_detail)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Include routers
app.include_router(auth.router, prefix="/auth")
app.include_router(books.router, prefix="/books")
app.include_router(data.router, prefix="/data")
app.include_router(users.router, prefix="/users")
app.include_router(wishlist.router, prefix="/wishlist")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to My Reading Journey API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production"
    }
