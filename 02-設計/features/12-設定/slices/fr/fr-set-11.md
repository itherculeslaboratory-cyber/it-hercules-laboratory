---
slice_id: 12-MICRO-fr-011
type: fr-1id
req_id: FR-SET-11
owner: auto
rtm_status: existing
---

# 12-MICRO-fr-011 — FR-SET-11

- **owner**: auto
- **acceptance**: FR-SET-11 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

表示言語 locale 変更 · #21 同一集合

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | language 選択 PATCH |
| **Transform** | PATCH /api/v1/me/preferences |
| **OUT** | language 永続化 |

## 受入基準

1. FR-SET-11 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-11 | UT-12-01 | existing |
| FR-SET-11 | UAT-12-01 | existing |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
