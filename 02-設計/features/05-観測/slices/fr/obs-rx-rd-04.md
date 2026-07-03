---
slice_id: 05-MICRO-fr-086
type: fr-1id
req_id: OBS-RX-RD-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-086 — OBS-RX-RD-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-04 · OBS-PHOTO-01 · OBS-TAX-07 · §4.18 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**構造化入力** — 計測行（`measurement_name` 辞書）· 撮影条件行（OBS-PHOTO-01）· taxonomy（OBS-TAX-07）— を正本とし、**自由テキスト単独フィールドを正本にしない**こと。RAG 出力が facet 可能な JSON 契約。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | StructuredRow UI · measurement dictionary · photo condition schema · taxonomy facet |
| **Transform** | `measurements[]` · `photo_conditions[]` · `environment_snapshot` **分離保存**（B モデル） |
| **OUT** | commit JSON — 辞書駆動 enum/構造化のみ · 自由テキスト単独 reject |

## 受入基準

1. 計測行: `measurement_name` は辞書 enum — 未知は 400 または警告（DET §9.1）。
2. 撮影条件: OBS-PHOTO-01 構造化スロット — 温湿度自動マージ **禁止**（ROW-03）。
3. taxonomy: OBS-TAX-07 facet 可能 JSON — 単一 memo フィールドを正本にしない。
4. UAT-05-15（planned）: OBS-INPUT-01〜05 · PHOTO-01 · TPL-18/19 等 **10 req 束ね** — playwright retrofit 緑（`revrtm-004`）。
5. §4.16.7 検証束 #4: 構造化行のみ保存 · 自由テキスト単独フィールドなし。

## In / Out 境界

| In | Out |
|----|-----|
| StructuredRow · 辞書 enum | 構造化 commit JSON |
| taxonomy facet | RAG facet 可能出力 |
| — | 自由テキスト単独正本 |
| — | 撮影条件への温湿度自動注入（ROW-03 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `measurements[]` · `photo_conditions[]` 分離 |
| §4.18 | B モデル · OBS-RX-ROW-* |
| §9.6 | measurement dictionary |
| PHOTO/TAX | OBS-PHOTO-01 · OBS-TAX-07 要件 |

> ペア: [`obs-rx-row-01.md`](obs-rx-row-01.md) · [`obs-photo-01.md`](obs-photo-01.md) · [`obs-tax-07.md`](obs-tax-07.md) · measurement-dictionary API slice。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-04 |
| design_section | §9.1 構造化行 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing retrofit 緑 · planned 維持）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `StructuredRow.tsx` · group prop |
| API | measurement dictionary · commit validation |
| Lib | B モデル commit 分離 |
| テスト | UAT-05-15 playwright · ver2_uat_seed pytest retrofit |

## gap 注記

- **planned 維持**: 構造化 UI 実装あり — UAT-05-15 は **10 req 束ね** · 個別 FR 粉飭禁止。
- **ROW 系列**: ROW-01〜09 が UI 実装 · RD-04 は **研究品質の正本宣言** — slice 分離。
- **RAG facet**: 出力 JSON が taxonomy/measurement で facet 可能かは **別監査**（REP 系列）。
