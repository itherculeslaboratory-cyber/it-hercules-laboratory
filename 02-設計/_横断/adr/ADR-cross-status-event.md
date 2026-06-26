# ADR: CrossStatusEvent（cross_status 変化の append-only 化）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **作成日**: 2026-06-08
> **判断 ID**: H-cross-status-event
> **解消ギャップ**: P0-DATA-03 / CP-G-01 / AO-G-02（Cross は Truth=append-only だが `cross_status` が変化する → 矛盾）
> **正本前提**: [`ADR-H-11-血統-Cross-設計.md`](./ADR-H-11-血統-Cross-設計.md) §1 · [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §2（状態 vs 変化）· [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) §4

---

## 文脈

ADR-H-11 §1 の Cross（Truth）は `cross_status ∈ {planned, executed, failed, abandoned}` を持つ。しかし:

- Truth は **append-only**（UPDATE/DELETE 禁止・README §4）。
- ところが `cross_status` は時間とともに **変化する**（planned → executed 等）。
- `cross.jsonl` の行を更新すると append-only に違反する。

ADR-H-04 §2 の大原則「**状態（state）と変化（change）を分離する**」に従い、**変化はイベントで表す**必要がある。これが CrossStatusEvent 不在（P0-DATA-03）として未解決だった。

---

## 決定

### 1. cross.jsonl は「不変の初期事実」だけを持つ

`cross.jsonl`（Truth）は交配の **生成時点の不変属性** のみ:

```text
cross_id, cross_name, planned_at, actor_id, created_at, schema_version
```

> ★ `cross_status` と `executed_at` は **cross.jsonl から外し**、変化イベントへ移す（ADR-H-11 §1 の列定義はこの ADR で精緻化）。

### 2. CrossStatusEvent（Truth · append-only）で状態変化を表す

```yaml
$schema_name: cross_status_event
schema_version: 1
layer: truth              # append-only
required: [cross_status_event_id, cross_id, new_status, event_at, actor_id, created_at, schema_version]
properties:
  cross_status_event_id: { type: string }
  cross_id:          { type: string }
  new_status:        { type: string, enum_ref: dictionaries/cross_status.yaml }
  event_at:          { type: string, format: date-time }   # 実際に状態が変わった時刻
  event_reason:      { type: string }                      # 訂正・中止の理由（任意）
  action:            { type: string, enum: [set, correct] } # 訂正も新イベント（README §4-3）
  actor_id:          { type: string }
  source_type:       { type: string, enum_ref: dictionaries/source_type.yaml }
  created_at:        { type: string, format: date-time }
```

- `executed_at` は `new_status=executed` の CrossStatusEvent.event_at で表現する。
- 訂正は UPDATE せず `action=correct` の **新イベント**を積む。

### 3. 現在状態は Snapshot で再計算

`cross_summary`（Snapshot）の `current_status` は:

- 当該 cross_id の CrossStatusEvent を `event_at`（タイブレーク created_at）で並べ、**最新の new_status** を採用。
- 許可辺（`cross_status.yaml` の transitions_hint）に反する遷移は **CI/集計時に warning** を立てる（Truth は拒否しない＝記録は残す）。

```
cross.jsonl(planned 初期) + CrossStatusEvent[planned→executed→...] → cross_summary.current_status
```

---

## 許可辺（参考・詳細設計で確定）

| from | 許可 to |
|------|---------|
| (新規) | planned / executed |
| planned | executed / failed / abandoned |
| executed | failed（事後訂正のみ・action=correct 推奨） |
| failed / abandoned | （終端。訂正は action=correct で再設定可） |

> 厳格な状態機械は **Truth では強制しない**（記録の自由）。整合性は Snapshot 再計算と CI warning で担保する。

---

## 影響

- **schema**: `02-設計/_横断/schema/events/cross_status_event.schema.yaml` を新設。`cross.schema.yaml` から `cross_status/executed_at` を削除。
- **ADR-H-11**: §1 の Cross 列定義を本 ADR で上書き（cross.jsonl はステータスを持たない）。
- **UI**: `/cross/:id` の status chip は Snapshot.current_status を表示（[`02-設計/features/05-観測/ui/血統-Cross-画面.md`](../../02-設計/features/05-観測/ui/血統-Cross-画面.md)）。
- **遷移**: Cross 記録フロー（planned→executed→子割当）は CrossStatusEvent の連続として遷移設計する（ADR-H-11 §4 #4）。

---

## 参照

- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §2
- [`ADR-H-11-血統-Cross-設計.md`](./ADR-H-11-血統-Cross-設計.md) §1/§5
- [`02-設計/_横断/schema/dictionaries/cross_status.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/cross_status.yaml)
- [`02-設計/_横断/schema-yaml-draft-v1.md`](../02-設計/_横断/schema-yaml-draft-v1.md) §7 N-4

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
