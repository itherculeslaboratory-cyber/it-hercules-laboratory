---
slice_id: 02-MICRO-fr-040
type: fr-1id
req_id: NFR-04
owner: tier-a
rtm_status: existing
---

# 02-MICRO-fr-040 — NFR-04

- **owner**: tier-a
- **acceptance**: NFR-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

NFR-04 — 01-要件 · DET v3 整合（status=existing · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 NFR-04 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. NFR-04 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-04 | ST-02-03 | existing |
| NFR-04 | UAT-02-09 | review |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
