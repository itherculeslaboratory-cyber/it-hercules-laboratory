---
slice_id: 03-MICRO-fr-011
type: fr-1id
req_id: FR-REG-10
owner: auto
rtm_status: deferred
---

# 03-MICRO-fr-011 — FR-REG-10

- **owner**: auto
- **acceptance**: FR-REG-10 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

保存成功時 `markTwinTourPending()` を呼び、ホーム到達後の初回ツアー用フラグを sessionStorage にセットする（任意 UX・Twin 廃止後も pending 消費ロジックは残存）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-10 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-10 文言と DET §3/§4 整合。
2. RTM: UAT-03-05（status=deferred）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-10 | UAT-03-05 | deferred |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
