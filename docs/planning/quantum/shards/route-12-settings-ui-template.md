---
shard_id: route-12-settings-ui-template
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /settings/ui-template

| 項目 | 値 |
|------|-----|
| feature | 12 |
| route | `/settings/ui-template` |
| kind | page |
| auth | session |
| primary_action | — |
| states | loading|empty|error|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

