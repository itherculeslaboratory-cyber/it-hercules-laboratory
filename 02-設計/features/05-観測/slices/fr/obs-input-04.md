---
slice_id: 05-MICRO-fr-100
type: fr-1id
req_id: OBS-INPUT-04
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-100 — OBS-INPUT-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-04 · OBS-TPL-03 · RTM `status=existing`
- **acceptance**: OBS-INPUT-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

項目（`measurement_name`）を入力画面から新規追加でき、テンプレ未登録項目でも記録を阻害しないこと（OBS-TPL-03 自由入力導線の **入力側正本** · **ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 辞書 DD 候補 · 「項目を追加」/「＋ 自由入力」 · ユーザー文字列 |
| **Transform** | `MEASUREMENT_NAME_MAP` 正規化 · 計測行 draft · 任意辞書拡張 |
| **OUT** | 正規 `measurement_name` · commit `measurements[]` 行 |

## 受入基準

1. 「項目を追加」で自由入力項目が `measurement` 行として保存（§4.9.1）。
2. OBS-TPL-03: 辞書候補 + 「＋ 自由入力」併存 — 本 FR は **入力画面正本**。
3. UAT-05-15（existing）: INPUT-01〜05 等 **10 req 束ね**（`revrtm-004`）。
4. 日本語ラベル（体長/角長）→ 正規名変換（DET §2.2 · UT-05-06 部分）。
5. テンプレ未登録でも commit 成功 — 辞書拡張 API は **任意**（Wave C）。

## In / Out 境界

| In | Out |
|----|-----|
| 自由入力テキスト | 正規 measurement_name |
| 辞書 DD 選択 | 計測行 |
| — | テンプレ必須による拒否 |
| — | 正規化なし raw 永続 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | MEASUREMENT_NAME_MAP |
| §10 | 項目追加導線 |
| TPL-03 | [`obs-tpl-03.md`](obs-tpl-03.md) |
| Schema | [`measurementrow.md`](../schema/measurementrow.md) |

> ペア: [`obs-tpl-03.md`](obs-tpl-03.md) · [`obs-input-03.md`](obs-input-03.md) · [`obs-input-05.md`](obs-input-05.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-04 |
| design_section | §10 項目追加 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 項目 DD · 自由入力モーダル |
| API | measurements POST · dictionary-extensions |
| Dict | `measurement_name.yaml` |
| テスト | UAT-05-15 · UT-05-06 部分 |

## gap 注記

- **existing**: 自由入力導線実装済 — TPL-03 と **重複ではなく層分離**（テンプレ vs 入力）。
- **辞書拡張**: POST dictionary-extensions は **補助** — 未実行でも commit 可。
- **RD-04 交差**: 構造化行正本 — 自由テキスト単独フィールドは禁止。
