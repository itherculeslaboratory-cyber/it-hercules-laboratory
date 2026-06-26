"""Me / preferences routes — #12 settings."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from libs.event_store import default_event_root
from libs.preferences_store import PreferencesStore

router = APIRouter(prefix="/api/v1/me", tags=["me"])


def _prefs() -> PreferencesStore:
    return PreferencesStore(root=default_event_root())


class PreferencesPatchBody(BaseModel):
    language: str | None = None
    notifications: bool | None = None
    default_device_id: str | None = None
    counterparty_pii_mode: str | None = None
    actor_id: str = "u_demo"


@router.get("/preferences")
def get_preferences(actor_id: str = "u_demo") -> dict[str, Any]:
    return _prefs().get(actor_id=actor_id)


@router.patch("/preferences")
def patch_preferences(body: PreferencesPatchBody) -> dict[str, Any]:
    patch = body.model_dump(exclude={"actor_id"}, exclude_none=True)
    return _prefs().patch(actor_id=body.actor_id, patch=patch)


@router.get("/settings")
def get_settings(actor_id: str = "u_demo") -> dict[str, Any]:
    return _prefs().get(actor_id=actor_id)
