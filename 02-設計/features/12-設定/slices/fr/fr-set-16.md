---
slice_id: 12-MICRO-fr-016
type: fr-1id
req_id: FR-SET-16
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-016 — FR-SET-16

- **owner**: tier-a
- **acceptance**: FR-SET-16 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

局留め（氏名フルネーム）登録 — trade_pii gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | poste_restante 入力 |
| **Transform** | trade_pii PATCH（未実装） |
| **OUT** | completeness 更新 |

## 受入基準

1. FR-SET-16 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-16 | IT-12-04 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
