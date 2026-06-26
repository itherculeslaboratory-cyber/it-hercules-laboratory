# ADR-H-04: IHL 設計規約 v1.2（Truth / Snapshot / Template First）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-04-design-v1.2  
> **出典**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア` **7. 設計規約追加 v1.2**  
> **正本**: 本 ADR · [`00-土台-MiniKernel-C-USB-コンポーネント.md`](./00-土台-MiniKernel-C-USB-コンポーネント.md) · [`05-観測.md`](./05-観測.md) §⑪

---

## 文脈

2026.06.08 アイディア §7 は、Cross 親子表現・Observation/Event 責務・Research Gap 統合・AI 教師データ・Template Marketplace 準備など、Truth Layer の境界を v1.2 として整理する。**CrossParent による sire/dam 分離**は本 ADR が **唯一の採用判断**（詳細設計書 v0.2 の `Cross.sire_id` / `dam_id` 直結表記より優先）。

---

## 決定（採用項目）

### 1. CrossParent — sire/dam を Cross から分離

| 項目 | 内容 |
|------|------|
| **Cross（Truth）** | `cross_id`, `cross_name`, `planned_at`, `executed_at`, `actor_id`, `cross_status`, `created_at` のみ |
| **CrossParent（Truth）** | `cross_parent_id`, `cross_id`, `parent_role`, `individual_id`, `created_at` |
| **parent_role** | Template で定義可能。**sire / dam は DHH テンプレート上の一例**でありコア固定 enum ではない |
| **Lineage** | Cross + OffspringAssignment から **再構築する Snapshot**。Truth ではない |

### 2. Observation と Event の責務分離

| 層 | 意味 | 例 |
|----|------|-----|
| **Observation** | **状態**（時点の観測） | `alive_status=dead`, `life_stage=adult` |
| **Event** | **変化**（状態遷移の発生） | `death`, `eclosion`, `molt` |

- 規約: **状態 = Observation · 変化 = Event**
- `event_type` の life 系（birth, death, molt, pupation, eclosion 等）は **Template 定義を優先**。コア固定リストとしない

### 3. Research Gap → Content 統合

| 項目 | 内容 |
|------|------|
| **独立 Truth Layer** | **採用しない** |
| **正** | `Content` に `content_type=research_gap` を追加 |
| **拡張属性** | Research Gap 固有列は **Content Extension** として保持（`gap_id`, `priority`, `status` 等） |

### 4. DataUsage と UsageEvent

| エンティティ | 責務 |
|--------------|------|
| **UsageEvent** | プラットフォーム **利用履歴**（検索・閲覧・保存・共有等の **人間行動**） |
| **DataUsage** | 研究成果が **どのデータを根拠に利用したか**（研究参照履歴） |

Recommendation · Research Score · Market Ranking · Knowledge Graph 生成の入力として **UsageEvent は Truth Layer の重要オブジェクト**。

### 5. Snapshot 明示（経済・信用）

| 項目 | Truth? | 備考 |
|------|:------:|------|
| **PT Summary.current_pt_balance** | ✗ | Snapshot。`PTEvent` から再計算 |
| **Research Score Summary** | ✗ | Snapshot。Content / Citation / Discussion / ContributionEvent 等から再計算 |

### 6. AI 教師データ（Truth 追加）

**AnnotationEvent**

```
annotation_event_id, target_type, target_id, annotation_type,
annotation_value, actor_id, confidence, created_at
```

**LabelEvent**

```
label_event_id, target_type, target_id, label_name,
label_value, actor_id, confidence, created_at
```

- 学習用データセットは **派生成果物**。真実の源泉は AnnotationEvent / LabelEvent

### 7. Template Platform（Truth 先行定義 · Marketplace は Phase 3）

| イベント | 主要列 |
|----------|--------|
| **TemplateUsageEvent** | `template_usage_event_id`, `template_id`, `actor_id`, `target_type`, `target_id`, `created_at` |
| **TemplateForkEvent** | `template_fork_event_id`, `parent_template_id`, `child_template_id`, `actor_id`, `created_at` |
| **TemplateCitation** | `citation_id`, `source_template_id`, `target_template_id`, `citation_type`, `created_at` |

- Knowledge Graph は **Template もノード**（利用回数・引用回数・Fork 回数を集計可能）
- Template Marketplace は **Phase 3**。Truth Layer 定義は先行固定

### 8. 派生成果物（Truth ではない — 再掲）

Lineage · Research Score · Knowledge Graph · Recommendation · Feature Snapshot · Embedding · Index · Training Dataset · Model Artifact

---

## 影響

- **05 観測** · **09 論文** · **14 貢献度** の詳細設計は CrossParent・Observation/Event 分離を前提に YAML 化する
- 詳細設計書 v0.2 の `Cross(sire_id, dam_id)` 表記は **本 ADR 採用後は obsolete**（salvage 参照のみ）
- **実装 Go 不可** — 設計ゲート 4 点は別途人間確定

---

## 参照

- [`ADR-H-05-ガバナンス-v1.3.md`](./ADR-H-05-ガバナンス-v1.3.md) — Annotation/Label の `source_type` · Actor/AI Governance
- [`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア`](../../../2026.06.08/アイディア) §7
- [`00-Phase0前-人間ToDoとAuto下準備.md`](../05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md)
