---
slice_id: 05-MICRO-fr-035
type: fr-1id
req_id: OBS-REP-06
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-035 — OBS-REP-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-06 · RTM `status=deferred`
- **acceptance**: OBS-REP-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

マーケット listing から observation profile **bundle を完全自動 fork** し、出品メタを観測 commit に連鎖すること（REQ-023）。現状は **手動正本** — 自動 fork は **未完了** · #06 マーケット境界（DET §7.2 P3）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | マーケット listing · bundle v1 参照 · ユーザー購入/取得イベント |
| **Transform** | （目標）listing→bundle 自動コピー · whitelist 検証 · commit プリフィル |
| **OUT** | **現状**: 手動 bundle 取り込み（OBS-REP-04）のみ · 自動 fork **未配線** |

## 受入基準

1. 要件状態: **未完了（手動正本）** — `observation-market-bundle-fork-map.md`。
2. REQ-023 残: market×bundle 完全自動は **#06 スコープ** — #05 は参照のみ。
3. UAT-05-07（gap/deferred 束ね）: OBS-REP-06 は Driver/BPCMS と同 TC — **review まで deferred**。
4. OBS-RX-REP-03: bundle v1 取り込み IN · **市場自動 fork OUT**。
5. 手動経路: OBS-REP-04 implemented（civ-os）— 本 FR との **境界明記**。

## In / Out 境界

| In | Out |
|----|-----|
| 手動 bundle 貼り付け（REP-04） | commit profile メタ |
| マーケット listing（将来） | 自動 fork イベント |
| — | #06 trade event 連鎖 |
| — | ScreenDef キャンバス（OBS-REP-07） |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P3 | market×bundle gap/deferred |
| §1.2 | #06 被依存 — bundle 元 |
| §4.16.5 | OBS-RX-REP-03 OUT |

> 正本: `observation-market-bundle-fork-map.md` · REQ-023。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-06 |
| design_section | §1.2 §7 P3 market自動 |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-07 — OBS-REP-01/02/06 等（`revrtm-004` · gap 束ね）。

## 実装 surface

| 層 | 参照 |
|----|------|
| #06 | マーケット listing · trade events |
| #05 | OBS-REP-04 手動 bundle |
| 文書 | `observation-market-bundle-fork-map.md` |
| 将来 | listing→bundle fork worker |

## gap 注記

- **deferred ≠ 削除**: 手動正本で運用可能 — 自動化は #06 GATE 後。
- **REP-04 依存**: 自動 fork 前に bundle schema/whitelist は REP-04 で固定済み。
- **UAT-05-07**: gap 要件と deferred 要件の混在 TC — 逆 RTM 意図どおり維持。
