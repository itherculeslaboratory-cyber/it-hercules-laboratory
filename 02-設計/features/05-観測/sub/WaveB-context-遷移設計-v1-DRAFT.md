# Wave B（context）遷移設計 v1 DRAFT

> ステータス: PW-2 遷移設計 DRAFT  
> 対象: B-1（ver1 IN）/ B-2（ver2 OUT）

---

## 1. 状態遷移

| 現在 | イベント | 次状態 | 備考 |
|---|---|---|---|
| `ctx_idle` | `open_context` | `ctx_domain_selected` | 5ドメインを表示 |
| `ctx_domain_selected` | `search_keyword` | `ctx_candidate_loading` | 対象カタログ検索 |
| `ctx_candidate_loading` | `search_success` | `ctx_candidate_ready` | 候補一覧を描画 |
| `ctx_candidate_ready` | `pick_target` | `ctx_target_preview` | `target_id` を保持 |
| `ctx_target_preview` | `confirm_target` | `ctx_confirmed` | `scope_route` と同時保存 |
| `ctx_confirmed` | `go_input` | `input_ready` | `/observation/input` 遷移 |
| `ctx_candidate_loading` | `search_fail` | `ctx_error` | エラー表示後リトライ |
| `ctx_error` | `retry_search` | `ctx_candidate_loading` | 再検索 |

## 2. 画面導線

- `/observation/context` で `domain + target` を確定。
- 確定時に `species` と `target_id` をクエリへ渡す。
- ver1 は検索+一覧選択のみ。質問で絞る導線（Akinator）は ver2 で分離。

## 3. エラー導線

- カタログ取得失敗: `ctx_error` + 再検索ボタン。
- 候補0件: `ctx_candidate_ready` 内で空状態表示し、キーワード再入力を促す。

## 4. data-testid

- `obs-tgt-domain-*`
- `obs-tgt-search-input`
- `obs-tgt-tree-node`
- `obs-ctx-chip`
- `obs-ctx-confirm`

