---
slice_id: 12-MICRO-fr-017
type: fr-1id
req_id: FR-SET-17
owner: auto
rtm_status: planned
---

# 12-MICRO-fr-017 — FR-SET-17

- **owner**: auto
- **acceptance**: FR-SET-17 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

配送先 · PII セッション · counterparty 参照

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | trade 成立 · pii-session POST |
| **Transform** | TradePiiSession · session_only |
| **OUT** | mode/ref · counterparty GET gap |

## 受入基準

1. FR-SET-17 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-17 | UT-12-05 | planned |
| FR-SET-17 | IT-12-03 | planned |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
