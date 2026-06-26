"""DuckDB query layer with column whitelist (no raw user SQL).

Design ref: ``ADR-Phase1-OSS選定表.md`` · ``capture/searchable_capture_set.schema.yaml``.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import duckdb

# Whitelist aligned with searchable_capture_set required + common filter columns.
ALLOWED_COLUMNS: frozenset[str] = frozenset(
    {
        "capture_id",
        "individual_id",
        "image_id",
        "snapshot_id",
        "species",
        "year",
        "capture_timestamp",
        "sex",
        "alive_status",
        "stage_name",
        "stage_subtype",
        "view_type",
        "qc_flag",
        "thumbnail_path",
        "image_path",
        "embedding_ref",
        "pipeline_name",
        "pipeline_version",
        "model_name",
        "model_version",
        "input_hash",
        "schema_version",
        "run_id",
        "created_at",
    }
)

ALLOWED_FILTERS: frozenset[str] = frozenset(
    {
        "species",
        "sex",
        "stage_name",
        "view_type",
        "individual_id",
        "capture_id",
    }
)


class QueryValidationError(ValueError):
    """Invalid column or filter for whitelist query."""


def _validate_columns(columns: list[str]) -> None:
    unknown = set(columns) - ALLOWED_COLUMNS
    if unknown:
        raise QueryValidationError(f"Columns not in whitelist: {sorted(unknown)}")


def _validate_filters(filters: dict[str, str]) -> None:
    unknown = set(filters) - ALLOWED_FILTERS
    if unknown:
        raise QueryValidationError(f"Filters not in whitelist: {sorted(unknown)}")


def search_captures(
    parquet_path: Path | str,
    *,
    columns: list[str] | None = None,
    filters: dict[str, str] | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Query parquet via DuckDB with whitelisted columns and equality filters."""
    path = Path(parquet_path).resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Parquet not found: {path}")

    selected = list(columns or sorted(ALLOWED_COLUMNS))
    _validate_columns(selected)
    _validate_filters(filters or {})

    if limit < 1 or limit > 10_000:
        raise QueryValidationError("limit must be between 1 and 10000")

    col_sql = ", ".join(f'"{c}"' for c in selected)
    sql = f"SELECT {col_sql} FROM read_parquet(?)"
    params: list[Any] = [str(path)]

    if filters:
        clauses = []
        for key, value in filters.items():
            clauses.append(f'"{key}" = ?')
            params.append(value)
        sql += " WHERE " + " AND ".join(clauses)

    sql += " LIMIT ?"
    params.append(limit)

    conn = duckdb.connect()
    try:
        rows = conn.execute(sql, params).fetchall()
        col_names = [desc[0] for desc in conn.description or []]
    finally:
        conn.close()

    return [dict(zip(col_names, row, strict=True)) for row in rows]


def count_captures(parquet_path: Path | str) -> int:
    """Return row count for a parquet file."""
    path = Path(parquet_path).resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Parquet not found: {path}")

    conn = duckdb.connect()
    try:
        (count,) = conn.execute(
            "SELECT COUNT(*) FROM read_parquet(?)", [str(path)]
        ).fetchone()
        return int(count)
    finally:
        conn.close()
