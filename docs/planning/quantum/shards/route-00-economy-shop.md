---
shard_id: route-00-economy-shop
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /economy/shop

| 項目 | 値 |
|------|-----|
| feature | 00 |
| route | `/economy/shop` |
| kind | page |
| auth | public |
| primary_action | — |
| states | loading|empty|error|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

