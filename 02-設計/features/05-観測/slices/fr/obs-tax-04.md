---
slice_id: 05-MICRO-fr-027
type: fr-1id
req_id: OBS-TAX-04
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-027 — OBS-TAX-04

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-04 · RTM `status=review`
- **acceptance**: OBS-TAX-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**Local R2 Catalog**（飼育・個体・ユーザー世界）の正本行を API で提供し、観測対象入力（Wave B）で **domain 別ラベル候補** を返すこと。legacy `solidUserSpeciesCatalog` 相当 — IHL は `TARGET_CATALOG` 定数 + catalog/search API で **部分実装**（IT-05-06 · review）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | domain キー · 任意 query substring（search） |
| **Transform** | `TARGET_CATALOG` / 将来 R2 行から substring フィルタ · rank/label 整形 |
| **OUT** | `{ status, domains \| items[] }` — **READ 専用** · event store 書込なし |

## 受入基準

1. `GET /api/v1/observation/targets/catalog` → `domains` 5 キー（biological/artifact/digital/environment/custom）。
2. `POST /api/v1/observation/targets/search` → `{ status, domain, items[] }` substring フィルタ。
3. IT-05-06（review）: `test_commit_capture_is_searchable_without_parquet` · catalog 利用 **integration 部分緑**。
4. 候補は **確定しない** — ユーザー最終選択（OBS-TGT-03 · ADR-H-16）。
5. **review 維持**: R2 永続 catalog 行（ユーザー追加種）は **将来拡張** — 現状は定数正本。

## In / Out 境界

| In | Out |
|----|-----|
| TARGET_CATALOG · 将来 user catalog R2 | API 候補リスト |
| Wave B 入力 UI | — |
| — | GBIF/Wikidata 外部 catalog（TAX-02/03） |
| — | catalog 行の commit 自動確定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.3 | catalog · targets/search |
| §3.9 | Wave B route 表 |
| ADR-H-16 | domain · 3 経路 |
| §7 | solidUserSpeciesCatalog 相当 |

> API: [`get-api-v1-observation-targets-catalog.md`](../api/get-api-v1-observation-targets-catalog.md) · [`post-api-v1-observation-targets-search.md`](../api/post-api-v1-observation-targets-search.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-04 |
| design_section | §2.3 catalog |
| test_case_id | IT-05-06 |
| test_layer | integration |
| automation | pytest |
| status | **review** |

逆 RTM: IT-05-06 — OBS-TAX-04 · OBS-IMG-04（`revrtm-002` · review/planned 混在）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | api-005 catalog · api-014 targets/search |
| Schema | [`observationtargetsearchrequest.md`](../schema/observationtargetsearchrequest.md) |
| Code | `apps/api/routes/observation.py` `TARGET_CATALOG` |
| テスト | `test_ut_wave_b_target_catalog_available` · IT-05-06 |
| 将来 | R2 ユーザー catalog 行 · INSERT ONLY |

## gap 注記

- **tier-a / review**: 定数 catalog は **動作する** — 「Local R2 正本行」への移行は acceptance レビュー待ち。
- **orphan-test**: `test_ut_wave_b_target_catalog_available` → IT-05-06 共有可（revrtm-001）。
- **TAX-06**: catalog biological 例に `Dynastes hercules hercules` — display_alias は別 FR。
