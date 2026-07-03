---
slice_id: 05-MICRO-fr-059
type: fr-1id
req_id: OBS-NF-08
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-059 — OBS-NF-08

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-08 · RTM `status=deferred`
- **acceptance**: OBS-NF-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測成果物について **docs / boards / GitHub / R2** 間の **対応 ID（req_id · capture_id · post_id · run_id · TC ID）** を追跡可能にし、4 媒体同期（C-Sync）監査の根拠を残すこと（REQ-026 §8 SYNC-AUDIT · OBS-R2-04 provenance 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit イベント · RTM 行 · 設計 slice · component `run_info.json` |
| **Transform** | ID 対応表 · post_id 形式コミット · digest/provenance メタ付与 |
| **OUT** | 監査可能トレース — **媒体間で同一 capture の ID 突合可能** |

## 受入基準

1. REQ-026 §8: docs↔boards↔GitHub↔R2 の **対応 ID** — promo-pack SYNC-AUDIT 準拠。
2. OBS-R2-04: `run_id` · `schema_version` · `input_hash` · provenance を commit 派生に記録。
3. UAT-05-05（deferred/xref）: OBS-R2-05 · OBS-REP-05 · OBS-RAG-01 · OBS-IMG-05 · **OBS-NF-08** 束ね。
4. RTM CSV: req_id ↔ test_case_id ↔ design_section が **slice 本文と一致**。
5. コミットメッセージ形式: `[post_id] 理由 → 内容 → 影響`（ProjectRules 運用）。

## In / Out 境界

| In | Out |
|----|-----|
| capture_id · req_id · TC ID | RTM/逆RTM 行 |
| post_id · commit | GitHub 履歴 |
| R2 session JSON | 正本イベント |
| — | 媒体間 ID 不整合の silent 許容 |
| — | RAG のみを監査正本に |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 監査ID · OBS-NF-08 |
| §5 OUT | provenance · run_info |
| §2.1 | capture_id 正本 |

> ペア: [`obs-r2-04.md`](obs-r2-04.md) · [`obs-r2-05.md`](obs-r2-05.md) · [`obs-rep-05.md`](obs-rep-05.md) · RTM: `04-トレーサ/features/05-観測/RTM-v1.csv`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-08 |
| design_section | §6 監査ID |
| test_case_id | UAT-05-05 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-05 — OBS-R2-05 · OBS-REP-05 · OBS-RAG-01 · OBS-IMG-05 · OBS-NF-08（deferred/xref 混在 · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| RTM | `RTM-v1.csv` · `逆RTM-v1.csv` |
| R2 | provenance · run_info |
| Ops | C-Sync · post_id 運用 |
| テスト | UAT-05-05 acceptance deferred |

## gap 注記

- **deferred**: ID 対応 **ルールは確定** — 横断 SYNC-AUDIT acceptance 未 GATE。
- **RAG-01 境界**: RAG は派生索引 — 監査 Truth は R2 + RTM（RAG-01 gap 同型）。
- **xref**: UAT-05-05 は複数 FR 束ね — 本 FR 単体 TC は thin。
