---
slice_id: 03-MICRO-fr-001
type: fr-1id
req_id: FR-REG-01
owner: auto
rtm_status: xref
---

# 03-MICRO-fr-001 — FR-REG-01

- **owner**: auto
- **acceptance**: FR-REG-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

未登録メールで `POST /api/auth/magiclink` を呼ぶと、トークン発行時点で `isNewUser: true` が返る（`email_index` 未存在判定）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-01 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-01 文言と DET §3/§4 整合。
2. RTM: UAT-03-06（status=xref）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-01 | UAT-03-06 | xref |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
