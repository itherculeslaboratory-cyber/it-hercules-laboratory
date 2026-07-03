---
slice_id: 05-MICRO-fr-030
type: fr-1id
req_id: OBS-TAX-07
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-030 — OBS-TAX-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-07 · RTM `status=planned`
- **acceptance**: OBS-TAX-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

外部 ID（GBIF taxonKey · Wikidata QID 等）は **候補根拠として保存** し、commit taxonomy / target 確定値は **user confirmed のみ** とすること（Phase1 · promo-pack · ADR-H-16 §9）。Driver/AI/Context が確定を代行しない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | Driver 候補 · `canonical_ids` draft · WorkflowContext プリフィル |
| **Transform** | 外部 ID → session/draft メタ（根拠テキスト）· commit 時は **ユーザー確定 species/target のみ** Truth 化 |
| **OUT** | capture イベント = user confirmed フィールド · 任意 `canonical_ids` は **非確定メタ** として分離保存 |

## 受入基準

1. GBIF/Wikidata 候補があっても **commit species は UI 確定値**（OBS-SOL-04 · UT-05-03 束ね）。
2. `canonical_ids` は ADR-H-16 — **候補根拠（テキスト）** · 確定値に混ぜない。
3. WorkflowContext 変更だけでは保存レコードが変わらない（OBS-CTX-02 · deferred 含む UT-05-03 束ね）。
4. セッション JSON 検査: 外部 ID が species と **同一フィールド化されていない**（promo-pack 受入）。
5. UT-05-03（planned）: `test_ut_05_03_species_user_confirmed_only` 追加予定。

## In / Out 境界

| In | Out |
|----|-----|
| 外部 catalog ID · Driver 応答 | draft `canonical_ids` |
| ユーザー確定 taxonomy/target | capture Truth |
| — | taxonKey/QID を species 確定として永続 |
| — | Context 自動確定（OBS-CTX-02 禁止） |

## DET 参照

| 節 | 内容 |
|----|------|
| §0 | 外部 ID 候補根拠 |
| §2.1 | capture フィールド · user confirmed |
| §6 | 由来分離 |
| ADR-H-16 §9 | OBS-TGT-09 整合 |
| §10 | 入力 UI · draft 分離 |

> Schema: [`solidcapturebody.md`](../schema/solidcapturebody.md) · dictionaries `biological_rank.yaml` 注記。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-07 |
| design_section | §6 候補根拠 |
| test_case_id | UT-05-03 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-03 — OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · OBS-TGT-09（planned/deferred 混在 · `revrtm-001`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`solidcapturebody.md`](../schema/solidcapturebody.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| ADR | `ADR-H-16` · `ADR-H-15` |
| Lib | `write_solid_capture` · `observation-draft.ts` |
| API | commit · captures POST |
| テスト | `test_ut_05_03_species_user_confirmed_only`（**planned**） |

## gap 注記

- **planned 維持**: 挙動は species 必須で **既存緑** — 専用 UT と canonical_ids 分離断言が RTM 差分。
- **TAX-01 ペア**: 型分離（gap）vs 挙動分離（本 FR planned）— 両方必要。
- **Driver gap**: TAX-02/03 未配線でも **混在禁止ルール** は commit 経路で先行適用。
