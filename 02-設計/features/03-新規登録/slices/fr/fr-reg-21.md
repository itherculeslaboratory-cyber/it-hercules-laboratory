---
slice_id: 03-MICRO-fr-022
type: fr-1id
req_id: FR-REG-21
owner: auto
rtm_status: planned
---

# 03-MICRO-fr-022 — FR-REG-21

- **owner**: auto
- **acceptance**: FR-REG-21 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ログイン送信前に利用規約チェック必須（`LoginPage` `agreed`）。未チェックでは magiclink 送信不可。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-21 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-21 文言と DET §3/§4 整合。
2. RTM: UT-03-10 · IT-03-08 · UAT-03-06（status=planned）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-21 | UT-03-10 | planned |
| FR-REG-21 | IT-03-08 | planned |
| FR-REG-21 | UAT-03-06 | xref |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
