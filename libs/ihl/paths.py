"""Repo-root resolution for libs moved under libs/ihl/<domain>/."""

from __future__ import annotations

from pathlib import Path

# libs/ihl/paths.py -> parents[0]=ihl, [1]=libs, [2]=it-hercules-laboratory repo root
REPO_ROOT = Path(__file__).resolve().parents[2]
