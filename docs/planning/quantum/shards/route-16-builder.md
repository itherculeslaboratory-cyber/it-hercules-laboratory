---
shard_id: route-16-builder
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /builder

| 項目 | 値 |
|------|-----|
| feature | 16 |
| route | `/builder` |
| kind | editor |
| auth | public |
| primary_action | — |
| states | draft|lint|saved|preview|lint_error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

