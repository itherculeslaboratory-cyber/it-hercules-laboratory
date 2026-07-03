---
shard_id: route-04-home
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /home

| 項目 | 値 |
|------|-----|
| feature | 04 |
| route | `/home` |
| kind | hub |
| auth | public |
| primary_action | 観測登録開始 |
| states | loading|home|fallback |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

