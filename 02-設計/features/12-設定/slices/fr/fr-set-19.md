---
slice_id: 12-MICRO-fr-019
type: fr-1id
req_id: FR-SET-19
owner: auto
rtm_status: xref
---

# 12-MICRO-fr-019 — FR-SET-19

- **owner**: auto
- **acceptance**: FR-SET-19 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

取引前 completeness 誘導 — #06 xref

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | マーケット取引開始 |
| **Transform** | #06 から設定へ誘導 |
| **OUT** | 推奨バッジ · ブロックしない |

## 受入基準

1. FR-SET-19 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-19 | IT-12-05 | xref |
| FR-SET-19 | UAT-12-05 | xref |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
