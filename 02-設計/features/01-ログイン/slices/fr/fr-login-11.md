---
slice_id: 01-MICRO-fr-011
type: fr-1id
req_id: FR-LOGIN-11
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-011 — FR-LOGIN-11

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-11 · RTM `status=review`
- **acceptance**: FR-LOGIN-11 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

JWT/session 保持中に `/login` へ来た利用者に **ログイン済 UI**（進む · ログアウト）を示す。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 有効 session · `/login` アクセス |
| **Transform** | session 解決 · onboarding 状態確認 |
| **OUT** | authenticated 画面 · #03 未完了表示 |

## 受入基準

1. UAT-01-05（review）: ログイン済 UI（FR-LOGIN-06 · NFR-LOGIN-07 束ね）。
2. オンボーディング未完了 — #03 境界。
3. 「別メールでログイン」= session クリア + idle。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UAT-01-05 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 遷移 §4.3 authenticated |
| UI | UI設計-v1 |
| DET | §4.3 |
