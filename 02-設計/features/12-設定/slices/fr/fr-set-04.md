---
slice_id: 12-MICRO-fr-004
type: fr-1id
req_id: FR-SET-04
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-004 — FR-SET-04

- **owner**: tier-a
- **acceptance**: FR-SET-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

dev ツール表示トグル — 既定 off · legacy gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | show dev tools toggle |
| **Transform** | localStorage + preferences sync |
| **OUT** | DEV/Builder/routing 導線露出 |

## 受入基準

1. FR-SET-04 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-04 | UT-12-08 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
