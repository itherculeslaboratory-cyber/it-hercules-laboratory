# 28-個体命名 — 詳細設計 v1 DRAFT

> ステータス: PW-1 詳細設計 DRAFT  
> 要件正本: `01-要件/28-個体命名・ブランドテンプレート-v1-DRAFT.md`（`IND-NAME-01..12`, Q1..Q7）  
> 重要前提: Q7=`C`（表示は ♂/♀、truth は `parent_role`）  
> 参照: `02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`

---

## 1. 目的・境界

- 観測入力で `individual_id + display_name` を扱う契約を確定し、命名/改名/昇格を append-only イベントで記録する。
- ver1 は命名運用（assign/rename/template CRUD）まで、評価自動化を伴う昇格ロジックは ver2 へ分離する。

## 2. FR トレース

| ID | 詳細設計での扱い |
|---|---|
| IND-NAME-01/02 | 入力・確認・一覧で `individual_id + display_name` 表示 |
| IND-NAME-03/04 | `name_event` 追記 + 時点再現 |
| IND-NAME-05..08 | `brand_template_event` による作成/更新/無効化/論理削除 |
| IND-NAME-09 | 血統表示は Q7=C（表示変換 + truth 維持） |
| IND-NAME-10..12 | ver2 OUT（昇格ロジック自動化）を明記 |

## 3. API 契約

### 3.1 テンプレ作成

`POST /api/v1/naming/templates`

```json
{
  "owner_user_id": "usr_01",
  "template_name": "王系テンプレ",
  "pattern": "{series}-{year}-{seq}",
  "series": "王",
  "active": true
}
```

```json
{
  "status": "created",
  "template_id": "tpl_king_01",
  "event_id": "evt_btpl_01"
}
```

### 3.2 観測入力で命名適用

`POST /api/v1/naming/apply`

```json
{
  "session_id": "sess_05i_01",
  "individual_id": "ind_aaa",
  "template_id": "tpl_king_01",
  "display_name": "王-2026-1",
  "action": "name_assigned"
}
```

```json
{
  "status": "applied",
  "name_event_id": "evt_name_01",
  "display_name": "王-2026-1"
}
```

### 3.3 改名

`POST /api/v1/naming/rename`

```json
{
  "individual_id": "ind_aaa",
  "old_name": "玉-2027-1",
  "new_name": "王-2027-1",
  "action": "name_renamed",
  "reason": "manual_promotion"
}
```

```json
{
  "status": "renamed",
  "name_event_id": "evt_name_02"
}
```

## 4. ブランドテンプレート schema（ver1）

| field | type | 備考 |
|---|---|---|
| `template_id` | string | 不変 ID |
| `owner_user_id` | string | 所有者 |
| `template_name` | string | UI 表示名 |
| `pattern` | string | 既定 `{series}-{year}-{seq}` |
| `series` | string | Q2 採番粒度に使用 |
| `active` | boolean | 論理有効/無効 |
| `created_at` | datetime | append-only |

## 5. 命名イベント型（ver1 IN）

- `name_assigned`: 初回命名  
- `name_renamed`: 改名  
- `name_promoted`: 昇格名付与（v1 は手動トリガのみ）  

## 6. UI チャンク / data-testid

| chunk | 役割 | data-testid |
|---|---|---|
| naming_summary | 個体ID+表示名サマリ | `obs-name-summary` |
| template_select | テンプレ選択 | `obs-name-template-select` |
| display_name_input | 手入力名 | `obs-display-name-input` |
| history_panel | 改名履歴表示 | `obs-name-history` |
| lineage_projection | 親子表示（Q7=C） | `lineage-name-projection` |

## 7. 観測入力フロー統合点

1. `05ctx` で対象個体を選択。  
2. `05i` でテンプレ選択または手入力。  
3. `05confirm` で `individual_id + display_name` を固定表示。  
4. commit 時に `name_event` を追記（観測イベントとは別 event_type）。  

## 8. R2 / event_store（INSERT ONLY）

- `ihl/naming/events/name_event.jsonl`
- `ihl/naming/events/brand_template_event.jsonl`
- projection:
  - `ihl/naming/snapshots/individual_current_name/{individual_id}.json`
  - `ihl/naming/snapshots/individual_name_history/{individual_id}.json`
  - `ihl/naming/snapshots/template_latest_state/{owner_user_id}.json`

## 9. Q7=C に基づく血統表示 projection

- truth: `CrossParent.parent_role`（`sire`,`dam`,`surrogate`...）を保持。  
- 表示: `sire→♂`, `dam→♀`, その他 role は role 文字列表示。  
- 表示形式例: `♂ 王-2026-1 (ind_aaa)` / `♀ 彩-2026-1 (ind_bbb)`。

## 10. ver1 / ver2 境界

- ver1 IN: assign/rename/template CRUD、手動 promotion 記録、Q7=C 表示投影。
- ver2 OUT: 最良個体判定アルゴリズム、自動昇格、複合シリーズ衝突解決。

## 11. E2E クロスリファレンス

- `SC-05-SOL-01`（入力〜確認〜登録）
- `SC-05-CONFIRM-01`（確認チャンク）
- `SC-05-REG-01`（登録成功）
- `SC-05-NEG-05`（候補と確定の分離）

## 12. 相互参照

- `02-設計/_横断/schema/schemas/events/name_event.schema.yaml`
- `02-設計/_横断/schema/schemas/events/brand_template_event.schema.yaml`
- `02-設計/features/05-観測/sub/WaveC-input-dd-詳細設計-v1-DRAFT.md`
- `02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`
