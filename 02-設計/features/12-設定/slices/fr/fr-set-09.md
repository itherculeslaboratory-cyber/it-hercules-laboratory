---
slice_id: 12-MICRO-fr-009
type: fr-1id
req_id: FR-SET-09
owner: auto
rtm_status: existing
---

# 12-MICRO-fr-009 — FR-SET-09

- **owner**: auto
- **acceptance**: FR-SET-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

PATCH 許可フィールドのみ · 秘密値ログ禁止

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | PATCH preferences body |
| **Transform** | allowed frozenset · event_store 追記 |
| **OUT** | 更新後 preferences · 平文 PII 拒否 |

## 受入基準

1. FR-SET-09 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-09 | UT-12-03 | existing |
| FR-SET-09 | IT-12-02 | existing |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
