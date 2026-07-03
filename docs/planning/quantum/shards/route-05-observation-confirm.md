---
shard_id: route-05-observation-confirm
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /observation/confirm

| 項目 | 値 |
|------|-----|
| feature | 05 |
| route | `/observation/confirm` |
| kind | confirm |
| auth | public |
| primary_action | 確定（commit） |
| states | review|submitting|commit_error|committed |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

