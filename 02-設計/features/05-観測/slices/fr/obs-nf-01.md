---
slice_id: 05-MICRO-fr-054
type: fr-1id
req_id: OBS-NF-01
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-054 — OBS-NF-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-01 · RTM `status=planned`
- **acceptance**: OBS-NF-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測ドメインの永続化は **R2 INSERT ONLY**（憲法 · `ProjectRules.md` · `R2Engine.md`）を遵守すること。capture · measurement · photo_condition · life_event 等は **追記のみ** — 同一キーの UPDATE/DELETE で履歴を改ざんしない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit リクエスト · イベント payload · R2 object key |
| **Transform** | append-only TX · 新規 event_id/capture_id 採番 · 重複 key 拒否 |
| **OUT** | R2 event store 行追加 — **既存行の上書きなし** |

## 受入基準

1. `ProjectRules.md` / `R2Engine.md`: INSERT ONLY — UPDATE/DELETE API 無。
2. 同一 capture_id 再 commit → **409 または新規 ID**（OBS-R2-03 束ね · 上書き禁止）。
3. ST-05-03（planned）: 2 回 commit → **別 capture_id**（`revrtm-003` · OBS-R2-01/02/03 と 4 件束ね）。
4. life_event · env ingest も同一原則 — 観測のみの例外なし。
5. 補正は **新規イベント追記**（例: reanalysis-manifest）— 原データ DELETE 禁止。

## In / Out 境界

| In | Out |
|----|-----|
| 新規観測イベント | R2 INSERT |
| 訂正意図 | 新規追記イベント（別 FR） |
| — | capture UPDATE |
| — | measurement DELETE |
| — | R2 object 上書き put（同一キー） |

## DET 参照

| 節 | 内容 |
|----|------|
| §4 | R2 event store |
| §6 | INSERT ONLY · OBS-NF-01 |
| §2.1 | capture イベント列 |

> 憲法: `/civilization/ProjectRules.md` · `/civilization/R2Engine.md` · ペア: [`obs-r2-01.md`](obs-r2-01.md)〜[`obs-r2-03.md`](obs-r2-03.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-01 |
| design_section | §4 §6 INSERT ONLY |
| test_case_id | ST-05-03 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-03 — OBS-R2-01 · OBS-R2-02 · OBS-R2-03 · OBS-NF-01（4 req 束ね · `revrtm-003` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| R2 | event store · append TX |
| API | commit · captures POST |
| Lib | `write_solid_capture` · seq 採番 |
| テスト | `test_commit_with_naming_template_increments_seq`（**部分** · ST-05-03） |

## gap 注記

- **planned**: 挙動は既存テストで **間接緑** — ST-05-03 として 4 FR 束ね断言が RTM 差分。
- **R2-03 ペア**: 409/新 ID 方針は別 FR — 本 FR は **憲法レベル原則**。
- **粉飭禁止**: planned を existing にしない — 2 回 commit 別 ID の明示 ST 待ち。
