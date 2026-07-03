---
slice_id: 12-MICRO-fr-007
type: fr-1id
req_id: FR-SET-07
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-007 — FR-SET-07

- **owner**: tier-a
- **acceptance**: FR-SET-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

Web Push VAPID 登録 — legacy gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | push subscribe |
| **Transform** | VAPID 鍵 · POST subscribe |
| **OUT** | 端末登録 or 代替導線 |

## 受入基準

1. FR-SET-07 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-07 | UAT-12-02 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
