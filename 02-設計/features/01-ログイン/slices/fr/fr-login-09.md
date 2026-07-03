---
slice_id: 01-MICRO-fr-009
type: fr-1id
req_id: FR-LOGIN-09
owner: tier-a
rtm_status: gap
---

# 01-MICRO-fr-009 — FR-LOGIN-09

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-09 · RTM `status=gap`
- **acceptance**: FR-LOGIN-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

magic-link / verify に **IP レート制限**（legacy: 20/分 · 60/分）を適用し超過時 429 を返す。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 同一 IP からの高頻度 POST |
| **Transform** | rate limiter（共有 store 要） |
| **OUT** | 429 `RATE_LIMIT` |

## 受入基準

1. **IHL 未実装** — DET §7 P4 · RTM **gap**（粉飭禁止）。
2. IT-01-10 / UAT-01-11: gap TC — pytest 緑と記載しない。
3. legacy `authRoutesRateLimit.test.ts` は salvage 参照。
4. 将来 retrofit キュー — 本 Wave 再実装トリガー外。

## RTM 行

| test_case_id | status |
|--------------|--------|
| IT-01-10 | **gap** |
| UAT-01-11 | **gap** |

## gap 注記

- **gap**: 429 未実装 · エラーカタログ §429 は設計のみ。
- 複数台 — インメモリ限界（要件 G-3）。
