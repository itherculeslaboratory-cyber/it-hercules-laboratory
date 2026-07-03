---
slice_id: 05-MICRO-fr-070
type: fr-1id
req_id: OBS-FUP-10
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-070 — OBS-FUP-10

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-10 · RTM `status=deferred`
- **acceptance**: OBS-FUP-10 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測なしの温度計交換のみ **単独 DeviceBinding API**（任意 · **P1**）を提供すること。棚フロー · commit 派生（FUP-04/05）と **同一イベント種** で history 整合。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 棚 UI · placement · 旧/新 device_id · role · 交換時刻 |
| **Transform** | 単独 API TX · `device.binding.ended` + `device.binding.started` · `source=shelf_api` |
| **OUT** | binding 区間更新 — commit 無し device 交換記録 |

## 受入基準

1. **P0 = commit 派生**（FUP-04/05）— 単独 API は **P1 任意** · ver1 必須経路ではない（要件 §4.9.1）。
2. 実装時: commit 派生と同一 event type · INSERT ONLY · 409 重複規則共有（OBS-RX-RD-08）。
3. UAT-05-03（deferred/review）: RTM は **review/deferred** — env chain テストと ID 共有（xref 注意）。
4. ADR-H-32 G1: 単独 API = P1 · **commit 派生が blocking P0**。
5. 本 FR 未実装でも ver1 E2E（QR→commit→binding）は FUP-04 で完走可能。

## In / Out 境界

| In | Out |
|----|-----|
| 棚フロー device 交換（P1） | binding INSERT（shelf 経路） |
| commit 派生イベント種 | history 統合 |
| — | ver1 必須 API |
| — | 観測 commit 省略不可の強制 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | derive_bindings 主経路 · P0 |
| §7.1 | 単独 API **未配線** |
| ADR-H-32 | G1 P0 blocking = commit 派生 |
| 要件 §4.9.1 | P1 shelf API |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-fup-05.md`](obs-fup-05.md) · #13 Placement。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-10 |
| design_section | §9.3 P1 shelf API |
| test_case_id | UAT-05-03 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-03 — OBS-FUP-10 · xref/deferred（`revrtm-004` · env chain と ID 共有 · **意図的 deferred**）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | （未実装）単独 DeviceBinding endpoint |
| Lib | `derive_bindings_from_observation` と event 種共有予定 |
| #13 | Placement / shelf UI |
| テスト | UAT-05-03 review — **deferred 維持** |

## gap 注記

- **deferred 固定**: ver1 出荷ブロッカーではない — commit 派生で device 交換は **観測経由**カバー。
- **RTM xref**: UAT-05-03 は env IT とも共有 ID — **status=deferred を粉飾しない**。
- **P1 着手時**: FUP-04/05 と event schema parity 必須。
