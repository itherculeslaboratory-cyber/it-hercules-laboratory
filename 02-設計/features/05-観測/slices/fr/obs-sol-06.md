---
slice_id: 05-MICRO-fr-006
type: fr-1id
req_id: OBS-SOL-06
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-006 — OBS-SOL-06

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-06 · RTM `status=review`
- **acceptance**: OBS-SOL-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測写真・標本表示において **撮影条件（照明・背景・カメラ等）を併記** し、表示パイプラインで **色補正・明るさ加工を行わない** こと。科学記録の再現性と `ui-reference/preferences.md` §C（観測写真は色を弄らない）を満たす。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー入力 `photo_conditions[]`（item/value/unit/method）· 生写真 blob · 撮影条件テキスト |
| **Transform** | commit TX で `capture/photo_condition` INSERT · 画像は **raw 保存**（補正フィルタ無） |
| **OUT** | 詳細 GET の `photo_conditions[]` + `GET …/image` が **原画相当** blob · UI に条件テキスト表示 |

## 受入基準

1. commit body `photo_conditions[]` が event store に永続（[`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md)）。
2. 画像 GET は `image/jpeg` raw — CSS/Canvas による **自動色補正 UI 禁止**（preferences §C）。
3. 詳細画面に撮影条件が **3 行以内サマリー** で併記（U-* DoD）。
4. UAT-05-01（acceptance review）: 色補正なし表示がレビュー受入。
5. 空 photo_conditions でも commit 可 — 条件未入力は空配列（エラーにしない）。

## In / Out 境界

| In | Out |
|----|-----|
| 撮影条件構造化行 | photo_condition イベント |
| 原画写真 | R2 raw blob · image GET |
| — | #18 embedding/QC/color feature **生成** |
| — | ユーザー向け「自動補正」機能 |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3.1 | 詳細 GET `photo_conditions[]` |
| §6 | 非機能 · 空/エラー全経路 |
| §10 | PhotoAddCard · PhotoEnvCard · StructuredRow |
| preferences §C | 色補正禁止（ui-reference 正本） |

> 画像 route 詳細は [`get-api-v1-observation-capture-id-image.md`](../api/get-api-v1-observation-capture-id-image.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-06 |
| design_section | §6 色補正なし |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **review** |

逆 RTM: UAT-05-01 は OBS-SOL-06/08 · OBS-DIG-01/02 · OBS-CTX-01 · OBS-NF-05 を束ねる。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md) · [`templatephotoconditionrow.md`](../schema/templatephotoconditionrow.md) |
| API | [`get-api-v1-observation-capture-id-image.md`](../api/get-api-v1-observation-capture-id-image.md) · commit API |
| Screen | [`observation-capture-id.md`](../screens/observation-capture-id.md) · input photo chunks |
| Web | `PhotoAddCard` · `StructuredRow` |

## gap 注記

- **RTM review · tier-a**: API/永続は existing — **UI 色補正監査** と acceptance レビューが残（UAT-05-01）。
- **DIG ホーム分離**: OBS-DIG-01/02 は同 UAT 束ね — 本 FR は写真表示品質に集中。
- **自動補正検出**: E2E スクリーンショット比較は SHIP ゲート側 — 本 slice は要件意図の固定。
