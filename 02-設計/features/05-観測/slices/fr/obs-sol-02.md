---
slice_id: 05-MICRO-fr-002
type: fr-1id
req_id: OBS-SOL-02
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-002 — OBS-SOL-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-02 · RTM `status=existing`
- **acceptance**: OBS-SOL-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体観測セッション・画像・索引が **R2 上の決め打ちキー規約** に従い、legacy civilization-os の `solidImageKey` / `solidSessionKey` と **一字一句整合** または IHL 移行先キーが文書化されること。再現性とバックアップ・エクスポート時の **パス予測可能性** を担保する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `userId`（actor）· `sessionId` / `captureId` · 画像バイナリ · セッション JSON メタ |
| **Transform** | キー生成関数が prefix `world/observation/solid/{userId}/` 配下に `images/` · `sessions/` · `index.json` を割当 · **no-overwrite** 検証 |
| **OUT** | R2 PUT 成功 · 索引 `index.json` 末尾追記 · commit 応答に `r2Key` 返却 |

## 受入基準

1. セッション JSON の R2 キーが `world/observation/solid/{userId}/sessions/{sessionId}.json` 形式（ADR-H-28 · WaveE devR2 設計）。
2. 画像キーが `…/images/{captureId}.jpg`（または同等 suffix）— `solidImageKey` ヘルパと一致。
3. `index.json` は追記型（OBS-R2-05）— UPDATE/DELETE 禁止。
4. UT-05-02: `solidImageKey` / `solidSessionKey` 相当のキー生成テストが緑。
5. commit 201 応答の `r2Key` が event store truth path と整合。

## In / Out 境界

| In | Out |
|----|-----|
| userId · session/capture ID · blob | R2 object key · index 追記行 |
| devR2 / `it-hercules-laboratory-dev` バケット方針 | — |
| — | IHL image lake Parquet manifest（#18 · 別 tree） |
| — | env-samples tree（OBS-ENV-02 · 別 prefix） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1 | capture イベント · `capture_id` 命名 |
| §3.1 | `POST /api/captures` 201 · telemetry_bucket 返却 |
| §6 | R2 INSERT ONLY · 秘密非表示 |
| §7.1 | OBS-SOL-01/02/03/07 実装マップ |
| sub/WaveE-devR2 | session/index キー例 · local-r2 パス |

> キー生成コード詳細は `libs/solid_commit.py` · ADR-H-28 — API 契約は [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) 参照。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-02 |
| design_section | §2.1 §3.1 |
| test_case_id | UT-05-02 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-02 は OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05 を束ねる。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md)（`r2Key` 応答） |
| Schema | [`solidcapturebody.md`](../schema/solidcapturebody.md) |
| ADR | `ADR-H-28-devR2-運用固定-v1-DRAFT.md` · `sub/WaveE-devR2-詳細設計-v1-DRAFT.md` |
| Lib | `libs/solid_commit.py` · R2 writer（event store truth path） |

## gap 注記

- **IHL truth path**: commit 応答は `truth/capture/capture/{capture_id}.json` を返す実装あり — legacy `world/observation/solid/...` との **二系統** は WaveE / 移行 ADR で整理中（parity 既知 · キー同等性は UT で担保）。
- **digest / provenance**: OBS-R2-04 は UT-05-02 束ね — 本 FR 単体では run_id/schema_version は capture イベント側で充足。
