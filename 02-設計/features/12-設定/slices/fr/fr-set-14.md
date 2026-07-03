---
slice_id: 12-MICRO-fr-014
type: fr-1id
req_id: FR-SET-14
owner: tier-a
rtm_status: review
---

# 12-MICRO-fr-014 — FR-SET-14

- **owner**: tier-a
- **acceptance**: FR-SET-14 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

言語変更はカルマ/争いでブロックしない

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 争い状態 PATCH language |
| **Transform** | middleware 非ブロック（契約） |
| **OUT** | PATCH 成功 |

## 受入基準

1. FR-SET-14 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-14 | UAT-12-01 | review |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
