---
slice_id: 01-MICRO-fr-017
type: fr-1id
req_id: NFR-LOGIN-06
owner: tier-a
rtm_status: human
---

# 01-MICRO-fr-017 — NFR-LOGIN-06

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-06 · RTM `status=human`
- **acceptance**: NFR-LOGIN-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**運用** — 本番では `dev_token` 非露出 · SMTP/`PUBLIC_APP_URL` がリンク正否を左右する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 本番 env · SMTP 設定 |
| **Transform** | env ガード · メール送信 |
| **OUT** | 正しい login URL · dev_token 無 |

## 受入基準

1. IT-01-03（planned）: env 無しで dev_token 無 — 機械。
2. UAT-01-10（**human**）: 本番 SMTP 実送信 · dev 非露出 — **人間ゲート**。
3. `IHL_DEV_EXPOSE_MAGIC_TOKEN` 既定 off（DET §6）。
4. 起動ログ SMTP 状態 — 運用手順（要件 §⑤）。

## RTM 行

| test_case_id | status |
|--------------|--------|
| IT-01-03 | planned |
| UAT-01-10 | **human** |

## gap 注記

- **human**: 本番証跡はエージェントが `[x]` にしない。
- 設計: FR-LOGIN-03 と env 境界を共有。
