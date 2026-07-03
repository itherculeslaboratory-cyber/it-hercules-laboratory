---
slice_id: 01-MICRO-fr-012
type: fr-1id
req_id: NFR-LOGIN-01
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-012 — NFR-LOGIN-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-01 · RTM `status=review`
- **acceptance**: NFR-LOGIN-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**PII 最小化** — email 平文を永続化・ログに出さず `hash_actor_id` のみ保持する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 生 email |
| **Transform** | SHA256 系 hash · 監査イベント |
| **OUT** | `actor_id` / `email_hash` のみ · 平文非保持 |

## 受入基準

1. UT-01-10（**existing**）: hash 決定論 · 平文不在。
2. IT-01-08/09: magic-link 監査 hash（planned）。
3. ST-01-05（review）: PII grep 静的監査。
4. UAT-01-08（review）: 受入 review。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UT-01-02 | planned |
| UT-01-10 | **existing** |
| IT-01-08 · IT-01-09 | planned |
| ST-01-05 | review |
| UAT-01-08 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| lib | `libs/pii.py` `hash_actor_id` |
| API | `write_pii_access_event` |
| DET | §2.1 · §2.3 · §6 |
