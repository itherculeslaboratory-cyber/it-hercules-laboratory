---
slice_id: 03-MICRO-fr-009
type: fr-1id
req_id: FR-REG-08
owner: tier-a
rtm_status: gap
---

# 03-MICRO-fr-009 — FR-REG-08

- **owner**: tier-a
- **acceptance**: FR-REG-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

handle の空きは 500ms デバウンス後に `checkHandle` でリアルタイム表示する（確認中 / 利用可能 / 使用中）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-08 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-08 文言と DET §3/§4 整合。
2. RTM: UAT-03-07（status=gap）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-08 | UAT-03-07 | gap |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
