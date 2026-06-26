# Wave B（context）詳細設計 v1 DRAFT

> ステータス: PW-1 詳細設計 DRAFT（実装禁止ゲート対象）  
> 対象: `B-1`（P1）/ `B-2`（ver2延期管理）  
> 要件正本: `01-要件/05-観測.md`（`OBS-TGT-01..10`, `OBS-CTX-01..03`, `OBS-SOL-04`）  
> 関連: `02-設計/_横断/schema/schemas/observation/observation_target_projection.schema.yaml` / `02-設計/_横断/schema/schemas/events/observation_target_selected.event.schema.yaml` / `02-設計/E2E/05-観測-E2E-v1-DRAFT.md`

---

## 1. 目的と境界

- 観測対象を 5 ドメイン（biological/artifact/digital/environment/custom）で選択し、`WorkflowContext` に安全に反映する契約を確定する。
- ver1 は「検索 + 分類ツリー + ユーザー確定」のみを対象とし、Akinator 質問導線（`B-2`）は ver2 へ固定延期する。
- 真実はユーザー確定イベント（append-only）で保持し、画面表示は projection から再構築する。

## 2. FR トレース

| ID | 本文での扱い |
|---|---|
| OBS-TGT-01 | 5 ドメイン選択を UI/API 契約化 |
| OBS-TGT-02 | 文字のみ UI（画像なし）を固定 |
| OBS-TGT-04 | 生物は亜種まで到達 or 「亜種未区別」を必須化 |
| OBS-TGT-05/06 | `ObservationTarget` と構造化タグの保存 |
| OBS-TGT-08/09 | context 伝播 + 外部 ID は候補根拠のみ |
| OBS-CTX-01..03 | URL > localStorage > profile の優先順で適用 |
| OBS-SOL-04 | 種確定は常にユーザー操作のみ |

## 3. API 契約（ver1）

### 3.1 検索候補取得

`POST /api/v1/observation/targets/search`

```json
{
  "domain": "biological",
  "query": "Dynastes",
  "limit": 20,
  "cursor": null
}
```

```json
{
  "status": "ok",
  "items": [
    {
      "target_id": "ot_bio_dynastes_hercules_hercules",
      "domain": "biological",
      "path": ["Coleoptera", "Scarabaeidae", "Dynastes", "Dynastes hercules", "Dynastes hercules hercules"],
      "rank": "subspecies",
      "display_ja": "ヘラクレスオオカブト（DHH）",
      "canonical_ids": {
        "gbif_taxon_key": "999999",
        "wikidata_qid": "Q000000"
      }
    }
  ],
  "next_cursor": "c_01"
}
```

### 3.2 対象確定（ユーザー操作）

`POST /api/v1/observation/context/target`

```json
{
  "owner_user_id": "usr_01",
  "session_id": "sess_ctx_01",
  "target_id": "ot_bio_dynastes_hercules_hercules",
  "selected_via": "tree",
  "subspecies_policy": "reached_subspecies"
}
```

```json
{
  "status": "selected",
  "event_id": "evt_otsel_01",
  "context_query": "?domain=biological&target_id=ot_bio_dynastes_hercules_hercules"
}
```

### 3.3 バリデーション失敗（亜種未到達）

```json
{
  "status": "error",
  "code": "SUBSPECIES_REQUIRED",
  "message": "亜種まで選択するか「亜種未区別」を選択してください。"
}
```

## 4. UI チャンク / data-testid

| chunk | 役割 | data-testid |
|---|---|---|
| domain_tabs | 5 ドメイン切替 | `obs-tgt-domain-*` |
| search_panel | 文字検索 | `obs-tgt-search-input` |
| tree_panel | 分類ツリー選択 | `obs-tgt-tree-node` |
| target_preview | path/rank/canonical_ids 確認 | `obs-tgt-preview` |
| apply_actions | 確定/未区別/戻る | `obs-ctx-confirm`, `obs-tgt-undetermined-check` |

## 5. R2 / event_store（INSERT ONLY）

- Event path: `ihl/observation/events/observation_target_selected.jsonl`
- Projection path: `ihl/observation/snapshots/observation_target_projection/{owner_user_id}.json`
- 更新操作は禁止し、再選択は新規イベント追記で表現する（latest は projection 計算で採用）。

## 6. ver1 / ver2 境界

- ver1 IN: 検索・ツリー・ユーザー確定・5 ドメイン枠・亜種未区別明示。
- ver2 OUT: Akinator 質問フロー（`B-2`）、候補自動確定、画像ベース選択 UI。

## 7. E2E クロスリファレンス

- `SC-05-CTX-01`: ドメイン選択〜context 伝播
- `SC-05-NEG-04`: 亜種未到達の確定禁止
- `SC-05-NEG-05`: 候補表示とユーザー確定の分離

## 8. 相互参照

- `02-設計/features/05-観測/sub/WaveC-input-dd-詳細設計-v1-DRAFT.md`
- `02-設計/features/05-観測/sub/WaveD-photo-詳細設計-v1-DRAFT.md`
- `02-設計/features/28-個体命名/詳細設計-v1-DRAFT.md`
