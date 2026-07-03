---
slice_id: 01-MICRO-fr-013
type: fr-1id
req_id: NFR-LOGIN-02
owner: auto
rtm_status: existing
---

# 01-MICRO-fr-013 — NFR-LOGIN-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-02 · RTM `status=existing`
- **acceptance**: NFR-LOGIN-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

マジックリンクトークンは **ワンタイム** · **TTL 15 分**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | issued token |
| **Transform** | `expires_at` · `pop` 消費 |
| **OUT** | 1 回のみ成功 verify |

## 受入基準

1. UT-01-05/06: one-time · expired（planned · pytest 実在）。
2. IT-01-05: reuse 401（planned）。
3. ST-01-03（**existing**）: 通しライフサイクル。
4. DET §4.1 状態機械と一致。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UT-01-05 · UT-01-06 | planned |
| IT-01-05 | planned |
| ST-01-03 | **existing** |

## 実装 surface

| 層 | 参照 |
|----|------|
| Store | `auth_session.py` `verify_magic_link` |
| DET | §2.1 · §4.1 |
