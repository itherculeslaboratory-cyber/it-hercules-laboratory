---
slice_id: 01-MICRO-fr-018
type: fr-1id
req_id: NFR-LOGIN-07
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-018 — NFR-LOGIN-07

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-07 · RTM `status=review`
- **acceptance**: NFR-LOGIN-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**スケール限界** — session 即時失効リストなし · 全端末ログアウト非サポート（設計ギャップとして明示）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ログアウト要求 · セキュリティインシデント |
| **Transform** | クライアント token 削除のみ |
| **OUT** | 他端末 session は有効のまま |

## 受入基準

1. UAT-01-05（review）: ログアウト UX（束ね）。
2. dev in-proc store — プロセス再起動で全失効。
3. legacy JWT denylist 未実装 — 要件 G-1 と一致。
4. 将来 ADR — 本 Wave スコープ外。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UAT-01-05 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| Store | `auth_session.py` ephemeral |
| DET | §1.2 Out · §6 · §7 |
| 要件 | §⑨ G-1 |
