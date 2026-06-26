# Wave E（dev R2）遷移設計 v1 DRAFT

> ステータス: PW-2 遷移設計 DRAFT  
> 対象: F-1（ver1 IN）

---

## 1. 状態遷移

| 現在 | イベント | 次状態 | 備考 |
|---|---|---|---|
| `commit_idle` | `submit_commit` | `commit_writing` | capture + measurement 書込 |
| `commit_writing` | `write_ok` | `commit_success` | `sessionId/r2Key` 返却 |
| `commit_writing` | `write_ng_retryable` | `commit_error_retryable` | 再試行導線 |
| `commit_writing` | `write_ng_fatal` | `commit_error_fatal` | 手順案内表示 |
| `commit_error_retryable` | `retry_commit` | `commit_writing` | 同一入力で再実行 |
| `commit_success` | `goto_done` | `done` | 完了画面へ |

## 2. 運用境界

- 既存のハイブリッド運用（local/dev bucket）契約があるため、PW-4 は文書更新のみ。
- ver1 は commit 結果の可視化と再試行導線を維持する。

