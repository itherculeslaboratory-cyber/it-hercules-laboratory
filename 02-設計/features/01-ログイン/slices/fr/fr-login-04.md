---
slice_id: 01-MICRO-fr-004
type: fr-1id
req_id: FR-LOGIN-04
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-004 — FR-LOGIN-04

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-04 · RTM `status=review`
- **acceptance**: FR-LOGIN-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ワンタイム `token` を消費し **opaque session**（`session_token` + `actor_id`）を発行する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `MagicLinkVerifyRequest.token` |
| **Transform** | `verify_magic_link` · `pop` 消費 |
| **OUT** | 200 authenticated · 失敗 401 `INVALID_OR_EXPIRED_TOKEN` |

## 受入基準

1. 有効 token → session（UT-01-04 · IT-01-02 existing）。
2. 無効/期限/再利用 → 401（IT-01-04/05）。
3. legacy 400 分岐は **IHL 非採用**（DET §7 P3）。
4. UAT-01-03: URL `?token=` 自動 verify（UI review）。

## RTM 行

| test_case_id | test_layer | status |
|--------------|------------|--------|
| UT-01-04 | unit | planned |
| IT-01-02 | integration | existing |
| IT-01-04 | integration | planned |
| ST-01-01 | system | existing |
| UAT-01-03 | acceptance | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_verify` |
| Schema | [`magiclinkverifyrequest.md`](../schema/magiclinkverifyrequest.md) |
| Error | [`401.md`](../errors/401.md) |
