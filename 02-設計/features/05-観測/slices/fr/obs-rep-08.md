---
slice_id: 05-MICRO-fr-036
type: fr-1id
req_id: OBS-REP-08
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-036 — OBS-REP-08

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-08 · RTM `status=review`
- **acceptance**: OBS-REP-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体 commit ボディの **canonical JSON** から `clientContentDigest`（SHA-256 hex）を算出し、再現性トレースと改ざん検知の根拠とすること。サーバ再計算が正本 · クライアント送信値は **一致検証のみ**（不一致 → 400 `DIGEST_MISMATCH`）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `ObservationCommitBody` — species · rows[] · photo_conditions[] · devices[] · env snapshot · `has_photo` 等（画像バイナリ除外） |
| **Transform** | sorted keys · compact JSON · UTF-8 · SHA-256(hex) · クライアント値照合 |
| **OUT** | capture イベント `clientContentDigest` · 201 応答 · manifest 公開 · mismatch → **400** |

## 受入基準

1. canonical 仕様: DET §3.3.1 — `v:1` · 画像バイナリ除外 · キー順固定。
2. UT-05-02: `test_content_digest_mismatch_rejected` **existing 緑**（OBS-R2-04 · REP-IHL-01 束ね）。
3. クライアント未送信時もサーバ計算 digest を 201/manifest に返す。
4. confirm UI: `computeObservationClientContentDigest` 連携（[`observation-confirm.md`](../screens/observation-confirm.md)）。
5. RTM **review**: pytest 緑だが受入サインオフ待ち — 粉飭で existing にしない。

## In / Out 境界

| In | Out |
|----|-----|
| commit body 全フィールド（canonical 対象） | SHA-256 hex digest |
| 任意 `clientContentDigest` 送信 | 一致検証 |
| — | 画像バイナリの digest 含有 |
| — | digest 不一致のサイレント受理 |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3.1 | canonical JSON 定義 |
| §4.16.5 | OBS-RX-REP-05 ver2 IN |
| §2.1 | capture イベント列 |

> Schema: [`observationcommitbody.md`](../schema/observationcommitbody.md) · Error: [`../errors/400.md`](../errors/400.md) `DIGEST_MISMATCH`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-08 |
| design_section | §2.1 digest |
| test_case_id | UT-05-02 |
| test_layer | unit |
| automation | pytest |
| status | **review** |

逆 RTM: UT-05-02 — OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05（`revrtm-001`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Lib | `solid_commit.py` · `compute_client_content_digest` |
| テスト | `test_content_digest_mismatch_rejected` |
| manifest | [`obs-rep-05.md`](obs-rep-05.md) 連携 |

## gap 注記

- **review 維持**: 実装・UT は existing 相当だが RTM 行は **人間受入待ち**（tier-a）。
- **R2-04 重複**: provenance 束ね — 本 FR は digest 契約に特化。
- **ver2 done**: ADR プチWF G9 — confirm 配線済み · Runbook 整備は別追跡。
