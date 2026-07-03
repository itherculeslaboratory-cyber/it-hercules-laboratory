---
slice_id: 01-MICRO-fr-008
type: fr-1id
req_id: FR-LOGIN-08
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-008 — FR-LOGIN-08

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-08 · RTM `status=review`
- **acceptance**: FR-LOGIN-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

保護 API は **Bearer / X-IHL-Session** で opaque session を要求し、欠落時 401 する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `Authorization: Bearer` · `X-IHL-Session` |
| **Transform** | `extract_session_token` · `resolve_actor_id` |
| **OUT** | actor 解決 or 401 `AUTH_REQUIRED` |

## 受入基準

1. UT-01-09: 不明 session（planned）。
2. IT-01-10/11: session endpoint（existing/planned）。
3. UAT-01-06（review）: 401 導線。
4. legacy JWT エラー分岐 — IHL は `AUTH_REQUIRED` 集約。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UT-01-09 | planned |
| UAT-01-06 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_session` · `auth_deps.py` |
| Error | [`401.md`](../errors/401.md) |
| DET | §3.9 GET /session |
