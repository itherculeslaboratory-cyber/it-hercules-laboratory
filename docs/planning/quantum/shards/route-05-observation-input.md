---
shard_id: route-05-observation-input
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /observation/input

| 項目 | 値 |
|------|-----|
| feature | 05 |
| route | `/observation/input` |
| kind | form |
| auth | public |
| primary_action | 確認へ |
| states | draft|validation_error|ready |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

