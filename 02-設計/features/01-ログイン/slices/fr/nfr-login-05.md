---
slice_id: 01-MICRO-fr-016
type: fr-1id
req_id: NFR-LOGIN-05
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-016 — NFR-LOGIN-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-05 · RTM `status=review`
- **acceptance**: NFR-LOGIN-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**アクセシビリティ** — ラベル付き email 入力 · エラー `aria-invalid` / `role="alert"` · キーボード操作。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | キーボード · スクリーンリーダー |
| **Transform** | ラベル関連付け · フォーカス管理 |
| **OUT** | Enter 送信 · エラー announce |

## 受入基準

1. UAT-01-07（review）: a11y 受入（FR-LOGIN-10 · NFR-LOGIN-08 束ね）。
2. legacy `LoginPage.tsx` — salvage 参照。
3. IHL Web 実装時 — UI設計-v1 準拠。
4. API 層 — a11y 非該当（UI NFR）。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UAT-01-07 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| UI | [`ui/UI設計-v1.md`](../../ui/UI設計-v1.md) |
| 遷移 | 遷移設計 §3 |
| DET | §6 |
