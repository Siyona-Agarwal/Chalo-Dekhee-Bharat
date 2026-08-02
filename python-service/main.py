"""
main.py — FastAPI application entry point for the Explorer Stories service.

Runs on port 3002 alongside the existing Node.js server (port 3001).
Startup sequence:
  1. Create database tables (idempotent via SQLAlchemy create_all).
  2. Seed community stories (skipped if already seeded).
  3. Register API routes.
  4. Mount /uploads static directory for serving uploaded photos.
"""
import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, SessionLocal, Base
from models import ExplorerStory  # noqa: F401 — needed so Base.metadata sees the model
from seeds import run_seeds
from routes.stories import router as stories_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and seed on startup."""
    logger.info("Creating database tables…")
    Base.metadata.create_all(bind=engine)

    logger.info("Running seeds…")
    db = SessionLocal()
    try:
        run_seeds(db)
    finally:
        db.close()

    logger.info("Explorer Stories service is ready.")
    yield
    # (cleanup on shutdown goes here if needed)


app = FastAPI(
    title="Chalo Dekhe Bharat — Explorer Stories API",
    version="1.0.0",
    description="Multi-user travel story backend powered by SQLAlchemy + FastAPI.",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(stories_router, prefix="/api")

# ── Static file serving for uploaded photos ───────────────────────────────────
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "explorer-stories"}
