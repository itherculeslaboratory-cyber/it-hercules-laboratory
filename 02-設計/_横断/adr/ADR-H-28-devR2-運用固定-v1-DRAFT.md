# ADR-H-28: dev R2 ハイブリッド運用固定（Wave E）

> ステータス: DRAFT（PW-1 詳細設計）  
> 決定対象: `F-1`（dev R2 運用固定不足）  
> 前提固定: H2（commit 契約）/ H3（R2 ハイブリッド運用）  
> 関連: `features/05-観測/sub/WaveE-devR2-詳細設計-v1-DRAFT.md`

---

## 1. 文脈

- 観測 ver1 は commit 契約（`sessionId`, `r2Key`）で完走するが、dev 環境ではローカル保存と dev バケット保存の使い分け運用が未固定だった。
- 既存方針 H3 を実行可能な runbook 契約として明文化し、検証観点を PW-5 へ引き継ぐ。

## 2. 決定

1. 通常経路はローカル fallback を既定とする。  
2. `R2_MODE=dev_bucket` 時のみ `it-hercules-laboratory-dev` へ書き込む。  
3. どちらの経路でも commit 応答は同一 JSON 契約（`sessionId`, `r2Key`, `storageMode`）を返す。  
4. 上書き禁止（INSERT ONLY）を両経路で強制する。  

## 3. API 契約（運用境界）

`POST /api/solid-observation/commit`

```json
{
  "sessionDraftId": "draft_01",
  "storageMode": "auto"
}
```

```json
{
  "status": "ok",
  "sessionId": "sess_01",
  "r2Key": "world/observation/solid/usr_01/sessions/sess_01.json",
  "storageMode": "local_fallback"
}
```

## 4. R2 / event_store パス

- Local: `local-r2/world/observation/solid/{user_id}/sessions/{session_id}.json`
- Dev bucket: `r2://it-hercules-laboratory-dev/world/observation/solid/{user_id}/sessions/{session_id}.json`
- 共通 index: `.../index.json`（append-only）
- 監査 event: `ihl/observation/events/dev_r2_write_result.jsonl`

## 5. ver1 / ver2 境界

- ver1 IN: local/dev_bucket の二択固定、commit 契約統一、運用手順書化。
- ver2 OUT: 本番 multi-bucket 自動フェイルオーバー、リージョン冗長化。

## 6. テスト・E2E 参照

- `SC-05-REG-01`（登録完了時の `sessionId/r2Key`）
- `SC-05-NEG-02`（commit 失敗時）
- PW-5: `03-テスト計画/features/05-観測/sub/WaveE-devR2-テスト設計-v1-DRAFT.md`

## 7. 影響範囲

- `features/05-観測/sub/WaveE-devR2-詳細設計-v1-DRAFT.md` に運用フローを具体化する。
- `05-運用/runbooks/WaveE-devR2-確認手順-v1-DRAFT.md`（PW-5）で手順化する。
