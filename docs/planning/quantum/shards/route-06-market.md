---
shard_id: route-06-market
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /market

| 項目 | 値 |
|------|-----|
| feature | 06 |
| route | `/market` |
| kind | list |
| auth | public |
| primary_action | listing 詳細へ |
| states | load|list_ready|empty|error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

