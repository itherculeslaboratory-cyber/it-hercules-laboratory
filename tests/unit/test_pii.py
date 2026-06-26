"""PII minimization helpers."""

from __future__ import annotations

import pytest

from libs.pii import assert_no_plaintext_pii, redact_pii_text


def test_redact_email() -> None:
    out = redact_pii_text("連絡は user@example.com へ")
    assert "user@example.com" not in out
    assert "[redacted-email]" in out


def test_forbid_plaintext_pii_keys() -> None:
    with pytest.raises(ValueError):
        assert_no_plaintext_pii({"email": "a@b.com"})
