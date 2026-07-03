---
slice_id: 01-MICRO-fr-006
type: fr-1id
req_id: FR-LOGIN-06
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-006 — FR-LOGIN-06

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-06 · RTM `status=review`
- **acceptance**: FR-LOGIN-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**セッション再開** — 保存済み opaque token で actor を復元し再ログインを省略する（IHL dev · legacy JWT とは別）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `session_token`（Bearer / X-IHL-Session） |
| **Transform** | `resolve_session` / `GET /session` |
| **OUT** | `actor_id` 復元 · 保護 API 呼び出し可能 |

## 受入基準

1. UT-01-08: 既知 session 解決（planned）。
2. IT-01-11: session endpoint（`test_it_01_11_*`）。
3. UAT-01-05（review）: セッション再開 UX（NFR-LOGIN-07 束ね）。
4. legacy JWT 7 日 — IHL は in-proc store（DET §7 P2）。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UT-01-08 | planned |
| UAT-01-05 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `GET /session` |
| Store | `auth_session.py` `resolve_session` |
| DET | §2.2 · §4.2 |
