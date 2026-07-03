---
shard_id: route-11-board-category-dispute
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /board/[category]/dispute

| 項目 | 値 |
|------|-----|
| feature | 11 |
| route | `/board/[category]/dispute` |
| kind | room |
| auth | public |
| primary_action | メッセージ投稿 |
| states | loading|messages_ready|posting|error|not_found |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

