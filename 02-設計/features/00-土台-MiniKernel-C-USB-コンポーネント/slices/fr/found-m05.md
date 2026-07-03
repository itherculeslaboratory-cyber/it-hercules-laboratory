---
slice_id: 00-MICRO-fr-031
type: fr-1id
req_id: found-m05
owner: tier-a
rtm_status: unknown
---

# 00-MICRO-fr-031 — found-m05

- **owner**: tier-a
- **acceptance**: FOUND-M05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

found-m05 — 01-要件 · DET v3 整合（status=unknown · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 found-m05 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. found-m05 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| found-m05 | — | unknown |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
