---
slice_id: 05-MICRO-fr-033
type: fr-1id
req_id: OBS-REP-04
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-033 — OBS-REP-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-04 · RTM `status=deferred`
- **acceptance**: OBS-REP-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**observation profile bundle v1** の許可フィールドを貼り付け・ファイル取り込みで入力し、固体 commit に反映して撮影プロファイルを再現可能にすること（REQ-022）。civilization-os は **implemented**、IHL は **#06 境界 + UI 未 port で deferred**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | bundle v1 JSON（許可フィールドのみ）· ファイルアップロード · 貼り付けテキスト |
| **Transform** | whitelist フィールド検証 · commit body へマージ · `clientContentDigest` 対象に含める |
| **OUT** | commit 済み capture に profile メタ · digest 再計算 · manifest 再現性行 |

## 受入基準

1. REQ-022: bundle 許可フィールドのみ commit 反映 — 未知キーは拒否または strip（civ-os 正本）。
2. OBS-RX-REP-03: observationProfile / bundle v1 取り込みは **ver1 IN**（§4.16.5）。
3. UAT-05-06（deferred）: template LIST/DETAIL UT と **別 TC** — bundle 受入は review 待ち。
4. IHL commit body は [`observationcommitbody.md`](../schema/observationcommitbody.md) — bundle 専用フィールドは **civ-os 先行**。
5. market 由来 bundle は OBS-REP-06（手動正本）— 自動 fork は **未完了**。

## In / Out 境界

| In | Out |
|----|-----|
| bundle v1 JSON · ファイル | 検証済み profile フィールド |
| ユーザー確定 commit | capture + digest |
| — | market 自動 fork（OBS-REP-06 · #06） |
| — | observationProfile 幾何 vs BPCMS ラボ（OBS-REP-03 Phase2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3.1 | digest canonical — bundle フィールド含有時はキー順固定 |
| §7.2 P3 | market×bundle — deferred |
| §4.16.5 | OBS-RX-REP-03 ver1 IN |

> 正本: `docs/observation-profile-bundle-req-022.md`（REQ-022）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-04 |
| design_section | §7 bundle |
| test_case_id | UAT-05-06 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-06 — OBS-TPL-16 review 等と同層（`revrtm-004` · deferred）。

## 実装 surface

| 層 | 参照 |
|----|------|
| civ-os | bundle 取り込み UI · REQ-022 実装 |
| IHL Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| 境界 | #06 マーケット（OBS-REP-06） |

## gap 注記

- **deferred 理由**: civ-os で implemented — IHL repo は commit 契約のみ · bundle UI/import は **port 待ち**。
- **digest 整合**: bundle 追加時は canonical JSON キー集合変更 — UT-05-02 と連動。
- **REP-06 分離**: 手動正本 vs 自動 fork — 本 FR は取り込みのみ。
