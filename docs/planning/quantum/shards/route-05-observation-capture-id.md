---
shard_id: route-05-observation-capture-id
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /observation/[capture_id]

| 項目 | 値 |
|------|-----|
| feature | 05 |
| route | `/observation/[capture_id]` |
| kind | detail |
| auth | public |
| primary_action | 再解析マニフェスト |
| states | loading|not_found|ok |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

