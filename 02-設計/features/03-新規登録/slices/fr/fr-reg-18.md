---
slice_id: 03-MICRO-fr-019
type: fr-1id
req_id: FR-REG-18
owner: auto
rtm_status: deferred
---

# 03-MICRO-fr-019 — FR-REG-18

- **owner**: auto
- **acceptance**: FR-REG-18 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`POST /api/auth/locale` — 言語のみ更新。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-18 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-18 文言と DET §3/§4 整合。
2. RTM: ST-03-06（status=deferred）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-18 | ST-03-06 | deferred |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
