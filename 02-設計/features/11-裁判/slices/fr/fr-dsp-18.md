---
slice_id: 11-MICRO-fr-018
type: fr-1id
req_id: FR-DSP-18
owner: auto
rtm_status: partial
---

# 11-MICRO-fr-018 — FR-DSP-18

- **owner**: auto
- **acceptance**: FR-DSP-18 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-DSP-18 — 01-要件 · DET v3 整合（status=partial · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-DSP-18 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-DSP-18 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-DSP-18 | UT-11-05 | partial |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
