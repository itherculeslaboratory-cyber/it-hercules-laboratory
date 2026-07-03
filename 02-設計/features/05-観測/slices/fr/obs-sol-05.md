---
slice_id: 05-MICRO-fr-005
type: fr-1id
req_id: OBS-SOL-05
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-005 — OBS-SOL-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-05 · RTM `status=gap`
- **acceptance**: OBS-SOL-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体観測計測が **LabelMe 互換 shapes** で記述でき、ピクセル計測から **mm 換算** され、ScreenDef テンプレが入力ガイドとして機能すること（REQ-011）。研究再現のため、画像上アノテーションと commit 計測行の **対応表** が文書化される。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | LabelMe JSON shapes · スケール参照（mm/pixel）· ScreenDef テンプレ計測項目 · ユーザー確定換算係数 |
| **Transform** | shapes → 計測行（body_length_mm 等）写像 · テンプレ ScreenDef が入力 UI をガイド · mm 換算ルール適用 |
| **OUT** | commit `rows[]` に image_derived / manual 計測 INSERT · LabelMe 互換 export（将来） |

## 受入基準

1. `docs/solid-labelme-shapes-commit-map.md` に shape 種別 → measurement_name 対応が定義されている。
2. mm 換算式と単位が計測行に記録される（`measurement_unit` · `measurement_method`）。
3. ScreenDef テンプレ経由で計測項目ラベルが入力 UI に表示される（OBS-TPL 整合）。
4. UAT-05-07（acceptance review）で LabelMe 経路がレビュー受入可能。
5. **IHL 現状**: commit 手入力 rows は existing — LabelMe **自動パイプライン** は未配線（gap 明示）。

## In / Out 境界

| In | Out |
|----|-----|
| LabelMe template · shapes JSON | 計測行（mm） |
| ScreenDef ガイド定義 | UI 計測ラベル |
| — | embedding / QC 生成（#18） |
| — | UIBuilder fork v2 本体（#16 境界） |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P1 | 全 Driver runtime gap（LabelMe 含む周辺） |
| §1.2 Out | 写真解析生成は #18 |
| §2.2 | measurement_method · value_origin 写像 |
| REQ-011 | LabelMe 互換正本（civilization-os salvage） |

> commit rows 契約は [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md) — LabelMe 専用 API は **未存在**。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-05 |
| design_section | §7 P2 LabelMe |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 は OBS-SOL-05 · OBS-TAX-02/03/05 · OBS-REP-* · OBS-DRV-01 · OBS-INPUT-06/07 を束ねる（`revrtm-004` · gap 多）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 設計 salvage | `docs/solid-labelme-shapes-commit-map.md`（civilization-os 参照） |
| Schema | [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md) |
| 関連 FR | OBS-TPL-* · #16 UIbuilder `labelme_template` |
| 実装 | **IHL 未配線** — 手入力 rows のみ existing |

## gap 注記

- **RTM gap · tier-a**: LabelMe→commit 自動変換 · mm 換算パイプラインは **IHL rebuild スコープ外（P2）** — 設計 doc のみ。手動計測で OBS-SOL-01/03 は成立。
- **代替導線**: テンプレ LIST/DETAIL（[`get-api-v1-observation-templates.md`](../api/get-api-v1-observation-templates.md)）+ 手入力 rows — CONTINUE_QUEUE 延期 ID 参照可。
- **人間判断**: ScreenDef ガイドの IHL 再実装要否は Tier A レビュー対象。
