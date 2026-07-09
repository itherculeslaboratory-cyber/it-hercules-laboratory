# 05 観測 — DESIGN READINESS v1

> **日付**: 2026-07-05  
> **執筆**: [#05 UI設計完成度監査](f214e24d-c6fe-44e4-b195-f597bd1f274f)  
> **前提**: [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md) 承認済み

---

## 1. 短答（3問）

| 質問 | 回答 |
|------|------|
| **遷移図は設計済みか** | **はい。** 正本 [`遷移設計-v2.md`](../../../02-設計/features/05-観測/遷移設計-v2.md)（2026-06-21 人間レビュー済）。context → input → confirm → done。 |
| **UI（ボタン・色・好み）は完了か** | **input/confirm はほぼ完了**（[`ui/観測入力-v2.md`](../../../02-設計/features/05-観測/ui/観測入力-v2.md) + confirm slice）。**context** は [`ui/コンテキスト.md`](../../../02-設計/features/05-観測/ui/コンテキスト.md) で mock 人間 OK だが doc 上「草案」。色・CTA は preferences §A/B を各 UI doc に転写済み。 |
| **新規 UI 設計フェーズは要るか** | **不要（スキップ可）。** 残りは doc 整合（ui-copy-spec v2）と lab index（`05confirm`）のみ。 |

---

## 2. 正本マップ

| 画面 | 遷移 | UI | 主 CTA | 色 |
|------|------|-----|--------|-----|
| **05ctx** | 遷移 v2 + コンテキスト §5 | `ui/コンテキスト.md` | **〔適用〕** | 背景 `#0D0D0D` · カード `#1A1A1A` · 情報 `#4DA3FF` |
| **05i** | 遷移 v2 §2 | `ui/観測入力-v2.md` | **〔確認へ〕**（保存 terminal 禁止） | 注意 `#FFD66B` · 情報 `#4DA3FF` |
| **05confirm** | 遷移 v2 §4 | `slices/screens/observation-confirm.md` + 入力 v2 §3.5 | **〔登録する〕** | 同上トークン |

Charter Q1/Q2（3-click）· Q8（mock より UX）· Q9（4 状態）は checklist / 遷移 v2 で充足。

---

## 3. フロー（設計正本）

```text
05ctx 〔適用〕
  → 05i 〔確認へ〕
    → 05confirm 〔登録する〕
      → done
```

---

## 4. ギャップ（新規 UI 設計ではない）

| ID | 内容 | 対応 |
|----|------|------|
| G1 | `05confirm` が `screens.json` 未登録 | lab index 追加（実装時） |
| G4 | `ui-copy-spec/05-観測-v1.md` が 05i=「保存」· confirm 行なし | **解消** — [`ui-copy-spec/05-観測-v2.md`](./ui-copy-spec/05-観測-v2.md) 作成済 |
| G5 | `ui/コンテキスト.md` がゲート上「草案」 | **解消** — `ui/コンテキスト.md` §8 lab oracle addendum 追加済 |

---

## 5. HOME 再構築前の doc タスク

1. **`ui-copy-spec/05-観測-v2.md`** — 必須  
2. コンテキスト UI ステータス addendum — 推奨  
3. confirm scorecard — checklist 合格後

**独立した UI 設計セッション・色/ボタン再定義は不要。**

---

*関連: [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md)*
