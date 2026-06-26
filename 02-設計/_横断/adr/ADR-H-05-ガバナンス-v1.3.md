# ADR-H-05: IHL ガバナンス拡張規約 v1.3

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-05-governance-v1.3  
> **出典**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア` **8. ガバナンス拡張規約 v1.3**  
> **正本**: 本 ADR · [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md)

---

## 文脈

設計規約 v1.2（ADR-H-04）で Truth Layer を整理したうえで、**誰が・何を・どの出所で**記録したか、Template / Actor / AI の統治境界を v1.3 として固定する。アーキテクチャの一方向フロー:

```text
Truth → Event → Snapshot → AI（派生）
```

---

## 決定

### 1. Annotation / Label — source_type 追加

**AnnotationEvent**（ADR-H-04 列 + 以下）

```
annotation_event_id, target_type, target_id, annotation_type,
annotation_value, actor_id, source_type, confidence, created_at
```

**LabelEvent**

```
label_event_id, target_type, target_id, label_name,
label_value, actor_id, source_type, confidence, created_at
```

| source_type（enum 案） | 意味 |
|------------------------|------|
| `human` | 人手入力 |
| `model` | 単一モデル推論 |
| `reviewer` | 査読者確定 |
| `batch` | バッチ処理 |
| `consensus` | 合意・多数決 |

- Annotation / Label は **Truth** として append-only 保存
- 学習データセットは **派生成果物**

### 2. Template Governance

| イベント | 主要列 |
|----------|--------|
| **TemplateReviewEvent** | `template_review_event_id`, `template_id`, `actor_id`, `review_type`, `review_text`, `created_at` |
| **TemplateRatingEvent** | `template_rating_event_id`, `template_id`, `actor_id`, `rating_value`, `created_at` |

- Template Approval · Template Ranking は **Snapshot**（再生成可能）
- **Template 自体はコミュニティ資産**（fork · citation · usage で履歴化）

### 3. Actor Governance

- **Actor は削除しない**。状態遷移は Event で表現

**ActorStatusEvent**

```
actor_status_event_id, actor_id, status, event_reason, created_at
```

| status（enum 案） | 意味 |
|-------------------|------|
| `active` | 通常 |
| `suspended` | 一時停止 |
| `retired` | 引退（データ保持） |
| `banned` | 利用禁止 |
| `system` | システムアカウント |

- 08 カルマ **永久 BAN** との接続は詳細設計で `ActorStatusEvent` + karma snapshot を突合（本 ADR は境界のみ）

### 4. AI Governance

| 記録 | 主要列 | Truth? |
|------|--------|:------:|
| **ModelRun** | `model_run_id`, `model_name`, `model_version`, `input_snapshot_id`, `output_path`, `created_at` | 実行ログ（監査用 Truth イベント列） |
| **ModelEvaluation** | `model_evaluation_id`, `model_run_id`, `dataset_snapshot_id`, `metric_name`, `metric_value`, `created_at` | 評価結果は **Snapshot**（再生成可） |

- **AI モデル artifact 自体は Truth ではない**（R2 `derived/` 等の派生物）
- 評価指標は ModelEvaluation から Snapshot 再生成

### 5. 派生成果物（再掲 — v1.3 境界）

Research Score · Template Ranking · Recommendation · Knowledge Graph · Lineage · Feature Snapshot · Embedding · Training Dataset · Model Artifact · Index

**Truth の中心**: Actor · Cross · CrossParent · Measurement · Observation · Content · Template（定義） · 各種 *Event（append-only）

---

## 成熟度評価（出典 §8 要約）

Truth / Event / Snapshot / AI の一方向分離により、**上位アーキテクチャとして十分成熟** — 以降の詳細設計・YAML 化は本 ADR を前提に進めてよい（**設計ゲート 4 点の人間確定は別途**）。

---

## 影響

- **11 裁判** · **12 設定** · **13 データ取得元** の Actor 状態表示は ActorStatusEvent を参照
- **18 写真解析** · Phase 3 AI は ModelRun / Annotation source_type を必須
- civ-os legacy `authLogic` のロール表現は **salvage**。IHL 正本は Event 列

---

## 参照

- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md)
- [`08-カルマシステム.md`](./08-カルマシステム.md) · [`11-裁判.md`](./11-裁判.md)
- [`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア`](../../../2026.06.08/アイディア) §8
