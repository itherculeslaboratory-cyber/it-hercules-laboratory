---
slice_id: 05-MICRO-fr-020
type: fr-1id
req_id: OBS-R2-02
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-020 — OBS-R2-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.4 OBS-R2-02 · RTM `status=planned`
- **acceptance**: OBS-R2-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測データの **修正・訂正は新規レコード／新 snapshot** で表現し、履歴を消さないこと（OBS-R2-01 INSERT ONLY の運用面）。例: 新 `sessionId` · 新 env-sample · 新 binding event · 新 `capture_id` · IHL 側は新 `run_id` / `snapshot_id`。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー訂正 intent · 元 capture/session 参照 · 更新後メタ/計測 |
| **Transform** | **上書きせず** 新 commit / 新 measurement rows / 新 binding ended+started |
| **OUT** | 新 ID 付きイベント链 · `prior_capture_id` / `priorSessionId` で連鎖 · 旧レコードは参照可能 |

## 受入基準

1. 訂正フローは **新 commit** — 同一 `capture_id` UPDATE なし（OBS-SOL-08 `priorCaptureId` 整合）。
2. env 訂正: 新 env-sample JSON + index 追記（OBS-ENV-02 · OBS-R2-05 索引）。
3. binding 訂正: `device.binding.ended` + `device.binding.started`（§9.3 · 暗黙終了含む）。
4. `ST-05-03`: 連続 commit で ID 一意 — **planned** 束ね（R2-01/03/NF-01 共有）。
5. IHL research lake: モデル変更時 **旧 run 残存 + 新 snapshot 採用**（OBS-REP-IHL-03 · #18 境界）。

## In / Out 境界

| In | Out |
|----|-----|
| 訂正 intent · prior 参照 | 新 capture/measurement/binding |
| ユーザー再観測 | 新 observed_at · 新 digest |
| — | 管理画面からの DELETE/UPDATE |
| — | R2 オブジェクト in-place patch |

## DET 参照

| 節 | 内容 |
|----|------|
| §4 | 修正は新 capture_id |
| §9.3 | binding ended+started |
| §3.3.1 | `prior_capture_id` · `clientContentDigest` |
| §2.2 | 新 measurement 行 INSERT |

> 連鎖: OBS-SOL-08 · [`observationcommitbody.md`](../schema/observationcommitbody.md) `prior_capture_id`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-R2-02 |
| design_section | §4 新レコード |
| test_case_id | ST-05-03 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-03 — OBS-R2-01/02/03 · OBS-NF-01（`revrtm-003` · 4 req 束ね）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| Lib | `derive_bindings.py` · `solid_commit.py` |
| 関連 FR | OBS-SOL-08 · OBS-R2-01 · OBS-R2-05 |
| テスト | ST-05-03 相当（**planned**） |

## gap 注記

- **planned 維持**: prior 連鎖の **部分 UT existing**（OBS-SOL-08）— system 層 ST-05-03 完走待ち。
- **UX**: ユーザー向け「訂正」は **新規観測として再 commit** — 編集 UI で in-place 更新しない。
- **cross-bucket**: IHL snapshot 訂正は #18 run 管理 — #05 FR は observation/event store 側。
