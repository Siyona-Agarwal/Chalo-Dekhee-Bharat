"""
models.py — SQLAlchemy ORM models for Explorer Stories.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


class ExplorerStory(Base):
    """
    A travel story posted by a user for a specific Indian state.

    Fields
    ------
    id              Auto-incrementing primary key.
    state_id        Snake-case state identifier matching indiaMapData.js ids
                    e.g. "rajasthan", "kerala", "goa".
    clerk_user_id   Clerk `sub` claim from the JWT. Used for ownership checks.
    explorer_name   Display name shown on the story card.
    avatar_emoji    Single emoji chosen by the user as their avatar.
    text            Story body — capped at 280 characters (Twitter-style).
    photo_path      Server-relative path to the uploaded photo, e.g.
                    "/uploads/abc123.jpg". Null if no photo was attached.
    is_seeded       True for pre-loaded community stories (cannot be deleted
                    by users). False for real user submissions.
    created_at      UTC timestamp of submission.
    """
    __tablename__ = "explorer_stories"

    id            = Column(Integer, primary_key=True, index=True)
    state_id      = Column(String(64), nullable=False, index=True)
    clerk_user_id = Column(String(128), nullable=False)
    explorer_name = Column(String(100), nullable=False)
    avatar_emoji  = Column(String(8), nullable=False, default="🧭")
    text          = Column(String(280), nullable=False)
    photo_path    = Column(String(512), nullable=True)
    is_seeded     = Column(Boolean, default=False, nullable=False)
    created_at    = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
