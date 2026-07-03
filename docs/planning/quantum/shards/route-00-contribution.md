---
shard_id: route-00-contribution
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /contribution

| 項目 | 値 |
|------|-----|
| feature | 00 |
| route | `/contribution` |
| kind | page |
| auth | public |
| primary_action | — |
| states | loading|empty|error|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

