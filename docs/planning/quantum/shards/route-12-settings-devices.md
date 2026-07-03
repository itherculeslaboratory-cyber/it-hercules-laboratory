---
shard_id: route-12-settings-devices
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /settings/devices

| 項目 | 値 |
|------|-----|
| feature | 12 |
| route | `/settings/devices` |
| kind | section |
| auth | public |
| primary_action | default_device_id 更新 |
| states | load|hub_ready|saving|save_ok|save_error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

