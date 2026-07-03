---
slice_id: 21-MICRO-fr-023
type: fr-1id
req_id: NFR-I18N-06
owner: auto
rtm_status: gap
---

# 21-MICRO-fr-023 — NFR-I18N-06

- **owner**: auto
- **acceptance**: NFR-I18N-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

NFR-I18N-06 — 01-要件 · DET v3 整合（status=gap · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 NFR-I18N-06 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. NFR-I18N-06 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-I18N-06 | ST-21-03 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
