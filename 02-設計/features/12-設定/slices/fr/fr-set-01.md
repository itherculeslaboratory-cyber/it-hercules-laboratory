---
slice_id: 12-MICRO-fr-001
type: fr-1id
req_id: FR-SET-01
owner: auto
rtm_status: planned
---

# 12-MICRO-fr-001 — FR-SET-01

- **owner**: auto
- **acceptance**: FR-SET-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

認証済みユーザーのみ `/settings` 到達（IHL `/settings` · legacy `/me/settings` salvage）

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | セッション or actor_id 付き GET settings |
| **Transform** | auth 境界 · preferences 投影読取 |
| **OUT** | settings JSON · 未認証は #01 へ |

## 受入基準

1. FR-SET-01 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-01 | UAT-12-01 | planned |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
