---
slice_id: 03-MICRO-fr-008
type: fr-1id
req_id: FR-REG-07
owner: auto
rtm_status: planned
---

# 03-MICRO-fr-008 — FR-REG-07

- **owner**: auto
- **acceptance**: FR-REG-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`@ユーザーID` は 3〜30 文字、英数字・ピリオド・ハイフン・アンダースコアのみ。入力中に不正文字は除去する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-07 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-07 文言と DET §3/§4 整合。
2. RTM: UT-03-03 · UT-03-04 · IT-03-06 · UAT-03-02（status=planned）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-07 | UT-03-03 | planned |
| FR-REG-07 | UT-03-04 | planned |
| FR-REG-07 | IT-03-06 | planned |
| FR-REG-07 | UAT-03-02 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
