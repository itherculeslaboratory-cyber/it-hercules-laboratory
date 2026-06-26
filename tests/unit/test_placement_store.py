"""#13 Red — placement_store INSERT ONLY · 409 duplicate occupancy (civ-os envShelfRoutes)."""

from __future__ import annotations

import pytest

def test_placement_crud_insert_only(tmp_path) -> None:
    """Placement 作成は append のみ — UPDATE/DELETE 禁止 (Tier A)."""
    from libs.placement_store import PlacementStore

    store = PlacementStore(root=tmp_path / "truth")
    created = store.create_placement(actor_id="u_test", label="棚A")
    placement_id = created["placement_id"]
    listed = store.list_placements(actor_id="u_test")
    assert any(p["placement_id"] == placement_id for p in listed)
    with pytest.raises(NotImplementedError):
        store.update_placement(placement_id, label="改ざん")


def test_duplicate_open_occupancy_returns_409(tmp_path) -> None:
    """civ-os envShelfRoutes: 連続 occupancy/start は 409."""
    from libs.placement_store import DuplicateOpenOccupancyError, PlacementStore

    store = PlacementStore(root=tmp_path / "truth")
    placement_id = store.create_placement(actor_id="u_occ", label="棚B")["placement_id"]
    store.start_occupancy(placement_id, subject_ref="sample-qr-1")
    with pytest.raises(DuplicateOpenOccupancyError) as exc:
        store.start_occupancy(placement_id, subject_ref=None)
    assert exc.value.http_status == 409
def test_occupancy_end_clears_open(tmp_path) -> None:
    """IT-13-01 store: start then end yields no open occupancy."""
    from libs.placement_store import PlacementStore

    store = PlacementStore(root=tmp_path / "truth")
    placement_id = store.create_placement(actor_id="u_occ_chain", label="占有棚")["placement_id"]
    store.start_occupancy(placement_id, actor_id="u_occ_chain", subject_ref="specimen-1")
    assert store.get_open_occupancy(actor_id="u_occ_chain", placement_id=placement_id) is not None
    store.end_occupancy(placement_id, actor_id="u_occ_chain")
    assert store.get_open_occupancy(actor_id="u_occ_chain", placement_id=placement_id) is None


def test_device_binding_start_end_and_open(tmp_path) -> None:
    from libs.placement_store import PlacementStore

    store = PlacementStore(root=tmp_path / "truth")
    actor = "u_bind"
    placement_id = store.create_placement(actor_id=actor, label="binding棚")["placement_id"]
    started = store.start_device_binding(
        placement_id,
        actor_id=actor,
        device_id="dev_a",
        role="temp_humidity",
        source="observation_commit",
    )
    assert started["device_id"] == "dev_a"
    open_binding = store.get_open_binding(actor_id=actor, placement_id=placement_id, role="temp_humidity")
    assert open_binding is not None
    store.end_device_binding(placement_id, actor_id=actor, role="temp_humidity")
    assert store.get_open_binding(actor_id=actor, placement_id=placement_id, role="temp_humidity") is None
