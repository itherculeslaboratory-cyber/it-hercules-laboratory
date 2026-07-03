---
slice_id: 01-MICRO-fr-010
type: fr-1id
req_id: FR-LOGIN-10
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-010 — FR-LOGIN-10

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-10 · RTM `status=review`
- **acceptance**: FR-LOGIN-10 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

API エラーを **ユーザー向け 1 行**に変換し、`role="alert"` で表示する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | HTTP 4xx detail · クライアント検証エラー |
| **Transform** | humanize · バナー/フィールドエラー |
| **OUT** | 具体理由 1 行 · 再送信導線 |

## 受入基準

1. 401 `INVALID_OR_EXPIRED_TOKEN` → 再送信案内（error-002）。
2. 400 規約 → チェックボックス導線（error-001）。
3. UAT-01-04/07（review）: エラー UI · a11y 束ね。
4. legacy `humanizeApiCode` — IHL フロント実装時踏襲。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UAT-01-04 | review |
| UAT-01-07 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | UI設計-v1 · 遷移 §3 |
| API | detail 文字列正本（errors/） |
| NFR | NFR-LOGIN-05 連携 |
