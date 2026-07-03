---
slice_id: 03-MICRO-fr-034
type: fr-1id
req_id: NFR-REG-06
owner: auto
rtm_status: deferred
---

# 03-MICRO-fr-034 — NFR-REG-06

- **owner**: auto
- **acceptance**: NFR-REG-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`requireAuthActive` 経由のため、カルマ停止中ユーザーはプロフィール確定 API が 403（`KARMA_SUSPENDED`）。新規登録直後は通常該当しない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-06 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-06 文言と DET §3/§4 整合。
2. RTM: UAT-03-01（status=deferred）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-06 | UAT-03-01 | deferred |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
