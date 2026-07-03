---
slice_id: 01-MICRO-fr-019
type: fr-1id
req_id: NFR-LOGIN-08
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-019 — NFR-LOGIN-08

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-08 · RTM `status=review`
- **acceptance**: NFR-LOGIN-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ログイン UI 文言は **日本語中心** · locale 詳細は #03 新規登録へ委譲。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー locale 希望 |
| **Transform** | 固定 JA 文案 · register `language` 保存のみ |
| **OUT** | `/login` 日本語 UI · #03 で locale 確定 |

## 受入基準

1. UAT-01-07（review）: i18n 受入（a11y 束ね）。
2. `RegisterRequest.language` 既定 `"ja"` — handler 未使用（schema-003）。
3. 多言語拡張 — #03 境界（DET §1.2 Out）。
4. REQ-002 範囲外詳細 — 要件 §⑤。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UAT-01-07 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `RegisterRequest.language` |
| UI | UI設計-v1（JA 文案） |
| DET | §6 NFR-LOGIN-08 |
