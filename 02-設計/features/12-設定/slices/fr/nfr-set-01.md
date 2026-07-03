---
slice_id: 12-MICRO-fr-020
type: fr-1id
req_id: NFR-SET-01
owner: auto
rtm_status: existing
---

# 12-MICRO-fr-020 — NFR-SET-01

- **owner**: auto
- **acceptance**: NFR-SET-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

API Key 等秘密値はレスポンス非返却

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | GET preferences/settings |
| **Transform** | 投影に secret フィールド無 |
| **OUT** | 存在フラグのみ（LLM gap） |

## 受入基準

1. NFR-SET-01 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-SET-01 | UT-12-06 | existing |
| NFR-SET-01 | ST-12-02 | existing |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
