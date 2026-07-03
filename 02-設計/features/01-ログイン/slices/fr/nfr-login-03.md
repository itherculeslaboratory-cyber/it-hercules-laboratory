---
slice_id: 01-MICRO-fr-014
type: fr-1id
req_id: NFR-LOGIN-03
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-014 — NFR-LOGIN-03

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-03 · RTM `status=review`
- **acceptance**: NFR-LOGIN-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

SMTP/メール基盤なしでも **ローカル開発・CI が完走**できる可用性。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | dev env · SMTP 未設定 |
| **Transform** | magic-link 発行 · 200 応答（送信失敗も 200） |
| **OUT** | `dev_token` 条件露出 · E2E 完走 |

## 受入基準

1. IT-01-01（existing）: dev_token 経路。
2. UAT-01-09（review）: dev 完走受入。
3. メール失敗はログのみ — API 4xx なし（api-002）。
4. 本番 — NFR-LOGIN-06 human と分離。

## RTM 行

| test_case_id | status |
|--------------|--------|
| IT-01-01 | existing |
| UAT-01-09 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_magic_link` |
| env | `IHL_DEV_EXPOSE_MAGIC_TOKEN` |
| DET | §6 · §3.1 |
