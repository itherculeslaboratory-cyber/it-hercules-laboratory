---
slice_id: 05-MICRO-fr-043
type: fr-1id
req_id: OBS-IMG-05
owner: auto
rtm_status: xref
---

# 05-MICRO-fr-043 — OBS-IMG-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.8 OBS-IMG-05 · RTM `status=xref`
- **acceptance**: OBS-IMG-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

類似検索結果に **embedding + color + size + lineage** の多軸 rerank を適用し、科学記録として意味のある「似ている標本」を上位表示すること。v0 重みは [ADR-H-12](../../_横断/adr/ADR-H-12-D02-類似検索重み.md) 暫定 **0.50/0.20/0.20/0.10**（+ qc_boost · view_penalty）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | OBS-IMG-04 subset cosine 候補 · color/size/lineage 特徴 · ADR-H-12 重み表 |
| **Transform** | `final = 0.50×emb + 0.20×color + 0.20×size + 0.10×lineage + qc_boost + view_penalty` |
| **OUT** | rerank 済み `similar[]`（score 降順）· 詳細 UI / Streamlit に表示 |

## 受入基準

1. ADR-H-12 v0 重みを **コード定数または設定** で参照（要件 §⑪ 表と一致）。
2. 固体標本の mm 換算は **LabelMe 境界**（OBS-SOL-05 gap）— rerank の size 軸は **特徴量存在時のみ**。
3. UAT-05-05（review/xref）: search + detail similar 受入 — OBS-IMG-04 · OBS-RAG-01 · OBS-R2-05 等と同束ね。
4. civilization-os 固体は LabelMe/mm — IHL は embedding 特徴中心（横断 xref）。
5. qc_boost / view_penalty は Phase 1 任意 — **欠損時は重み項 0 扱い**（エラーにしない）。

## In / Out 境界

| In | Out |
|----|-----|
| cosine 類似候補（IMG-04） | rerank 済みリスト |
| color/size/lineage 特徴 | 合成 score |
| ADR-H-12 重み | UI 表示順 |
| — | LabelMe 自動 mm 換算（SOL-05） |
| — | 重みなし単純 cosine のみを本 FR 完了と称しない |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.4 | rerank 式 · ADR-H-12 |
| §3.3 | detail `similar[]` |
| 要件 §⑪ | 重み表（☑ ADR-H-12） |

> ADR: [`ADR-H-12-D02-類似検索重み.md`](../../_横断/adr/ADR-H-12-D02-類似検索重み.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-IMG-05 |
| design_section | §2.4 ADR-H-12 |
| test_case_id | UAT-05-05 |
| test_layer | acceptance |
| automation | review |
| status | **xref** |

逆 RTM: UAT-05-05 — OBS-IMG-05 · OBS-IMG-04 planned · OBS-RAG-01 deferred · OBS-R2-05（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `scoring.search_similar` rerank 段 |
| API | detail GET `similar[]` |
| civ-os | LabelMe/mm 換算（xref） |
| UI | Streamlit · capture detail 動的セクション |
| #18 | color feature · QC join（OBS-REP-IHL-04 任意） |

## gap 注記

- **xref**: IHL rerank 式は設計確定 — civ-os LabelMe 連携は **別 repo 正本**。
- **UAT-05-05**: acceptance review 待ち — IMG-04 planned とセットで受入。
- **重み変更**: ADR-H-12 改訂時は本 slice + DET §2.4 を同時更新。
