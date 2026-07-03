---
slice_id: 03-MICRO-fr-014
type: fr-1id
req_id: FR-REG-13
owner: auto
rtm_status: existing
---

# 03-MICRO-fr-014 — FR-REG-13

- **owner**: auto
- **acceptance**: FR-REG-13 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

初回のみ `auth/handle_index/{handle}.json` を作成する。既存 handle が他 userId に紐づいていれば `HANDLE_TAKEN`（400）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-13 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-13 文言と DET §3/§4 整合。
2. RTM: UT-03-07 · IT-03-04 · ST-03-02 · UAT-03-03（status=existing）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-13 | UT-03-07 | existing |
| FR-REG-13 | IT-03-04 | existing |
| FR-REG-13 | ST-03-02 | existing |
| FR-REG-13 | UAT-03-03 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
