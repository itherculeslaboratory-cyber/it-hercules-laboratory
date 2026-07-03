---
shard_id: route-07-board-category
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /board/[category]

| 項目 | 値 |
|------|-----|
| feature | 07 |
| route | `/board/[category]` |
| kind | list |
| auth | public |
| primary_action | — |
| states | load|threads_ready|create|posted|error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

