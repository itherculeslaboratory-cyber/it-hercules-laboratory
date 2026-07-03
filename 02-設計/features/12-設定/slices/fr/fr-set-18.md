---
slice_id: 12-MICRO-fr-018
type: fr-1id
req_id: FR-SET-18
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-018 — FR-SET-18

- **owner**: tier-a
- **acceptance**: FR-SET-18 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

振込口座 · ボード直書き禁止ガイダンス — gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 口座入力 UI |
| **Transform** | trade_pii + ガイダンス |
| **OUT** | 取引相手のみ参照 |

## 受入基準

1. FR-SET-18 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-18 | UAT-12-08 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
