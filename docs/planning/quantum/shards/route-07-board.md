---
shard_id: route-07-board
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /board

| 項目 | 値 |
|------|-----|
| feature | 07 |
| route | `/board` |
| kind | hub |
| auth | public |
| primary_action | — |
| states | load|categories_ready|empty|error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

