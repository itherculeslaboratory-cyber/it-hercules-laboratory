# ADR-H-01: UIbuilder スコープ — FR-16-REFRAME 採用（H-01 = B）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-01  
> **正本**: 本 ADR · [`16-UIbuilder.md`](./16-UIbuilder.md) §12.7 · [`00-Phase0前-人間ToDoとAuto下準備.md`](../05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md)

---

## 文脈

16 UIbuilder について、legacy **Phase8 汎用 Builder**（fork・Driver・CI 等）と、ユーザー設計再定義 **FR-16-REFRAME**（配置 + デザイン + catalog 紐づけのみ）が並存していた。

## 決定

**選択肢 B を採用** — **FR-16-REFRAME を UIbuilder の要件正本**とする。

| 項目 | 内容 |
|------|------|
| UIbuilder スコープ | **配置**（ScreenDef ブロック構成・D&D・section/list）+ **デザイン**（トークン・プレビュー・L1 見出し編集）+ **既存 catalog からの選択・紐づけ** のみ |
| スコープ外 | 新 Component/API invent、Driver 本番接続、観測テンプレートスキーマ編集、fork プロトコル実装、META core 編集、R2 運用 UI（各 FeatureNode / pipeline へ分離） |
| 理由（ユーザー） | 設計がすっきりする · UX が単純 · 機能過多で UI が難しくなる |

## Phase8 の扱い

- `design/phases/Phase8_builder_universal.md` の **汎用 Builder 機能要件は UIbuilder FR から切り離す**（FR-16-REFRAME-08 準拠）。
- Phase8 の **route 分類・カバレッジ・Pilot-B13** 等は **platform ドキュメント / CI** として維持（UIbuilder から read-only リンク可）。
- 実装タイミングで `accepted_requirements.csv` へ FR-16-REFRAME-* の採用行を追記する（本 ADR は要件層の確定）。

## 影響

- **詳細設計・遷移・UI** は UI-only Builder + catalog 契約を前提に進めてよい（設計ゲート 4 点の人間確定は別途）。
- civ-os 側 Phase8 への **新規機能追加は禁止**（既存バグ修正・REQ-027 維持は除外）。

## 参照

- [`16-UIbuilder.md`](./16-UIbuilder.md) §12.7 · §14
- [`00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md`](../05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md) Step A1
