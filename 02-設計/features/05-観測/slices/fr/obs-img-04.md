---
slice_id: 05-MICRO-fr-042
type: fr-1id
req_id: OBS-IMG-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-042 — OBS-IMG-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.8 OBS-IMG-04 · RTM `status=planned`
- **acceptance**: OBS-IMG-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 capture 集合に対し **metadata 絞り込み → subset 上の cosine 類似検索** を実行し、個体画像の発見・詳細導線を支えること。IHL Phase 1 は **Streamlit search UI** が主戦場（要件 §⑦）— Web `/observation` 詳細の `similar[]` は **locator parquet 有時** の補助（DET §2.4）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `POST /search` filters（whitelist）· embedding 索引 · locator parquet · クエリ capture 特徴 |
| **Transform** | metadata で subset 抽出 → subset 内 cosine 類似度計算 · **locator 無時は similar 空/skip** |
| **OUT** | 類似 capture 候補リスト（`similar[]` · score 付き）· 詳細 GET へ遷移可能な `capture_id` |

## 受入基準

1. 検索 filters は **whitelist のみ**（OBS-TAX-01 整合）— 未知キー → 400。
2. `search_similar` は **locator parquet 存在時のみ** 実行（DET §2.4 · GAP-IT-04）。
3. IT-05-06（planned）: `test_commit_capture_is_searchable_without_parquet` — search→detail 前段。
4. UAT-05-05（review）: similar 条件付き search + detail 受入（OBS-IMG-05 と同束ね）。
5. embedding 生成自体は OBS-IMG-03（#18）— 本 FR は **検索クエリ・subset cosine** に限定。

## In / Out 境界

| In | Out |
|----|-----|
| Whitelist 検索 filters | subset capture 集合 |
| DINOv2 embedding（OBS-IMG-03） | cosine 類似スコア |
| locator parquet | `similar[]` 応答 |
| — | rerank 重み合成（OBS-IMG-05） |
| — | locator 無時の捏造 similar |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.4 | 類似検索 · `search_similar` |
| §2.3 | 検索 whitelist |
| §3.3 | `GET /{capture_id}` similar[] |
| §10 | Streamlit search UI |

> API: [`post-api-v1-observation-search.md`](../api/post-api-v1-observation-search.md) · [`get-api-v1-observation-capture-id.md`](../api/get-api-v1-observation-capture-id.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-IMG-04 |
| design_section | §2.4 §3.3 similar |
| test_case_id | IT-05-06 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-06 — OBS-IMG-04 · OBS-TAX-04（`revrtm-002` · review/planned 混在）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `scoring.search_similar` · `libs/query.py` |
| API | search · detail GET |
| UI | `ui/Streamlit.md` · `observation-capture-id.md` 動的セクション |
| テスト | `test_observation_e2e.py` · IT-05-06 retrofit 待ち |
| #18 | embedding_builder_dinov2 · locator parquet |

## gap 注記

- **planned**: search 基盤は existing — **similar[] locator 条件付き** で planned 維持。
- **GAP-IT-04**: locator 無時 skip は意図 — 粉飭で existing にしない。
- **ver2 UI polish**: G10 観測検索詳細 UI は ver2 done 注記 — API 契約は本 FR で固定。
