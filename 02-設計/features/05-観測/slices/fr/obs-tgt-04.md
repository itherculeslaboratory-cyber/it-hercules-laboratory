---
slice_id: 05-MICRO-fr-052
type: fr-1id
req_id: OBS-TGT-04
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-052 — OBS-TGT-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.11 OBS-TGT-04 · RTM `status=deferred`
- **acceptance**: OBS-TGT-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

生物ドメインの観測対象は **亜種（subspecies）ランクまで到達** するか、未到達の場合は **「亜種未区別（種まで）」を明示** すること。**空確定・曖昧確定は禁止** — ナビゲータ確定ボタンは rank/path が合法なときのみ有効（ADR-H-16 §4.1 · `biological_rank.yaml`）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ナビゲータ選択（検索/質問/ツリー）· `biological_rank` · path 接頭辞 |
| **Transform** | rank=subspecies 到達 **OR** `subspecies_undistinguished=true` 明示 · 未達+未明示 → **確定無効** |
| **OUT** | `ObservationTarget`（domain/path/rank/display_ja/tags）· commit は user confirmed |

## 受入基準

1. ADR-H-16 §4.1: subspecies 未達かつ「未区別」なし → UI 確定ボタン disabled / 400。
2. `biological_rank.yaml` enum と rank 表示が一致 — 空 rank 禁止。
3. UAT-05-02（review/deferred）: OBS-TAX-06（alias）と **acceptance 束ね** — 亜種 UI レビュー待ち。
4. OBS-TGT-09: 外部 ID は候補根拠のみ — rank 確定を代行しない。
5. Phase 1: 生物+器物+custom — 環境/デジタルは TGT-10 境界。

## In / Out 境界

| In | Out |
|----|-----|
| ユーザー選択 path/rank | ObservationTarget 確定 |
| 「亜種未区別」明示フラグ | 種までの合法確定 |
| — | subspecies 未到達の silent 確定 |
| — | GBIF taxonKey からの自動 rank 確定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §7 P4 | 亜種まで / 未区別明示 |
| ADR-H-16 §4.1 | biological rank 契約 |
| §2 | ObservationTarget エンティティ |
| §10 | ナビゲータ UI（文字のみ · TGT-02） |

> Schema: [`biological_rank.yaml`](../../../_横断/schema/schemas/dictionaries/biological_rank.yaml) · UI: [`ui/コンテキスト.md`](../ui/コンテキスト.md) v2 ナビゲータ。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TGT-04 |
| design_section | §7 P4 亜種まで |
| test_case_id | UAT-05-02 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-02 — OBS-TAX-06 · OBS-TGT-04（review/deferred · `revrtm-004` §B）。

## 実装 surface

| 層 | 参照 |
|----|------|
| ADR | `ADR-H-16` §4.1 |
| Schema | `ObservationTarget` · `biological_rank.yaml` |
| UI | 対象ナビゲータ · 確定バリデーション |
| API | targets/search · commit target_ref |
| テスト | UAT-05-02 acceptance review |

## gap 注記

- **deferred**: rank 契約は ADR 確定 — **ナビゲータ UI acceptance 未完了**（Phase 1 生物経路）。
- **TAX-06 review 束ね**: alias 混同と亜種 UI は UAT-05-02 で横断レビュー。
- **TGT-05/06 連携**: 確定 target の path/tags は別 FR — 本 FR は **rank 合法化** のみ。
