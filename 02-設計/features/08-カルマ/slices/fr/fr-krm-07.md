---
slice_id: 08-MICRO-fr-007
type: fr-1id
req_id: FR-KRM-07
owner: auto
rtm_status: partial
---

# 08-MICRO-fr-007 — FR-KRM-07

- **owner**: auto
- **acceptance**: FR-KRM-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-KRM-07 — 01-要件 · DET v3 整合（status=partial · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-KRM-07 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-KRM-07 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-KRM-07 | UT-08-07 | partial |
| FR-KRM-07 | IT-08-06 | partial |
| FR-KRM-07 | UAT-08-05 | partial |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
