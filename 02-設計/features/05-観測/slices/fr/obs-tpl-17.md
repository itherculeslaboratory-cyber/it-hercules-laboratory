---
slice_id: 05-MICRO-fr-049
type: fr-1id
req_id: OBS-TPL-17
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-049 — OBS-TPL-17

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-17 · RTM `status=planned`
- **acceptance**: OBS-TPL-17 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**計測テンプレ詳細 DETAIL 画面**（`/observation/templates/:id`）で項目リスト閲覧と **記録 / Fork / 編集** 導線を提供すること。一覧からの管理フロー中核（UI設計 §3 · 遷移設計 §3）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `GET /templates/{template_id}` · `template_id` ルート param · WorkflowContext クエリ |
| **Transform** | 計測行 · 撮影条件 · interval metadata 正規化表示 · CTA（記録/Fork/編集） |
| **OUT** | DETAIL UI · 404 不在時エラー導線 · INPUT へのテンプレ展開（TPL-13） |

## 受入基準

1. ルート `/observation/templates/:id` — 項目リスト閲覧（UI設計 §3）。
2. `GET /api/v1/observation/templates/{id}` — 404 不在（[`errors/404.md`](../errors/404.md)）。
3. UT-05-09（planned）: `test_ut_05_09_template_detail_not_found`。
4. 〔このテンプレで記録〕→ INPUT へ **species/stage クエリ引き継ぎ**（OBS-CTX-01 · 遷移 §58）。
5. Fork 導線は **3 クリック以内**（詳細 → 複製 → 保存 · OBS-NF-03）。

## In / Out 境界

| In | Out |
|----|-----|
| template_id | 正規化テンプレ 1 件 |
| WorkflowContext | INPUT プリフィル |
| — | テンプレ作成フォーム（TPL-10） |
| — | community fork 本番（TPL-20 ver2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3 | `GET /templates/{id}` DETAIL |
| §10 | テンプレ詳細 Web |
| 遷移 | `05-観測-計測テンプレ-遷移設計-v1.md` §3 |

> API: [`get-api-v1-observation-templates-template-id.md`](../api/get-api-v1-observation-templates-template-id.md) · UI: 計測テンプレ UI §3。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-17 |
| design_section | §3.3 DETAIL |
| test_case_id | UT-05-09 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-09 — OBS-TPL-17 のみ（`revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `GET /api/v1/observation/templates/{id}` |
| Screen | template detail · 404 空状態 |
| Schema | [`templatemeasurementrow.md`](../schema/templatemeasurementrow.md) |
| テスト | UT-05-09 retrofit 待ち |
| 遷移 | DETAIL → INPUT · DETAIL → Fork |

## gap 注記

- **planned**: API 契約は slice 確定 — **UT-05-09 未緑**。
- **TPL-16 連携**: UAT-05-06 は LIST+DETAIL 束ね — acceptance はセット受入。
- **mock PNG**: 詳細 mock 仕様のみ — UI は既存コンポーネント準拠。
