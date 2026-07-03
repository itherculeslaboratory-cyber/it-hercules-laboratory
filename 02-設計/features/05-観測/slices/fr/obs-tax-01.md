---
slice_id: 05-MICRO-fr-024
type: fr-1id
req_id: OBS-TAX-01
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-024 — OBS-TAX-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-01 · RTM `status=gap`
- **acceptance**: OBS-TAX-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

taxonomy における **候補（TaxonomyCandidate）** と **ユーザー確定（UserConfirmedTaxonomy）** を **型レベルで分離** し、Driver/AI 出力が commit Truth に混在しないこと（TOT-OBS-01 · REQ-026 §3.2）。IHL 現状は挙動分離（OBS-SOL-04）のみ — **schema 厳密分離は gap**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | Driver 候補 · GBIF taxonKey · draft プリフィル |
| **Transform** | 候補型 → UI 提示のみ · 確定型 → commit body 検証 · **型変換で自動確定禁止** |
| **OUT** | `UserConfirmedTaxonomy` 相当フィールドのみ event store INSERT · 候補は session draft 側 |

## 受入基準

1. Pydantic/schema に **Candidate vs Confirmed の別モデル**（TOT-OBS-01 backlog）。
2. 検索 `POST /search` filters は **whitelist のみ** — 未知キー → 400（`CaptureSearchRequest` · UT-05-08 部分）。
3. UT-05-08（gap）: `test_ut_05_08_search_rejects_unknown_filter` — whitelist **部分 existing**。
4. commit species は **確定値のみ** — Candidate フィールドを capture に書かない（OBS-SOL-04 整合）。
5. **gap 維持**: 型分離完全形 · TOT-OBS-01 実装は **IHL 未配線**（DET §7.2 P6）。

## In / Out 境界

| In | Out |
|----|-----|
| TaxonomyCandidate（Driver/AI） | UI 候補リスト |
| UserConfirmedTaxonomy（ユーザー確定） | capture/commit 属性 |
| — | 候補を確定値として永続 |
| — | GBIF/Wikidata runtime（OBS-TAX-02/03 gap） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.3 | 検索 whitelist · `ALLOWED_FILTERS` |
| §7.2 P6 | TaxonomyCandidate/UserConfirmed gap |
| §6 | 由来分離 · 検索安全 |
| §0 | 確定は常にユーザー |

> Schema: [`capturesearchrequest.md`](../schema/capturesearchrequest.md) · [`solidcapturebody.md`](../schema/solidcapturebody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-01 |
| design_section | §2.3 §7 P6 型分離 |
| test_case_id | UT-05-08 |
| test_layer | unit |
| automation | pytest |
| status | **gap** |

逆 RTM: UT-05-08 — OBS-TAX-01 のみ（`revrtm-001` · gap 要件 · テスト部分存在）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`capturesearchrequest.md`](../schema/capturesearchrequest.md) |
| Lib | `libs/ihl/observation/query.py` `ALLOWED_FILTERS` |
| API | [`post-api-v1-observation-search.md`](../api/post-api-v1-observation-search.md) |
| 将来 | TOT-OBS-01 型定義 · `schemas/dictionaries/biological_rank.yaml` |
| テスト | `test_ut_05_08_*`（whitelist 部分） |

## gap 注記

- **tier-a / gap**: 型分離は **設計のみ** — 挙動は SOL-04/TAX-07 でカバー、RTM は gap のまま。
- **UT-05-08 矛盾解消**: テスト存在 ≠ 要件完走 — 粉飭禁止（revrtm-001 注記）。
- **P6 優先度**: Phase 6 backlog — Driver runtime（P1）より後でも可。
