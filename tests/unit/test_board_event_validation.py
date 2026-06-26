"""Board event contract validation."""

from __future__ import annotations

import pytest

from libs.board_store import validate_board_event


def test_invalid_kind_raises() -> None:
    with pytest.raises(ValueError):
        validate_board_event({"kind": "invalid", "board_kind": "other"})
