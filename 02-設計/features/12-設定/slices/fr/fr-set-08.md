---
slice_id: 12-MICRO-fr-008
type: fr-1id
req_id: FR-SET-08
owner: tier-a
rtm_status: review
---

# 12-MICRO-fr-008 — FR-SET-08

- **owner**: tier-a
- **acceptance**: FR-SET-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

プロフィール編集は本画面外 — IA 分離

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | profile edit 要求 |
| **Transform** | マイページへリンク誘導 |
| **OUT** | 設定ハブは prefs のみ |

## 受入基準

1. FR-SET-08 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-08 | UAT-12-09 | review |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
