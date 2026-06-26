"""Home summary — upcoming/overdue observation schedule lines (#04 · #05)."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any


DEFAULT_POLICY_LINES = [
    "観測データは色補正なしで保存されます",
    "マーケット Stage 1 は当事者 2 人の連絡のみ",
    "貢献度は研究・観測・取引の内訳で表示",
]


def _parse_date(value: str) -> date | None:
    text = (value or "").strip()
    if not text:
        return None
    try:
        if "T" in text:
            return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


def _latest_schedule_by_individual(events: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    latest: dict[str, dict[str, Any]] = {}
    for row in events:
        ind = str(row.get("individual_id") or "").strip()
        if not ind:
            continue
        prev = latest.get(ind)
        prev_key = str(prev.get("schedule_event_id") or prev.get("set_by_capture_id") or "") if prev else ""
        row_key = str(row.get("schedule_event_id") or row.get("set_by_capture_id") or "")
        if prev is None or row_key >= prev_key:
            latest[ind] = row
    return latest


def _display_name_for_individual(store: Any, individual_id: str, owner_user_id: str = "u_demo") -> str:
    rows = store.list_events("naming/name_event", limit=5000)
    latest: dict[str, Any] | None = None
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        if row.get("individual_id") != individual_id:
            continue
        if latest is None or str(row.get("created_at") or "") >= str(latest.get("created_at") or ""):
            latest = row
    if latest and latest.get("new_name"):
        return str(latest["new_name"])
    return individual_id


def build_schedule_today_lines(store: Any, *, owner_user_id: str = "u_demo", max_lines: int = 3) -> list[str]:
    """Upcoming/overdue next observation lines for home summary."""
    events = store.list_events("observation/schedule", limit=5000)
    latest = _latest_schedule_by_individual(events)
    today = datetime.now(timezone.utc).date()
    overdue: list[tuple[date, str]] = []
    upcoming: list[tuple[date, str]] = []

    for individual_id, row in latest.items():
        scheduled = _parse_date(str(row.get("scheduled_at") or ""))
        if not scheduled:
            continue
        label = _display_name_for_individual(store, individual_id, owner_user_id)
        if scheduled < today:
            overdue.append((scheduled, f"次回観測が過ぎています: {label}（{scheduled.isoformat()}）"))
        elif scheduled == today:
            upcoming.append((scheduled, f"本日が次回観測日: {label}"))
        else:
            upcoming.append((scheduled, f"次回観測予定: {label}（{scheduled.isoformat()}）"))

    overdue.sort(key=lambda item: item[0])
    upcoming.sort(key=lambda item: item[0])
    lines = [text for _, text in overdue[:max_lines]]
    if len(lines) < max_lines:
        lines.extend(text for _, text in upcoming[: max_lines - len(lines)])
    return lines[:max_lines]


def merge_today_lines(schedule_lines: list[str], *, max_lines: int = 3) -> list[str]:
    """Pad with policy lines to always return exactly max_lines."""
    merged = list(schedule_lines[:max_lines])
    filler = DEFAULT_POLICY_LINES
    idx = 0
    while len(merged) < max_lines and idx < len(filler):
        if filler[idx] not in merged:
            merged.append(filler[idx])
        idx += 1
    while len(merged) < max_lines:
        merged.append(filler[-1])
    return merged[:max_lines]
