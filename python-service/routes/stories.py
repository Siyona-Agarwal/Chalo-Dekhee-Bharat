"""
routes/stories.py — CRUD endpoints for ExplorerStory.

GET  /api/stories/{state_id}   — public, returns seeded + real stories
POST /api/stories               — auth required, creates a story (multipart)
DELETE /api/stories/{story_id} — auth required, only owner can delete
"""
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models import ExplorerStory
from auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_PHOTO_SIZE_MB = 5


def _story_to_dict(story: ExplorerStory) -> dict:
    """Serialise an ExplorerStory ORM object to a plain dict."""
    return {
        "id": story.id,
        "stateId": story.state_id,
        "clerkUserId": story.clerk_user_id,
        "explorerName": story.explorer_name,
        "avatarEmoji": story.avatar_emoji,
        "text": story.text,
        "photoUrl": story.photo_path,   # already a public URL or None
        "isSeeded": story.is_seeded,
        "createdAt": story.created_at.isoformat() if story.created_at else None,
    }


# ── GET /api/stories/{state_id} ──────────────────────────────────────────────
@router.get("/stories/{state_id}")
def get_stories(state_id: str, db: Session = Depends(get_db)):
    """Return all stories for a given state, newest first."""
    stories = (
        db.query(ExplorerStory)
        .filter(ExplorerStory.state_id == state_id.lower())
        .order_by(ExplorerStory.created_at.desc())
        .all()
    )
    return [_story_to_dict(s) for s in stories]


# ── POST /api/stories ────────────────────────────────────────────────────────
@router.post("/stories", status_code=201)
async def create_story(
    stateId: str = Form(...),
    explorerName: str = Form(...),
    avatarEmoji: str = Form("🧭"),
    text: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Create a new explorer story. Accepts multipart/form-data.
    Photo upload is optional — if provided it must be an image ≤ 5 MB.
    """
    # ── Validation ───────────────────────────────────────────────────────────
    state_id = stateId.strip().lower()
    explorer_name = explorerName.strip()[:100]
    avatar = avatarEmoji.strip()[:8] or "🧭"
    story_text = text.strip()

    if not state_id:
        raise HTTPException(status_code=422, detail="stateId is required.")
    if not explorer_name:
        raise HTTPException(status_code=422, detail="explorerName is required.")
    if not story_text:
        raise HTTPException(status_code=422, detail="text is required.")
    if len(story_text) > 280:
        raise HTTPException(status_code=422, detail="text must be ≤ 280 characters.")

    # ── Photo handling ───────────────────────────────────────────────────────
    photo_path: Optional[str] = None
    if photo and photo.filename:
        content_type = photo.content_type or ""
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image type '{content_type}'. Use JPEG, PNG, WebP, or GIF.",
            )

        # Read photo into memory to check size
        photo_bytes = await photo.read()
        if len(photo_bytes) > MAX_PHOTO_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"Photo must be ≤ {MAX_PHOTO_SIZE_MB} MB.",
            )

        ext = photo.filename.rsplit(".", 1)[-1].lower() if "." in photo.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(UPLOAD_DIR, filename)

        with open(save_path, "wb") as f:
            f.write(photo_bytes)

        # Public URL served by FastAPI static files mount at /uploads
        photo_path = f"/uploads/{filename}"

    # ── Persist ──────────────────────────────────────────────────────────────
    story = ExplorerStory(
        state_id=state_id,
        clerk_user_id=current_user_id,
        explorer_name=explorer_name,
        avatar_emoji=avatar,
        text=story_text,
        photo_path=photo_path,
        is_seeded=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(story)
    db.commit()
    db.refresh(story)

    logger.info("Story %d created for state '%s' by user '%s'", story.id, state_id, current_user_id)
    return _story_to_dict(story)


# ── DELETE /api/stories/{story_id} ──────────────────────────────────────────
@router.delete("/stories/{story_id}", status_code=204)
def delete_story(
    story_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Delete a story. Only the owner can delete; seeded stories are protected."""
    story = db.query(ExplorerStory).filter(ExplorerStory.id == story_id).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found.")
    if story.is_seeded:
        raise HTTPException(status_code=403, detail="Cannot delete a community story.")
    if story.clerk_user_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own stories.")

    # Remove photo file if present
    if story.photo_path:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(story.photo_path))
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except OSError as exc:
                logger.warning("Could not remove photo file %s: %s", file_path, exc)

    db.delete(story)
    db.commit()
    return JSONResponse(status_code=204, content=None)


# ── GET /api/stories/user/{clerk_user_id} ───────────────────────────────────
@router.get("/stories/user/{clerk_user_id}")
def get_user_stories(
    clerk_user_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Return all stories posted by a specific Clerk user.
    Users can only fetch their own stories.
    """
    # If Clerk JWKS is not configured (dev mode), bypass ownership check
    is_dev = current_user_id == "dev-user-local"
    if current_user_id != clerk_user_id and not is_dev:
        raise HTTPException(status_code=403, detail="Access denied.")

    target_user_id = current_user_id if is_dev else clerk_user_id

    stories = (
        db.query(ExplorerStory)
        .filter(
            ExplorerStory.clerk_user_id == target_user_id,
            ExplorerStory.is_seeded == False,  # noqa: E712
        )
        .order_by(ExplorerStory.created_at.desc())
        .all()
    )
    return [_story_to_dict(s) for s in stories]
