---
slice_id: 21-MICRO-fr-007
type: fr-1id
req_id: FR-I18N-SET-03
owner: auto
rtm_status: partial
---

# 21-MICRO-fr-007 — FR-I18N-SET-03

- **owner**: auto
- **acceptance**: FR-I18N-SET-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-I18N-SET-03 — 01-要件 · DET v3 整合（status=partial · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-I18N-SET-03 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-I18N-SET-03 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-I18N-SET-03 | UAT-21-02 | partial |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
