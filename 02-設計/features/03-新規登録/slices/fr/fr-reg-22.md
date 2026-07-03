---
slice_id: 03-MICRO-fr-023
type: fr-1id
req_id: FR-REG-22
owner: auto
rtm_status: existing
---

# 03-MICRO-fr-023 — FR-REG-22

- **owner**: auto
- **acceptance**: FR-REG-22 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

検証成功後は `navigate("/", { replace: true })` とし、`ProtectedApp` がオンボーディング or ホームを分岐する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 要件 FR-REG-22 の入力条件 |
| **Transform** | IHL route / event_store / UI 境界 |
| **OUT** | 完了状態 · エラー · 遷移 |

## 受入基準

1. FR-REG-22 文言と DET §3/§4 整合。
2. RTM: ST-03-01 · UAT-03-05（status=existing）。
3. gap/deferred は粉飾禁止 · 実装一致のみ existing。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-REG-22 | ST-03-01 | existing |
| FR-REG-22 | UAT-03-05 | review |

## DET 参照

詳細設計-v3.md §3–§7 · 契約レジストラ-v1.yaml
