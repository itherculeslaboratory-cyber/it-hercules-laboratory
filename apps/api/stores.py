"""Shared API store singletons — wired to append-only event layer."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from libs.board_store import BoardStore
from libs.domain_catalog import LineageCatalog, MatchCatalog, VotePollCatalog
from libs.economy_logic import EconomyStore
from libs.event_store import EventStore, default_event_root
from libs.market_state import MarketStateStore
from libs.pii import TradePiiSession
from libs.theme_pack import ThemePackStore


@lru_cache(maxsize=1)
def get_event_store() -> EventStore:
    root = default_event_root()
    if os.environ.get("IHL_TEST_ISOLATE"):
        root = Path(os.environ["IHL_TEST_ISOLATE"]) / "truth"
    return EventStore(root=root)


@lru_cache(maxsize=1)
def get_market_store() -> MarketStateStore:
    return MarketStateStore(events=get_event_store())


@lru_cache(maxsize=1)
def get_board_store() -> BoardStore:
    store = BoardStore(events=get_event_store())
    return store


@lru_cache(maxsize=1)
def get_economy_store() -> EconomyStore:
    return EconomyStore(events=get_event_store())


@lru_cache(maxsize=1)
def get_pii_session() -> TradePiiSession:
    return TradePiiSession(events=get_event_store())


@lru_cache(maxsize=1)
def get_theme_store() -> ThemePackStore:
    return ThemePackStore()


@lru_cache(maxsize=1)
def get_match_catalog() -> MatchCatalog:
    return MatchCatalog(root=get_event_store().root)


@lru_cache(maxsize=1)
def get_lineage_catalog() -> LineageCatalog:
    return LineageCatalog(root=get_event_store().root)


@lru_cache(maxsize=1)
def get_vote_poll_catalog() -> VotePollCatalog:
    return VotePollCatalog(root=get_event_store().root)


def reset_stores_for_tests() -> None:
    """Clear lru_cache between isolated test runs."""
    from libs.auth_session import reset_auth_session_store

    get_event_store.cache_clear()
    get_market_store.cache_clear()
    get_board_store.cache_clear()
    get_economy_store.cache_clear()
    get_pii_session.cache_clear()
    get_theme_store.cache_clear()
    get_match_catalog.cache_clear()
    get_lineage_catalog.cache_clear()
    get_vote_poll_catalog.cache_clear()
    reset_auth_session_store()
