"""Unit tests for libs/query.py."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.query import QueryValidationError, count_captures, search_captures


def test_search_returns_rows(searchable_parquet: Path) -> None:
    rows = search_captures(
        searchable_parquet,
        columns=["capture_id", "species", "sex"],
        limit=10,
    )
    assert len(rows) == 2
    assert rows[0]["capture_id"] == "cap_fixture_01"
    assert rows[0]["species"] == "ヘラクレスオオカブト"


def test_filter_by_species(searchable_parquet: Path) -> None:
    rows = search_captures(
        searchable_parquet,
        columns=["capture_id", "species"],
        filters={"species": "カブトムシ"},
        limit=10,
    )
    assert len(rows) == 1
    assert rows[0]["capture_id"] == "cap_fixture_02"


def test_rejects_unknown_column(searchable_parquet: Path) -> None:
    with pytest.raises(QueryValidationError, match="whitelist"):
        search_captures(searchable_parquet, columns=["not_a_column"])


def test_rejects_unknown_filter(searchable_parquet: Path) -> None:
    with pytest.raises(QueryValidationError, match="whitelist"):
        search_captures(searchable_parquet, filters={"qc_flag": "ok"})


def test_count_captures(searchable_parquet: Path) -> None:
    assert count_captures(searchable_parquet) == 2
