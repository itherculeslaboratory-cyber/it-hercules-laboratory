---
slice_id: 05-MICRO-fr-104
type: fr-1id
req_id: OBS-PHOTO-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-104 — OBS-PHOTO-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-PHOTO-01 · OBS-RX-RD-04 · OBS-RX-08 · RTM `status=existing`
- **acceptance**: OBS-PHOTO-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

撮影条件は自由テキスト単一欄でなく、**計測行と同様の構造化行**（項目 DD + 値 + 単位 + 追加）で入力し、RAG へ構造化出力されること（**ver1 IN** · 色補正禁止は preferences §C）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | StructuredRow（photo group）· 照明/角度/背景/露出等スロット · 追加 CTA |
| **Transform** | `photo_conditions[]` 組立 · 温湿度自動マージ **禁止**（ROW-03） |
| **OUT** | commit `photo_conditions[]` · RAG facet 可能 JSON |

## 受入基準

1. 例: 照明/角度/背景/露出を行追加で管理 — 自由テキスト単一欄 **禁止**（§4.9.1 · RD-04）。
2. 計測行と同型 UI — 項目 DD + 値 + 単位 + 「追加」（INPUT-03 パターン）。
3. UAT-05-15（existing）: PHOTO-01 · INPUT-01〜05 · TPL-18/19 等 **10 req 束ね**（`revrtm-004`）。
4. OBS-RX-08: 撮影条件と env snapshot **分離** — 自動注入禁止。
5. 色補正なし — 表示用明るさ変更禁止（ui-reference/preferences.md §C）。

## In / Out 境界

| In | Out |
|----|-----|
| StructuredRow photo | photo_conditions[] |
| 辞書スロット | RAG 構造化出力 |
| — | 自由テキスト単一 memo 正本 |
| — | 温湿度の photo_conditions 自動注入 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | photo_conditions[] 分離 |
| §4.18 | B モデル · ROW 系列 |
| RD-04 | [`obs-rx-rd-04.md`](obs-rx-rd-04.md) |
| Schema | [`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md) |

> ペア: [`obs-rx-rd-04.md`](obs-rx-rd-04.md) · [`obs-rx-rep-04.md`](obs-rx-rep-04.md) · [`obs-rx-row-03.md`](obs-rx-row-03.md) · [`obs-rx-08.md`](obs-rx-08.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-PHOTO-01 |
| design_section | §10 撮影条件行 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-PHOTO-01 · OBS-INPUT-01〜05 · OBS-RX-RD-04 · OBS-RX-REP-04 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `StructuredRow.tsx` group=photo |
| Schema | [`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md) |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | UAT-05-15 playwright |

## gap 注記

- **existing**: StructuredRow photo 実装済 — UAT-05-15 束ね acceptance。
- **RX-REP-04 交差**: 機材メタ（camera_body 等）は別列 — photo_conditions は **条件行**のみ。
- **RAG facet**: 出力 JSON facet 可能かは REP 系列監査 — 本 FR は **入力契約**。
