---
slice_id: 03-MICRO-fr-030
type: fr-1id
req_id: NFR-REG-02
owner: tier-a
rtm_status: review
---

# 03-MICRO-fr-030 — NFR-REG-02

- **owner**: tier-a
- **acceptance**: NFR-REG-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

オンボーディング API 失敗時、サーバ `error` コードをユーザー向け日本語にマッピングする（`HANDLE_TAKEN` 等）。汎用フォールバック文言を必ず用意する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-02 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-02 文言と DET §3/§4 整合。
2. RTM: UAT-03-11 · ST-03-05（status=review）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-02 | UAT-03-11 | review |
| NFR-REG-02 | ST-03-05 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
