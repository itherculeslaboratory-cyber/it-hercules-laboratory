---
slice_id: 23-MICRO-fr-008
type: fr-1id
req_id: FR-GMO-08
owner: tier-a
rtm_status: gap
---

# 23-MICRO-fr-008 — FR-GMO-08

- **owner**: tier-a
- **acceptance**: FR-GMO-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-GMO-08 — 01-要件 · DET v3 整合（status=gap · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-GMO-08 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-GMO-08 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-GMO-08 | UT-23-07 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
