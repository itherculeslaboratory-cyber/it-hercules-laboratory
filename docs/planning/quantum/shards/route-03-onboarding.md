---
shard_id: route-03-onboarding
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /onboarding

| 項目 | 値 |
|------|-----|
| feature | 03 |
| route | `/onboarding` |
| kind | form |
| auth | public |
| primary_action | 文明人格を確定 |
| states | pending|submitting|complete|error |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

