---
shard_id: route-05-observation-templates-id-fork
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /observation/templates/[id]/fork

| 項目 | 値 |
|------|-----|
| feature | 05 |
| route | `/observation/templates/[id]/fork` |
| kind | page |
| auth | public |
| primary_action | — |
| states | loading|empty|error|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

