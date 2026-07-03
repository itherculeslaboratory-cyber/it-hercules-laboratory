---
slice_id: 03-MICRO-fr-016
type: fr-1id
req_id: FR-REG-15
owner: auto
rtm_status: existing
---

# 03-MICRO-fr-016 — FR-REG-15

- **owner**: auto
- **acceptance**: FR-REG-15 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

成功時 `agreedTerms` / `agreedPrivacy` を true、`onboardingComplete` を true にし、更新後ユーザーを返す。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-15 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-15 文言と DET §3/§4 整合。
2. RTM: UT-03-06 · IT-03-03（status=existing）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-15 | UT-03-06 | existing |
| FR-REG-15 | IT-03-03 | existing |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
