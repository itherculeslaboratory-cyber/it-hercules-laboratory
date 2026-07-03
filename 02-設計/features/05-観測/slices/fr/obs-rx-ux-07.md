---
slice_id: 05-MICRO-fr-078
type: fr-1id
req_id: OBS-RX-UX-07
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-078 — OBS-RX-UX-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-07 · OBS-FUP-01 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**append-only** — 同一 capture の編集 UI **禁止** · 個体/capture 履歴は時系列で **常時閲覧可** とすること（R2 INSERT ONLY · OBS-FUP-01 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 既存 capture_id · 訂正意図 · 新観測データ |
| **Transform** | UPDATE/DELETE API **404/405** · 新 capture INSERT · 履歴降順一覧 |
| **OUT** | 編集 UI 無 · 訂正 = 新観測 · 空状態あり |

## 受入基準

1. capture UPDATE/PATCH API — **404 または 405**（設計 §5 · R2Engine）。
2. UI: 同一 capture の **インライン編集・保存ボタン禁止**。
3. `GET /api/individuals/{id}/captures` — 時系列降順 · `prior_capture_id` 連鎖可視（DET §9.7）。
4. ST-05-09（planned）: event store INSERT ONLY — **間接** retrofit。
5. 履歴 **空状態** — 初回観測前の理由付き empty（NF-04/UX-09）。

## In / Out 境界

| In | Out |
|----|-----|
| append-only ポリシー | 履歴閲覧 UI |
| 新 capture 追記 | capture UPDATE |
| — | 管理者例外 UPDATE（ver1 無） |
| — | 論理削除 UI |

## DET 参照

| 節 | 内容 |
|----|------|
| §5 | R2 INSERT ONLY · UPDATE 拒否 |
| §9.7 | captures 一覧 API |
| §4.16.2 P4 | 追記のみ |
| FUP | [`obs-fup-01.md`](obs-fup-01.md) |

> ペア: [`obs-fup-01.md`](obs-fup-01.md) · [`obs-r2-01.md`](obs-r2-01.md) · `civilization/R2Engine.md`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-07 |
| design_section | §5 UPDATE拒否 |
| test_case_id | ST-05-09 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-09 — OBS-RX-UX-07（1 req · `revrtm-003` · INSERT ONLY 間接）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | captures LIST · UPDATE 無 |
| Web | 履歴一覧 · 編集 UI 無 |
| R2 | INSERT ONLY event store |
| テスト | ST-05-09 専用断言 **未** — solid persist 部分 |

## gap 注記

- **planned**: 設計/API は INSERT ONLY — ST-05-09 **明示 pytest 未**（間接カバーのみ）。
- **訂正フロー**: ユーザーは **新観測**で訂正 — UX 文案で明示（no-user-facing-unimplemented）。
- **FUP-01 重複**: 機能（INSERT）vs UX（編集禁止 UI）— slice 分離 · 同一 ST 束ね可。
