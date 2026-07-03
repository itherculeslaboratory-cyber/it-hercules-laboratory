---
slice_id: 03-MICRO-fr-013
type: fr-1id
req_id: FR-REG-12
owner: auto
rtm_status: existing
---

# 03-MICRO-fr-013 — FR-REG-12

- **owner**: auto
- **acceptance**: FR-REG-12 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`POST /api/auth/setup-profile` は `requireAuthActive` 配下。body: `handle`, `display_name`, `country`, `locale`, `timezone`, `theme`。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-12 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-12 文言と DET §3/§4 整合。
2. RTM: UT-03-02 · IT-03-02 · UAT-03-01（status=existing）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-12 | UT-03-02 | existing |
| FR-REG-12 | IT-03-02 | existing |
| FR-REG-12 | UAT-03-01 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
