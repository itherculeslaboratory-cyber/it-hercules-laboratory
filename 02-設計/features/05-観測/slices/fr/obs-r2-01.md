---
slice_id: 05-MICRO-fr-019
type: fr-1id
req_id: OBS-R2-01
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-019 — OBS-R2-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.4 OBS-R2-01 · RTM `status=planned`
- **acceptance**: OBS-R2-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測の **永続正本は R2（event store）のみ** とし、**UPDATE/DELETE 禁止**（INSERT ONLY）を civilizaton-os · IHL 双方で守ること。キー空間: `world/observation/solid/...` · `world/env/...`（civilization-os）/ IHL `raw/` `normalized/` `derived/` `manifests/` `runs/`（別バケット · ADR-H-03）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit/upload/search 等の書込要求 |
| **Transform** | `store.write_*` / append-only API — 既存キー検知時 **拒否** |
| **OUT** | 新 event / 新 object のみ · 索引 `index.json` 末尾追記 |

## 受入基準

1. `ProjectRules.md` / `R2Engine.md`: INSERT ONLY — UPDATE/DELETE API **存在しない**。
2. capture/measurement/photo_condition/env_snapshot イベントは **append** のみ（DET §2）。
3. `ST-05-03`: 2 回 commit → **別 capture_id**（seq テストで間接断言 · **planned** 束ね）。
4. OBS-NF-01 と共有 — 同一キー再 put 拒否（OBS-R2-03 は別 FR）。
5. **planned 維持**: dedicated ST-05-09（R2 UPDATE 拒否）等は **部分** — 粉飭 existing 禁止。

## In / Out 境界

| In | Out |
|----|-----|
| 観測 write 経路全般 | append-only 永続 |
| event store | capture/measurement イベント |
| — | IHL embedding parquet 生成（#18 · 別ツリー） |
| — | 管理 UI からの DELETE |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1–§2.2 | capture/measurement INSERT ONLY |
| §4 | 状態機械 · 修正は新 ID |
| §6 | OBS-NF-01 / OBS-R2-01 |
| §5 | ITO OUT = event store INSERT |

> 憲法: `civilization/R2Engine.md` · `civilization/ProjectRules.md`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-R2-01 |
| design_section | §4 §6 INSERT ONLY |
| test_case_id | ST-05-03 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-03 は OBS-R2-01/02/03 · OBS-NF-01 を 4 件束ね（`revrtm-003`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `apps/api/stores.py` · `solid_commit.py` |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`post-api-captures.md`](../api/post-api-captures.md) |
| 横断 | ADR-H-03（IHL 専用バケット）· migration mapping |
| テスト | `test_observation_solid.py` · ST-05-03 相当（**planned** 明示） |

## gap 注記

- **planned 束ね**: 実装は append 方針だが ST-05-03/09 の **専用 system 断言** が RTM 上 planned。
- **バケット分離**: civilization-os ツリーと IHL dev バケットは **別** — キー相互参照は capture/session/individual id マッピング。
- **OBS-R2-02 ペア**: 修正表現は新レコード — 本 FR は「禁止」、R2-02 は「表現方法」。
