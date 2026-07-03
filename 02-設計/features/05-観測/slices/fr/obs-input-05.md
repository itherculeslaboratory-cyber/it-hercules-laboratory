---
slice_id: 05-MICRO-fr-101
type: fr-1id
req_id: OBS-INPUT-05
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-101 — OBS-INPUT-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-05 · OBS-TPL-07 · RTM `status=existing`
- **acceptance**: OBS-INPUT-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

単位（`measurement_unit`）を入力画面から新規追加でき、単位 DD + 「追加」導線で保存値に新規 unit が残ること（**ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 単位 DD 候補 · 「追加」CTA · ユーザー入力 unit 文字列 |
| **Transform** | 候補選択 or 自由入力確定 · 行 draft 更新 |
| **OUT** | `measurement_unit` 付き計測行 · commit 保存 |

## 受入基準

1. 単位 DD + 「追加」導線 — 保存値に新規 unit 残存（§4.9.1）。
2. OBS-TPL-07: テンプレ側単位既定 — 本 FR は **入力画面での追加**正本。
3. UAT-05-15（existing）: INPUT-01〜05 等 **10 req 束ね**（`revrtm-004`）。
4. 未知 unit でも commit 成功 — 辞書 enum 外を **許容**（研究柔軟性）。
5. mm/cm 等の正規化は **任意** — 強制変換は v1 無。

## In / Out 境界

| In | Out |
|----|-----|
| 単位 DD · 自由入力 | measurement_unit |
| 計測行 draft | commit measurements[] |
| — | unit 必須バリデーション（値のみ行は別規則） |
| — | 自動 unit 変換 |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | 単位 DD |
| TPL-07 | [`obs-tpl-07.md`](obs-tpl-07.md) |
| Schema | [`measurementrow.md`](../schema/measurementrow.md) |
| Dict | `measurement_unit` 候補 |

> ペア: [`obs-input-03.md`](obs-input-03.md) · [`obs-input-04.md`](obs-input-04.md) · [`obs-tpl-07.md`](obs-tpl-07.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-05 |
| design_section | §10 単位追加 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 単位 DD · 追加 CTA |
| API | measurements POST |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | UAT-05-15 playwright |

## gap 注記

- **existing**: 単位追加導線実装済 — INPUT-03/04 と **同一 StructuredRow パターン**。
- **TPL-07 分離**: テンプレ既定 unit vs 入力時追加 — slice 分離。
- **SOL-05 交差**: LabelMe mm 換算は固体別 FR — 本 FR は **手入力 unit**のみ。
