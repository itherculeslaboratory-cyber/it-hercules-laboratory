---
shard_id: route-06-market-listing-id
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /market/[listing_id]

| 項目 | 値 |
|------|-----|
| feature | 06 |
| route | `/market/[listing_id]` |
| kind | detail |
| auth | public |
| primary_action | transition / match |
| states | load|detail_ready|transition|matched|error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

