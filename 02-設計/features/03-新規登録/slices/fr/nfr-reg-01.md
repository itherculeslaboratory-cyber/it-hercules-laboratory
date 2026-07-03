---
slice_id: 03-MICRO-fr-029
type: fr-1id
req_id: NFR-REG-01
owner: tier-a
rtm_status: gap
---

# 03-MICRO-fr-029 — NFR-REG-01

- **owner**: tier-a
- **acceptance**: NFR-REG-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

handle 重複チェック API はオンボーディング入力の体感遅延を避けるため、フロントで 500ms デバウンスする。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-01 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-01 文言と DET §3/§4 整合。
2. RTM: UAT-03-07（status=gap）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-01 | UAT-03-07 | gap |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
