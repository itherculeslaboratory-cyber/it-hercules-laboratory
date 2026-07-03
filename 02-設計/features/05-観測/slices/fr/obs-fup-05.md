---
slice_id: 05-MICRO-fr-065
type: fr-1id
req_id: OBS-FUP-05
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-065 — OBS-FUP-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-05 · RTM `status=planned`
- **acceptance**: OBS-FUP-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

新観測が **異なる device** を宣言したとき、前 binding を **暗黙終了**（ユーザー end 操作不要 · **主経路**）し、区間 `[T0,T1)` / `[T1,…)` を history から復元可能にすること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 新 commit `devices[]` · 現 open binding（placement+device+role） |
| **Transform** | `(placement_id, device_id, role)` 不一致検出 → `device.binding.ended` + `device.binding.started` |
| **OUT** | 非重複 binding 区間列 · `observed_at` を境界時刻 |

## 受入基準

1. device_id 変更 commit → 旧 binding **自動 ended** · 新 binding **started**（FUP-04 派生内）。
2. 宣言が前回と同一 + `source=unchanged` → **新 binding イベントなし**（§9.3）。
3. 区間履歴から device 交換タイムライン復元可能。
4. UT-05-12（planned）: implicit end unit — **専用 pytest 無**（orphan-impl）。
5. IT-05-07 部分: `test_commit_derives_three_binding_events_on_device_switch` — 多役割切替。

## In / Out 境界

| In | Out |
|----|-----|
| commit 時 device 変更 | 暗黙 binding end/start |
| 観測時刻 `observed_at` | 区間境界 |
| — | ユーザー手動 binding end UI（任意 · P1 shelf） |
| — | 観測なしの device 交換（FUP-10） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | derive 条件表 · INSERT ONLY |
| §9.1 | `observed_at` = 区間境界 |
| ADR-H-33 | commit 派生 · 主経路 |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-fup-08.md`](obs-fup-08.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-05 |
| design_section | §9.3 implicit binding end |
| test_case_id | UT-05-12 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-12 — OBS-FUP-05 のみ（`revrtm-001` · planned · orphan-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `derive_bindings_from_observation()` |
| Store | `PlacementStore` open binding 読取 |
| テスト | IT-05-07 部分（device switch 3 events） |

## gap 注記

- **planned · orphan-impl**: ロジック実装済 — UT-05-12 命名 unit が GAP-IMPL-01 対象。
- **FUP-10 境界**: 観測なし device 交換は単独 API（deferred）— 本 FR は **commit 派生のみ**。
