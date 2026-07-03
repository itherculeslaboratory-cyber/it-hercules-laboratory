---
slice_id: 12-MICRO-fr-002
type: fr-1id
req_id: FR-SET-02
owner: tier-a
rtm_status: gap
---

# 12-MICRO-fr-002 — FR-SET-02

- **owner**: tier-a
- **acceptance**: FR-SET-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

論文 LLM BYOK — legacy salvage · IHL gap

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | paper match LLM 設定 PATCH |
| **Transform** | updatePaperMatchLlmPreferences · API key 保存時のみ送信 |
| **OUT** | hasPaperMatchLlmApiKey フラグのみ表示 |

## 受入基準

1. FR-SET-02 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| FR-SET-02 | UT-12-07 | gap |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
