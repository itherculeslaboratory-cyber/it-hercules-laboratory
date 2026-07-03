---
slice_id: 12-MICRO-fr-021
type: fr-1id
req_id: NFR-SET-02
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-021 — NFR-SET-02

- **owner**: tier-a
- **acceptance**: NFR-SET-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

dev/admin トグル即時反映 + 永続 — legacy gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | toggle change |
| **Transform** | localStorage + server sync |
| **OUT** | リロード後も保持 |

## 受入基準

1. NFR-SET-02 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-SET-02 | UT-12-08 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
