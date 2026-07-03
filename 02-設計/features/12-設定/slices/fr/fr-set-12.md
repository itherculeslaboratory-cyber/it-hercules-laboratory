---
slice_id: 12-MICRO-fr-012
type: fr-1id
req_id: FR-SET-12
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-012 — FR-SET-12

- **owner**: tier-a
- **acceptance**: FR-SET-12 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

言語保存後 UI 全文切替 — API ready · UI gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | PATCH language 成功 |
| **Transform** | i18n 再読込 |
| **OUT** | 再ログイン不要（理想） |

## 受入基準

1. FR-SET-12 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-12 | UAT-12-01 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
