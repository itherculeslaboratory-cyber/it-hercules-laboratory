---
slice_id: 11-MICRO-fr-017
type: fr-1id
req_id: FR-DSP-17
owner: auto
rtm_status: gap
---

# 11-MICRO-fr-017 — FR-DSP-17

- **owner**: auto
- **acceptance**: FR-DSP-17 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

FR-DSP-17 — 01-要件 · DET v3 整合（status=gap · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 FR-DSP-17 |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. FR-DSP-17 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-DSP-17 | UAT-11-10 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
