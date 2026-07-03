---
slice_id: 01-MICRO-fr-002
type: fr-1id
req_id: FR-LOGIN-02
owner: auto
rtm_status: planned
---

# 01-MICRO-fr-002 — FR-LOGIN-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-02 · RTM `status=planned`
- **acceptance**: FR-LOGIN-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

email を受け取り **ワンタイム magic link トークン**を発行する（TTL **15 分**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `MagicLinkRequest.email` |
| **Transform** | hash · `issue_magic_link` · 監査イベント · 任意 SMTP |
| **OUT** | 200 `status=sent` · ephemeral token（TTL 900s） |

## 受入基準

1. TTL 15 分 — `expires_at = now + 900`（UT-01-03）。
2. 発行 — UT-01-01 · `test_ut_01_01_*`。
3. PII — email 平文を store に残さない（NFR-LOGIN-01 連携）。
4. API slice: [`post-api-v1-auth-magic-link.md`](../api/post-api-v1-auth-magic-link.md)。

## RTM 行

| test_case_id | test_layer | status |
|--------------|------------|--------|
| UT-01-01 | unit | planned |
| UT-01-03 | unit | planned |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_magic_link` · `issue_magic_link` |
| Schema | [`magiclinkrequest.md`](../schema/magiclinkrequest.md) |
| DET | §2.1 · §3.1 |
