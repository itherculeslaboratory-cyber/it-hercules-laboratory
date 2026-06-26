# Wave C（input DD）詳細設計 v1 DRAFT

> ステータス: PW-1 詳細設計 DRAFT  
> 対象: `C-1`（P0残）/ `C-2`,`C-3`（ver2延期管理）  
> 要件正本: `01-要件/05-観測.md`（`OBS-TPL-01..09`, `OBS-MVP-01..02`, `OBS-SOL-07`, `OBS-NF-03`）  
> 関連 schema: `measurement_dictionary_selected.event.schema.yaml` / `measurement_dictionary_extended.event.schema.yaml`

---

## 1. 目的と境界

- 観測入力の辞書駆動 UI（項目/単位/方法ドロップダウン）を API 契約とイベント契約で固定する。
- ver1 は手入力と既存 API 由来のみを対象にし、SwitchBot 機器選択 UI（`C-3`）とタグ自然淘汰（`C-2`）は ver2 へ延期する。

## 2. FR トレース

| ID | 契約反映 |
|---|---|
| OBS-TPL-03 | 項目名の候補選択 + 自由入力追加 |
| OBS-TPL-05 | 計測方法 DD（manual/iot など） |
| OBS-TPL-06 | method → value_origin の既定写像 |
| OBS-TPL-07 | 単位 DD + 追加 |
| OBS-TPL-09 | value_type による入力 UI 変化 |
| OBS-SOL-07 | `entryMode` 記録 |
| OBS-NF-03 | 主要導線 3 クリック以内 |

## 3. API 契約

### 3.1 辞書取得

`GET /api/v1/observation/measurement-dictionary?scope=solid&sex=male`

```json
{
  "status": "ok",
  "scope": "solid",
  "items": [
    {
      "measurement_name": "body_length_mm",
      "label_ja": "体長",
      "value_type": "numeric",
      "unit_candidates": ["mm", "cm"],
      "method_candidates": ["manual_entry", "manual"],
      "unit_default": "mm"
    }
  ]
}
```

### 3.2 入力行保存

`POST /api/v1/observation/measurements`

```json
{
  "session_id": "sess_05i_01",
  "entry_mode": "manual_taxonomy",
  "rows": [
    {
      "measurement_name": "body_length_mm",
      "measurement_value": 45.2,
      "measurement_unit": "mm",
      "measurement_method": "manual_entry"
    }
  ]
}
```

```json
{
  "status": "saved",
  "measurement_ids": ["msr_01"],
  "derived_value_origin": "direct_observed"
}
```

## 4. UI チャンク / data-testid

| chunk | 役割 | data-testid |
|---|---|---|
| dictionary_header | 対象/性別/段階に応じた候補説明 | `obs-dd-scope-chip` |
| measurement_rows | 項目行の繰り返し | `obs-dd-row` |
| name_dropdown | 項目名 DD | `obs-dd-name-select` |
| unit_dropdown | 単位 DD | `obs-dd-unit-select` |
| method_dropdown | 方法 DD | `obs-dd-method-select` |
| add_custom | 自由入力追加 | `obs-dd-add-custom` |

## 5. R2 / event_store（INSERT ONLY）

- `ihl/observation/events/measurement_dictionary_selected.jsonl`
- `ihl/observation/events/measurement_dictionary_extended.jsonl`
- `ihl/observation/events/measurement_input_saved.jsonl`（既存 measurement 保存に紐付け）
- 行更新は禁止し、編集は `row_version` を持つ追記で表現する。

## 6. ver1 / ver2 境界

- ver1 IN: 項目/単位/方法 DD、自由入力追加、manual 系の保存。
- ver2 OUT: SwitchBot デバイス管理・機器紐付け UI（`C-3`）、タグ自然淘汰（`C-2`）。

## 7. E2E クロスリファレンス

- `SC-05-BULK-01`
- `SC-05-CONFIRM-01`
- `SC-05-NEG-03`
- `02-設計/E2E/sub/SC-05-DD-INPUT-v1-DRAFT.md`（PW-5 予定）

## 8. 相互参照

- `02-設計/features/05-観測/sub/WaveB-context-詳細設計-v1-DRAFT.md`
- `02-設計/features/05-観測/sub/WaveD-photo-詳細設計-v1-DRAFT.md`
- `02-設計/features/28-個体命名/詳細設計-v1-DRAFT.md`
