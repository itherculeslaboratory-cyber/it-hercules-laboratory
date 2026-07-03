---
slice_id: 05-MICRO-fr-061
type: fr-1id
req_id: OBS-FUP-01
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-061 — OBS-FUP-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-01 · RTM `status=planned`
- **acceptance**: OBS-FUP-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 commit は **常に新 capture INSERT** とし、同一 `capture_id` の UPDATE を禁止すること。再観測のたびに新 `capture_id` を採番し、R2 INSERT ONLY（OBS-NF-01 整合）で履歴を改ざんしない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit リクエスト · 個体/計測/写真条件 payload · セッション actor |
| **Transform** | サーバ採番 `cap_*` · append-only TX · 既存 capture キー UPDATE 拒否 |
| **OUT** | 新 capture イベント 201 · **同一 ID 上書きなし** |

## 受入基準

1. 毎 commit → **新 `capture_id`** — クライアント指定 ID の UPDATE 不可。
2. R2 / event store: INSERT ONLY — OBS-NF-01 · `ProjectRules.md` 整合。
3. ST-05-08（planned）: 2 回 commit → **別 capture_id** · event 追跡。
4. 同一 digest 再送 → 409 または新 ID（OBS-R2-03 束ね · 上書き禁止）。
5. `GET /api/v1/observation/{capture_id}` は **読取専用** — PATCH/PUT 無。

## In / Out 境界

| In | Out |
|----|-----|
| 新規観測 commit | 新 capture INSERT |
| 再観測（フォローアップ） | 別 capture_id（本 FR） |
| — | capture UPDATE |
| — | measurement 行の in-place 修正 |
| — | 同一 capture_id 再 commit 上書き |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `capture_id` サーバ採番 · UPDATE 禁止 |
| §4 | R2 event store INSERT ONLY |
| §7.1 | `commit_solid_observation` persist |

> ペア: [`obs-nf-01.md`](obs-nf-01.md) · [`obs-r2-03.md`](obs-r2-03.md) · [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-01 |
| design_section | §9.1 §9.3 commit INSERT |
| test_case_id | ST-05-08 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-08 — OBS-FUP-01 のみ（`revrtm-003` · planned · solid commit persist **部分**）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `POST /api/solid-observation/commit` |
| Lib | `commit_solid_observation` · seq 採番 |
| R2 | capture event INSERT |
| テスト | commit persist 系（ST-05-08 専用未分離） |

## gap 注記

- **planned**: 挙動は既存 commit で **間接緑** — ST-05-08 として明示 system 断言待ち。
- **FUP-02 ペア**: 再観測は新 capture + `prior_capture_id` 連鎖 — UPDATE ではない。
