"""Home summary API — B8-Q-14 #04."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_home_summary_cta() -> None:
    res = client.get("/api/v1/home/summary")
    assert res.status_code == 200
    body = res.json()
    assert body["primary_cta"]["href"] == "/observation/context"
    assert len(body["cards"]) >= 4


def test_ut_04_03_today_lines_three() -> None:
    """UT-04-03: today_lines は 3 行（1 行 1 情報 · NF-H-01 認知負荷）。"""
    body = client.get("/api/v1/home/summary").json()
    assert isinstance(body["today_lines"], list)
    assert len(body["today_lines"]) == 3
    assert all(isinstance(line, str) and line for line in body["today_lines"])


def test_ut_04_04_cards_have_href() -> None:
    """UT-04-04: 各カードは href を持つ入口地図（H-021）。"""
    body = client.get("/api/v1/home/summary").json()
    for card in body["cards"]:
        assert isinstance(card.get("href"), str) and card["href"].startswith("/")
        assert card.get("label")


def test_ut_04_05_obs_card_links_observation() -> None:
    """UT-04-05: 観測カード(obs)が /observation を指す（H-030 観測件数連携）。"""
    body = client.get("/api/v1/home/summary").json()
    obs = next((c for c in body["cards"] if c["id"] == "obs"), None)
    assert obs is not None
    assert obs["href"] == "/observation"
    assert isinstance(obs["value"], str)


def test_ut_04_06_summary_resilient_no_raw_error() -> None:
    """UT-04-06 / NF-H-03: data source 状態に依らず 200 · raw エラー文字列を出さない。"""
    res = client.get("/api/v1/home/summary")
    assert res.status_code == 200
    obs = next((c for c in res.json()["cards"] if c["id"] == "obs"), None)
    assert obs is not None
    # 例外時も近似文字列（"—"/"3"/件数）で、トレースバック断片を含まない
    assert "Traceback" not in obs["value"]


def test_ut_04_07_primary_cta_label_nonempty() -> None:
    """UT-04-07 / H-011: 主 CTA ラベルが非空（観測をはじめる）。"""
    body = client.get("/api/v1/home/summary").json()
    assert body["primary_cta"]["label"]
