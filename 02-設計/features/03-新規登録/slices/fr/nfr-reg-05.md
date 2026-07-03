---
slice_id: 03-MICRO-fr-033
type: fr-1id
req_id: NFR-REG-05
owner: auto
rtm_status: xref
---

# 03-MICRO-fr-033 — NFR-REG-05

- **owner**: auto
- **acceptance**: NFR-REG-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

マジックリンク TTL 15 分・JWT 有効 7 日（`authLogic.ts`）。オンボーディング中断後の再開は JWT 期限内であれば同一セッションから継続可能。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-05 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-05 文言と DET §3/§4 整合。
2. RTM: UAT-03-01（status=xref）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-05 | UAT-03-01 | xref |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
