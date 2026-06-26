"""Deterministic transfer code from userId — salvage from 23-GMO §2.2."""

from __future__ import annotations

import hashlib

_BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def _base36_upper(n: int) -> str:
    if n == 0:
        return "0"
    out: list[str] = []
    while n:
        n, r = divmod(n, 36)
        out.append(_BASE36[r])
    return "".join(reversed(out))


def derive_transfer_code(user_id: str) -> str:
    """SHA-256(userId) → uint24 BE → Base36 upper → U-XXXX pattern."""
    digest = hashlib.sha256(user_id.encode("utf-8")).digest()
    n = int.from_bytes(digest[0:3], "big")
    body = _base36_upper(n)
    if len(body) < 4:
        body = body.zfill(4)
    if len(body) > 6:
        body = body[-6:]
    return f"U-{body}"
