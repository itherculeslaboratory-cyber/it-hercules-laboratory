---
slice_id: 12-MICRO-fr-024
type: fr-1id
req_id: NFR-SET-05
owner: auto
rtm_status: deferred
---

# 12-MICRO-fr-024 — NFR-SET-05

- **owner**: auto
- **acceptance**: NFR-SET-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

World/FeatureNode IA 段階移行 — deferred

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | REQ-024 IA |
| **Transform** | registry 統合候補 |
| **OUT** | doc/deferred |

## 受入基準

1. NFR-SET-05 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-SET-05 | UAT-12-10 | deferred |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
