---
slice_id: 05-MICRO-fr-026
type: fr-1id
req_id: OBS-TAX-03
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-026 — OBS-TAX-03

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-03 · RTM `status=gap`
- **acceptance**: OBS-TAX-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**Wikidata Driver** が汎用物体・QID **候補**を draft 観測（デジタル/artifact ドメイン含む）に提示し、確定値へ混ぜないこと（TOT-OBS-02 · total-observation-roadmap §3.1）。IHL **runtime 未配線（gap）**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ラベル検索 · domain（artifact/digital/custom） |
| **Transform** | Wikidata SPARQL/REST 照会 · QID 候補生成 |
| **OUT** | `{ label, qid, source: "wikidata" }` 候補 · commit 未確定 |

## 受入基準

1. QID は **候補根拠** — `canonical_ids.wikidata` 等にテキスト参照可（OBS-TAX-07 · OBS-TGT-09）。
2. 確定 target/taxonomy は **ユーザー最終確認**（OBS-SOL-04 · ADR-H-16 §4）。
3. **gap 維持**: UAT-05-07 束ね — Wikidata Driver **未配線**。
4. UI 用 **画像取得しない**（ADR-H-16 · 外部 catalog はテキスト根拠のみ）。
5. オフライン/レート制限: 空候補 + 理由（NF-04）。

## In / Out 境界

| In | Out |
|----|-----|
| Wikidata API · 検索語 | TaxonomyCandidate / target 候補 |
| Wave B デジタル/artifact 入力 | — |
| — | QID を確定 ID として commit |
| — | Wikidata メディア画像の UI 表示 |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P1 | Driver runtime gap |
| ADR-H-16 | 3 経路 · 候補のみ |
| §0 | 外部 catalog 混同禁止 |
| §7 | TOT-OBS-02 |

> Schema: [`observationtargetsearchrequest.md`](../schema/observationtargetsearchrequest.md) — READ 専用 catalog とは別 Driver。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-03 |
| design_section | §7 P1 Wikidata |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-TAX-02/03/05 等（`revrtm-004` §C gap 束ね）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 将来 | Wikidata Driver · OBS-DRV-01 |
| Schema | `observation_target_domain.yaml` external_catalog 注記 |
| Screen | 観測対象ナビゲータ（Phase 2 · deferred） |
| テスト | UAT-05-07 · **gap** |

## gap 注記

- **tier-a / gap**: TOT-OBS-02 backlog — GBIF（TAX-02）と **同時 P1 解禁**想定。
- **TAX-04 境界**: Local R2 Catalog は **ユーザー世界正本** — Wikidata は外部候補のみ。
- **粉飭禁止**: Driver 未配線を existing としない。
