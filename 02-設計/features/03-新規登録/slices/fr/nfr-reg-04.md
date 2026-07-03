---
slice_id: 03-MICRO-fr-032
type: fr-1id
req_id: NFR-REG-04
owner: tier-a
rtm_status: review
---

# 03-MICRO-fr-032 — NFR-REG-04

- **owner**: tier-a
- **acceptance**: NFR-REG-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

保存中は二重送信防止（`busy` でボタン無効化、「保存中...」表示）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-04 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-04 文言と DET §3/§4 整合。
2. RTM: UAT-03-10（status=review）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-04 | UAT-03-10 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
