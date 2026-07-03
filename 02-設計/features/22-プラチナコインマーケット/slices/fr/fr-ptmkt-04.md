---
slice_id: 22-MICRO-fr-004
type: fr-1id
req_id: FR-PTMKT-04
owner: auto
rtm_status: partial
---

# 22-MICRO-fr-004 — FR-PTMKT-04

- **owner**: auto
- **acceptance**: FR-PTMKT-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-PTMKT-04 — 01-要件 · DET v3 整合（status=partial · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-PTMKT-04 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-PTMKT-04 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-PTMKT-04 | IT-22-02 | partial |
| FR-PTMKT-04 | UAT-22-05 | partial |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
