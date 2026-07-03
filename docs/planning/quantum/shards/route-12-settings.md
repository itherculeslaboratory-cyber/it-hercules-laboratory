---
shard_id: route-12-settings
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /settings

| 項目 | 値 |
|------|-----|
| feature | 12 |
| route | `/settings` |
| kind | hub |
| auth | public |
| primary_action | preferences PATCH |
| states | load|hub_ready|section_edit|saving|save_ok|save_error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

