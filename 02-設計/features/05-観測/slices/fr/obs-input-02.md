---
slice_id: 05-MICRO-fr-098
type: fr-1id
req_id: OBS-INPUT-02
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-098 — OBS-INPUT-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-02 · OBS-TPL-01/02 · RTM `status=existing`
- **acceptance**: OBS-INPUT-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

性別は **任意入力**（`unknown` 既定）で、判明時に後から設定でき、未入力でも保存可能とすること。OBS-TPL-01/02 の表示分岐が動くこと（**ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 性別 DD（male/female/unknown）· テンプレ sex_visibility_rule · ユーザー選択 |
| **Transform** | 未選択 → `unknown` 既定 · テンプレ表示分岐 · commit 保存 |
| **OUT** | capture `sex` フィールド · 計測行表示セット切替 |

## 受入基準

1. 未入力でも保存可能 — `sex=unknown` 既定（§4.9.1）。
2. OBS-TPL-01: 性別トグルで既定表示項目が変化（`sex_visibility_rule`）。
3. UAT-05-15（existing）: INPUT-01〜05 等 **10 req 束ね**（`revrtm-004`）。
4. 判明後の再観測で sex 更新可 — INSERT ONLY 新 capture（UPDATE 禁止）。
5. 性別必須バリデーション **なし** — 研究記録の段階的確定を許容。

## In / Out 境界

| In | Out |
|----|-----|
| 性別 DD 選択 | `sex` フィールド |
| unknown 省略 | 保存成功 |
| — | sex 必須エラー |
| — | 既存 capture の sex UPDATE |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | 性別 DD |
| ADR-H-13 | 雌雄テンプレ切替 |
| TPL-01/02 | [`obs-tpl-01.md`](obs-tpl-01.md) · [`obs-tpl-02.md`](obs-tpl-02.md) |
| Dict | `measurement_name.yaml` sex_visibility_rule |

> ペア: [`obs-tpl-01.md`](obs-tpl-01.md) · [`obs-tpl-02.md`](obs-tpl-02.md) · [`obs-input-01.md`](obs-input-01.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-02 |
| design_section | §10 性別DD |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 性別 DD · テンプレ表示分岐 |
| API | commit `sex` |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | UAT-05-15 playwright |

## gap 注記

- **existing**: UI 実装済 — sex 任意保存は ver1 確定。
- **TPL-01 交差**: 表示分岐はテンプレ FR — 本 FR は **入力任意性**の正本。
- **後追い更新**: 新 capture で sex 変更 — 履歴は event 列で追跡。
