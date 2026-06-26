# Wave E（dev R2）詳細設計 v1 DRAFT

> ステータス: PW-1 詳細設計 DRAFT  
> 対象: `F-1`（P1）  
> 参照 ADR: `02-設計/_横断/adr/ADR-H-28-devR2-運用固定-v1-DRAFT.md`  
> 前提: H2 commit 契約 / H3 ハイブリッド R2

---

## 1. 目的

- dev 環境での R2 書込経路（local_fallback / dev_bucket）を固定し、実装差分なしで運用の再現性を確保する。
- 登録 API の応答契約を一本化し、E2E と手動運用で同じ成功判定ができる状態にする。

## 2. FR トレース

| ID | 反映内容 |
|---|---|
| OBS-R2-01 | INSERT ONLY 厳守 |
| OBS-R2-03 | 同一キー上書き禁止 |
| OBS-R2-04 | run_id / schema_version / input_hash を記録 |
| OBS-R2-05 | index append-only 運用 |
| OBS-NF-09 | 実機/本番は人間ゲート |

## 3. API 契約（例）

### 3.1 commit（成功）

```json
{
  "request": {
    "sessionDraftId": "draft_20260621_01",
    "storageMode": "auto"
  },
  "response": {
    "status": "ok",
    "sessionId": "sess_20260621_01",
    "r2Key": "world/observation/solid/usr_01/sessions/sess_20260621_01.json",
    "storageMode": "local_fallback",
    "runId": "run_commit_01"
  }
}
```

### 3.2 commit（失敗）

```json
{
  "status": "error",
  "code": "R2_WRITE_FAILED",
  "message": "session write failed",
  "retryable": true
}
```

## 4. UI チャンク / data-testid

| chunk | 役割 | data-testid |
|---|---|---|
| storage_status | 現在の保存経路を表示 | `obs-r2-storage-mode-chip` |
| commit_result | sessionId/r2Key を表示 | `obs-r2-commit-result` |
| retry_actions | 再試行導線 | `obs-r2-retry-btn` |
| trace_panel | run_id/input_hash 表示 | `obs-r2-trace-panel` |

## 5. R2 / event_store パス（INSERT ONLY）

- session: `world/observation/solid/{user_id}/sessions/{session_id}.json`
- index: `world/observation/solid/{user_id}/index.json`
- audit event: `ihl/observation/events/dev_r2_write_result.jsonl`
- run info: `ihl/observation/manifest/run_info/{run_id}.json`

## 6. 運用フロー（ハイブリッド）

1. `storageMode=auto` を受信。  
2. local_fallback に書込。  
3. `R2_MODE=dev_bucket` の場合のみ dev bucket に書込。  
4. いずれも成功時に同一レスポンスを返す。  
5. 失敗時は `dev_r2_write_result` を追記し、再試行導線を表示。  

## 7. ver1 / ver2 境界

- ver1 IN: 2 モード固定、運用ログ、再試行導線、応答契約統一。
- ver2 OUT: 書込自動振り分け最適化、複数バケット整合監査の自動復旧。

## 8. E2E クロスリファレンス

- `SC-05-REG-01`
- `SC-05-NEG-02`
- `SC-05-SOL-03`（環境スナップショット併用）

## 9. 相互参照

- `02-設計/features/05-観測/sub/WaveD-photo-詳細設計-v1-DRAFT.md`
- `02-設計/features/05-観測/sub/WaveC-input-dd-詳細設計-v1-DRAFT.md`
