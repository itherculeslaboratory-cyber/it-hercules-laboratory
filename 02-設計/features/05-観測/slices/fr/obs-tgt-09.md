---
slice_id: 05-MICRO-fr-053
type: fr-1id
req_id: OBS-TGT-09
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-053 — OBS-TGT-09

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.11 OBS-TGT-09 · RTM `status=deferred`
- **acceptance**: OBS-TGT-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

GBIF taxonKey · Wikidata QID 等の外部 ID は **`ObservationTarget.canonical_ids` に候補根拠（テキスト）** として保存し、観測 commit の確定 taxonomy/target は **user_confirmed のみ** とすること（ADR-H-16 §9 · OBS-TAX-07 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ナビゲータ/Driver 候補 · GBIF/Wikidata 応答 · draft `canonical_ids` |
| **Transform** | 外部 ID → target/session **非確定メタ**（根拠テキスト）· commit 時 Truth = **ユーザー確定 path/rank/display** |
| **OUT** | セッション JSON: `canonical_ids` 分離 · species/target 確定フィールドに外部 ID を混在させない |

## 受入基準

1. ADR-H-16 §9: 候補根拠テキストのみ — taxonKey/QID を species 確定として永続しない。
2. セッション JSON 検査: `canonical_ids` と user confirmed フィールドが **同一キー化されていない**。
3. UT-05-03（deferred 束ね）: OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · **OBS-TGT-09**。
4. OBS-TGT-04: rank 確定はユーザー — 外部 catalog からの自動 subspecies 確定禁止。
5. promo-pack 受入: Driver 候補があっても commit は UI 確定値。

## In / Out 境界

| In | Out |
|----|-----|
| GBIF/Wikidata 候補 | draft `canonical_ids`（根拠） |
| ユーザー確定 target/taxonomy | capture Truth |
| — | taxonKey → species 自動確定 |
| — | canonical_ids を search フィルタ Truth に |

## DET 参照

| 節 | 内容 |
|----|------|
| §7 P4 | 候補根拠 |
| ADR-H-16 §9 | canonical_ids 契約 |
| §6 | 由来分離 · OBS-TAX-07 |
| §2.1 | capture フィールド · user confirmed |

> ペア: [`obs-tax-07.md`](obs-tax-07.md) · [`obs-sol-04.md`](obs-sol-04.md) · Schema: [`solidcapturebody.md`](../schema/solidcapturebody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TGT-09 |
| design_section | §7 P4 候補根拠 |
| test_case_id | UT-05-03 |
| test_layer | unit |
| automation | pytest |
| status | **deferred** |

逆 RTM: UT-05-03 — OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · OBS-TGT-09（planned/deferred 混在 · `revrtm-001`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| ADR | `ADR-H-16` §9 |
| Schema | `ObservationTarget.canonical_ids` |
| API | targets/search · commit |
| Lib | Driver 応答マッピング · draft 分離 |
| テスト | `test_ut_05_03_species_user_confirmed_only`（**deferred**） |

## gap 注記

- **deferred**: ルールは TAX-07 と共有確定 — **canonical_ids 分離専用 UT 未緑**。
- **TAX-03/02 連携**: Wikidata/GBIF Driver は候補提示 — 本 FR は **target 側保存契約**。
- **Driver gap**: 未配線でも混在禁止は commit 経路で先行適用（TAX-07 gap 注記同型）。
