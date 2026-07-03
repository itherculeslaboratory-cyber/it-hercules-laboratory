---
shard_id: route-02-terms
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /terms

| 項目 | 値 |
|------|-----|
| feature | 02 |
| route | `/terms` |
| kind | page |
| auth | public |
| primary_action | — |
| states | loading|empty|error|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

