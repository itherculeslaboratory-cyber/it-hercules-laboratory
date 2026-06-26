# 17 UI選択画面改善 — UI 設計 v1

> **ステータス**: 草案 v1 · Batch 6 · **OS 切替は Phase 2 スコープ外**
> **前提**: [`17-UI選択画面改善-詳細設計-v1.md`](./17-UI選択画面改善-詳細設計-v1.md)

---

## 1. スコープ外（明記）

| 項目 | 理由 |
|------|------|
| civ-os `/dev/world-routing` 実装 | IHL rebuild 対象外 · salvage 参照のみ |
| L4 fork Apply 本体 | 16 UIbuilder に委譲 |

---

## 2. 主タスク

**「推奨テンプレを選び、自分のホーム導線に適用する」**

---

## 3. モック

![UI テンプレ選択](../02-設計/_ui-global/mockups/mockups/mockups/ihl-17-world-template-picker.png)

> **2026-06-09**: `ihl-17-world-template-picker.png` 生成済 · walkthrough `17picker`。

---

## 4. チャンク

1. default / recommended / custom タブ
2. テンプレカード（likes · PT votes）
3. 必須機能ゲート警告
4. 〔適用する〕主ボタン

---

*Batch 6*
