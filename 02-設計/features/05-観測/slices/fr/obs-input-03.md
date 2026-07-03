---
slice_id: 05-MICRO-fr-099
type: fr-1id
req_id: OBS-INPUT-03
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-099 — OBS-INPUT-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-03 · OBS-TPL-03/07 · RTM `status=existing`
- **acceptance**: OBS-INPUT-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

計測行 DD の末尾に **「追加」** を固定表示し、行内で新規行を即時追加できること（Phase6 打鍵 FB · **ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 既存計測行リスト · 「追加」CTA タップ · StructuredRow 状態 |
| **Transform** | 空行挿入 · DD フォーカス · draft 状態更新 |
| **OUT** | 新計測行 UI · commit 時 `measurements[]` へマージ |

## 受入基準

1. DD 最下段に **「追加」** 固定表示（§4.9.1 · 入力 UI 設計）。
2. 選択で新行即時挿入 — ページ遷移 **不要**。
3. UAT-05-15（existing）: INPUT-03/04/05 等 **10 req 束ね**（`revrtm-004`）。
4. OBS-TPL-07: 単位行も同型「追加」導線 — 計測行と **独立**だが UX 一貫。
5. 空行のまま commit → 空行は **strip** または 400（バリデーション slice 参照）。

## In / Out 境界

| In | Out |
|----|-----|
| 「追加」CTA | 新 StructuredRow |
| 既存行 draft | measurements[] |
| — | 行数上限による追加拒否（v1 無） |
| — | テンプレ必須による行追加拒否 |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | 計測行 UI |
| UI | [`入力UI設計-v1.md`](../../ui/入力UI設計-v1.md) §計測行 |
| TPL-03 | [`obs-tpl-03.md`](obs-tpl-03.md) |
| ROW | [`obs-rx-row-01.md`](obs-rx-row-01.md) |

> ペア: [`obs-input-04.md`](obs-input-04.md) · [`obs-input-05.md`](obs-input-05.md) · [`obs-tpl-07.md`](obs-tpl-07.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-03 |
| design_section | §10 行DD追加 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `StructuredRow.tsx` · 追加 CTA |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | UAT-05-15 playwright |

## gap 注記

- **existing**: StructuredRow 実装済 — UAT-05-15 束ね acceptance。
- **INPUT-04/05 補強**: 項目/単位「追加」は別 FR — 導線は **独立**だが同一画面。
- **空行処理**: commit バリデーションは schema/error slice 正本。
