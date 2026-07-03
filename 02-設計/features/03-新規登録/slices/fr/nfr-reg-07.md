---
slice_id: 03-MICRO-fr-035
type: fr-1id
req_id: NFR-REG-07
owner: auto
rtm_status: existing
---

# 03-MICRO-fr-035 — NFR-REG-07

- **owner**: auto
- **acceptance**: NFR-REG-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

E2E: `frontend/e2e/p0-c5-magic-link-protected.spec.ts` が magiclink → verify → **初回セットアップまたはホーム**到達をカバーする。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 NFR-REG-07 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. NFR-REG-07 文言と DET §3/§4 整合。
2. RTM: ST-03-04（status=existing）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-REG-07 | ST-03-04 | existing |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
