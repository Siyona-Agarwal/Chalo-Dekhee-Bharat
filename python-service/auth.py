"""
auth.py — Clerk JWT verification for FastAPI.

Fetches Clerk's public JWKS once (cached in memory) and validates every
incoming Bearer token. If CLERK_JWKS_URL is not set (dev mode), verification
is skipped and a placeholder user ID is returned so the API still works locally
without a Clerk account.
"""
import os
import time
import logging
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError

load_dotenv()

logger = logging.getLogger(__name__)

CLERK_JWKS_URL: Optional[str] = os.getenv("CLERK_JWKS_URL", "").strip() or None

# ── In-memory JWKS cache ─────────────────────────────────────────────────────
_jwks_cache: Optional[dict] = None
_jwks_fetched_at: float = 0.0
_JWKS_TTL_SECONDS = 3600  # refresh every hour


def _get_jwks() -> dict:
    """Fetch and cache Clerk's JWKS document."""
    global _jwks_cache, _jwks_fetched_at
    now = time.time()
    if _jwks_cache and (now - _jwks_fetched_at) < _JWKS_TTL_SECONDS:
        return _jwks_cache
    try:
        resp = requests.get(CLERK_JWKS_URL, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = now
        return _jwks_cache
    except Exception as exc:
        logger.error("Failed to fetch JWKS: %s", exc)
        raise HTTPException(status_code=503, detail="Auth service unavailable.")


# ── FastAPI security scheme ───────────────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)

DEV_USER_ID = "dev-user-local"  # placeholder used when Clerk is not configured


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> str:
    """
    FastAPI dependency.

    Returns the Clerk userId (sub claim) of the authenticated user.
    Raises HTTP 401 if the token is missing or invalid.

    In dev mode (CLERK_JWKS_URL not set) returns DEV_USER_ID so the API
    remains usable without a Clerk account.
    """
    if not CLERK_JWKS_URL:
        # Dev mode — skip verification
        return DEV_USER_ID

    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = credentials.credentials
    jwks = _get_jwks()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub.")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid token.")
