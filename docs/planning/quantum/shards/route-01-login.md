---
shard_id: route-01-login
type: route-state
phase: QUANTUM
owner: auto
---

# route-state: /login

| 項目 | 値 |
|------|-----|
| feature | 01 |
| route | `/login` |
| kind | form |
| auth | public |
| primary_action | ログインリンクを送信 |
| states | idle|sending|sent|send_error|verifying|verify_error|authenticated |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）

