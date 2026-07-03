---
slice_id: 03-MICRO-fr-007
type: fr-1id
req_id: FR-REG-06a
owner: auto
rtm_status: planned
---

# 03-MICRO-fr-007 — FR-REG-06a

- **owner**: auto
- **acceptance**: FR-REG-06a の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**IHL rebuild**: 言語未選択ではオンボーディング完了不可（`FR-I18N-REG-01`）。`Accept-Language` は初期値提案のみ（`FR-I18N-REG-02`）。正本: [`21-翻訳-言語.md`](./21-翻訳-言語.md)。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-06a の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-06a 文言と DET §3/§4 整合。
2. RTM: UT-03-08 · ST-03-06 · UT-03-11（status=planned）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-06a | UT-03-08 | planned |
| FR-REG-06a | ST-03-06 | planned |
| FR-REG-06a | UT-03-11 | planned |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
