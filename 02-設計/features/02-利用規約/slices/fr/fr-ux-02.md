---
slice_id: 02-MICRO-fr-033
type: fr-1id
req_id: FR-UX-02
owner: tier-a
rtm_status: gap
---

# 02-MICRO-fr-033 — FR-UX-02

- **owner**: tier-a
- **acceptance**: FR-UX-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-UX-02 — 01-要件 · DET v3 整合（status=gap · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-UX-02 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-UX-02 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-UX-02 | UAT-02-13 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
