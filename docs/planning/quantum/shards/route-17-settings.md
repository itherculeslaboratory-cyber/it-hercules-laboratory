---
shard_id: route-17-settings
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /settings

| 項目 | 値 |
|------|-----|
| feature | 17 |
| route | `/settings` |
| kind | hub |
| auth | public |
| primary_action | — |
| states | load|hub_ready|save_ok|save_error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

