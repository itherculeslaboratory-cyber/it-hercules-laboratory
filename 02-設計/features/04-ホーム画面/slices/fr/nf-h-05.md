---
slice_id: 04-MICRO-fr-031
type: fr-1id
req_id: NF-H-05
owner: tier-a
rtm_status: review
---

# 04-MICRO-fr-031 — NF-H-05

- **owner**: tier-a
- **acceptance**: NF-H-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

レスポンシブ — review（IHL rebuild · `GET /api/v1/home/summary` read-only ハブ）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 認証後着地 or サマリー GET 要求（NF-H-05） |
| **Transform** | `home_summary` · data source 解決 · 非 PII 集計 |
| **OUT** | today_lines + cards + primary_cta · 各 FN へ read-only リンク |

## 受入基準

1. NF-H-05 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/main.py` `home_summary` · `tests/unit/test_home_summary.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NF-H-05 | UAT-04-04 | review |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
