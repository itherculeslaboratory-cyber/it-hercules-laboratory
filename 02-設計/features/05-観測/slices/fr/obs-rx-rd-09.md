---
slice_id: 05-MICRO-fr-091
type: fr-1id
req_id: OBS-RX-RD-09
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-091 — OBS-RX-RD-09

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-09 · OBS-FUP-04 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

capture 応答に **`derived_bindings[]`** 読取専用スナップショット（任意 · 監査/UI 説明用）を含め、commit 直後 GET capture で派生 binding 状態を確認できること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit 201 応答 · binding/occupancy 派生イベント · `capture_id` |
| **Transform** | 派生イベント → `derived_bindings[]` スナップショット組立 · READ ONLY 付与 |
| **OUT** | GET capture 200 — `derived_bindings[]`（role · device_id · placement_id · interval 境界） |

## 受入基準

1. commit 直後 GET `/api/v1/observation/{capture_id}` で `derived_bindings[]` 確認可（§4.16.4）。
2. 配列要素: `device_id` · `role` · `placement_id` · `started_at`/`ended_at` · `source=observation_commit`。
3. **書込禁止** — UI/API から `derived_bindings[]` を PATCH/PUT 不可（INSERT ONLY 派生）。
4. IT-05-13（planned）: `test_get_capture_includes_derived_bindings_snapshot`（`revrtm-002`）。
5. FUP-04/RD-03 派生と **同一 TX** — commit 201 応答にも同配列を含む。

## In / Out 境界

| In | Out |
|----|-----|
| derive_bindings 結果 | `derived_bindings[]` READ |
| capture GET | 監査/UI 説明用スナップショット |
| — | binding 手動 UPDATE |
| — | 空配列を省略して未派生を隠す |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | `derive_bindings_from_observation()` |
| §9.1 | commit 応答フィールド |
| FUP-04 | devices[] 宣言 → 派生 |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-rx-rd-03.md`](obs-rx-rd-03.md) · [`obs-rx-rd-08.md`](obs-rx-rd-08.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-09 |
| design_section | §9.3 derived_bindings |
| test_case_id | IT-05-13 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-13 — OBS-RX-RD-09（1 req · `revrtm-002` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | GET capture detail · commit 201 body |
| Lib | `derive_bindings_from_observation()` 出力 |
| テスト | IT-05-13 retrofit 待ち |

## gap 注記

- **planned**: 派生ロジックは FUP-04/RD-03 で設計確定 — GET スナップショット断言待ち。
- **任意フィールド**: 派生なし commit は `derived_bindings: []` または省略 — 404 にしない。
- **UX 交差**: confirm binding サマリー（RX-UX-08）は UI 層 — 本 FR は **API 契約**のみ。
