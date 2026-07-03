---
slice_id: 12-MICRO-fr-022
type: fr-1id
req_id: NFR-SET-03
owner: auto
rtm_status: planned
---

# 12-MICRO-fr-022 — NFR-SET-03

- **owner**: auto
- **acceptance**: NFR-SET-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

保存中 disabled · 1 行結果メッセージ

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | PATCH 送信 |
| **Transform** | UI saving 状態 |
| **OUT** | save_ok / save_error |

## 受入基準

1. NFR-SET-03 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref 維持）。
3. IHL 実装: `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
| NFR-SET-03 | UAT-12-01 | planned |

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
