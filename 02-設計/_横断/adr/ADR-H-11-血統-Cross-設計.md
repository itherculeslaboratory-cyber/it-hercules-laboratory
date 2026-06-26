# ADR-H-11: 血統・Cross 設計（CrossParent / OffspringAssignment / Lineage Snapshot）

> **ステータス**: 採用（人間確定 — 設計方針）／詳細は設計ゲート継続  
> **決定日**: 2026-06-07  
> **判断 ID**: H-11-lineage-cross  
> **出典**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア` §1–2・§7（CrossParent 完全移行）＋ ユーザー確定（2026-06-07）「**すごく大事な部分、丁寧に設計**」  
> **正本**: 本 ADR · [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md)（CrossParent 採用判断の上位）· [`05-観測.md`](./05-観測.md) · [`15-データ設計.md`](./15-データ設計.md) · [`02-設計/_ui-global/00-画面一覧-全体像.md`](../02-設計/_ui-global/00-画面一覧-全体像.md)

---

## 文脈

アイディア §1「最大の価値は **血統の証明** と再解析可能な研究履歴」。§2/§7 で **Cross から sire_id/dam_id を削除し CrossParent へ移行**、**Lineage は真実ではなく再構築 Snapshot** と確定（[ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §1）。

> ユーザー確定（2026-06-07）: 「血統と交配は **すごく大事な部分**。今 **丁寧に設計**していい（モック＋丁寧設計）。実装は後でも、設計は妥協するな。」

本 ADR は **血統・交配の Truth エンティティ・画面・モック**を確定する（実装の先送りではなく **Phase 1 設計の作り込み**）。

---

## 決定

### 1. Truth エンティティ（血統は Cross + OffspringAssignment が真実）

> **核心**: 親子関係の真実は **Cross と OffspringAssignment**。**Lineage（系統樹）は派生 Snapshot**（保存対象ではない・再構築可能）。

**Cross（Truth）** — 交配イベント（親情報を直接持たない）

```text
cross_id, cross_name, planned_at, executed_at,
actor_id, cross_status, created_at
```

`cross_status ∈ { planned, executed, failed, abandoned }`

**CrossParent（Truth）** — 親の参加（sire/dam を分離）

```text
cross_parent_id, cross_id, parent_role, individual_id, created_at
```

- `parent_role` は **Template 定義**（`sire` / `dam` は DHH テンプレ上の一例。コア固定 enum にしない — [ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §1）。
- 1 Cross に **N 親**を許容（多親テンプレ・将来拡張）。

**OffspringAssignment（Truth）** — 子個体の割当（Cross と Individual を疎結合）

```text
assignment_id, cross_id, child_individual_id, confidence, created_at
```

- **Cross と Individual を直接結合しない**（OffspringAssignment 経由・アイディア §2）。
- `confidence` = 親子確度（DNA 未確定でも記録可。後から新 assignment で更新 = append-only）。

**Individual（Truth · [`05`](./05-観測.md) 正本）**

```text
individual_id, species, local_label, created_at
```

### 2. Lineage = Snapshot（再構築・真実ではない）

| 項目 | 内容 |
|------|------|
| **生成元** | Cross + CrossParent + OffspringAssignment を辿って再構築 |
| **保存** | `ihl/lineage/snapshots/` に **再生成可能 Snapshot** として（Truth ではない） |
| **含む** | `ancestor_summary` / `descendant_summary` / `lineage_summary`（祖先・子孫・世代集計） |
| **集計** | 世代ごとの成績・成長・死亡・繁殖実績（アイディア §1）は **Snapshot 集計**（Measurement/Observation/Event から） |

→ **モデルや確度が変わっても Truth は不変**、Lineage Snapshot を **再計算するだけ**で系統樹が更新される（再解析可能性 = アイディア §1 の核心）。

### 3. 画面（3 つ）

| 画面 | ルート（案） | 主タスク（1 つ） | クリック |
|------|--------------|------------------|:--------:|
| **個体（Individual）** | `/individual/:id` | 個体の計測・観察・所属 Cross・親子を確認 | 1–2 |
| **交配（Cross）** | `/cross/:id` | 親（CrossParent）・子（OffspringAssignment）・サマリーを確認/記録 | 2 |
| **系統樹（Lineage Tree）** | `/lineage/:individualId` | 祖先・子孫を世代で辿る（Snapshot） | 2–3 |

**交配画面の構成**（モック参照）:

```text
[ヘッダ] 血統 › 交配 #CR-2041
─────────────────────────────────────────
[親 CrossParent]            [交配サマリー]
 個体カード×2（写真・ID）      cross_name / planned_at /
 役割chip sire/dam（テンプレ例） executed_at / status(executed)
─────────────────────────────────────────
[子個体 OffspringAssignment]  確度 0.92 等 ×N（サムネ）
─────────────────────────────────────────
[系統樹 Snapshot] 祖父母→親→本交配→子（再構築・真実ではない 注記）
[主ボタン] この交配を記録
```

**モックアップ**: [`../02-設計/_ui-global/mockups/mockups/mockups/ihl-03-lineage-cross.png`](../02-設計/_ui-global/mockups/mockups/mockups/ihl-03-lineage-cross.png)

![血統・交配（親/子/系統樹）](../02-設計/_ui-global/mockups/mockups/mockups/ihl-03-lineage-cross.png)

**UI 原則**（[`preferences.md`](../../../../ui-reference/preferences.md)）:

- 写真は **色補正なし**・撮影条件併記（[`ui-reference/lineage/notes.md`](../../../../ui-reference/lineage/notes.md)）。
- 系統樹は thin line（`#2A2A2A`）・装飾色なし。`status` のみ意味色（executed=`#5CD68D`）。
- 「**系統樹は再構築 Snapshot（真実ではない）**」を画面に明記（誤解防止）。
- 親役割に「**テンプレ定義（コア固定ではない）**」注記。

### 4. Phase 1 設計用モック一覧（実装先送りではなく設計の作り込み）

> 「丁寧に設計」= 下記モック/ワイヤーを **Phase 1 で揃える**（実装ゲート前でも設計は完成させる）。

| # | モック / ワイヤー | 状態 | 置き場 |
|---|-------------------|------|--------|
| 1 | **交配画面**（親/子/サマリー/系統樹） | **済** | [`mockups/ihl-03-lineage-cross.png`](../02-設計/_ui-global/mockups/mockups/mockups/ihl-03-lineage-cross.png) |
| 2 | 個体画面（計測・観察・所属 Cross・親子リンク） | 草案（[`05`](./05-観測.md) 個体詳細を流用 → 血統タブ追記） | `mockups/ihl-05-obs-detail-similar.png` ＋ 追補 |
| 3 | 系統樹フルページ（多世代・折り畳み） | **要追加**（交配画面内の縮小版は済） | UI 設計 詳細時に PNG 追加 |
| 4 | Cross 記録フロー（planned → executed → 子割当） | 状態遷移図（テキスト）→ 詳細設計で図化 | [`15-データ設計.md`](./15-データ設計.md) 連携 |
| 5 | OffspringAssignment 確度更新（append-only） | テキスト契約（本 ADR §1）→ UI は詳細設計 | — |

**モックの目的**: 親子の **疎結合（CrossParent / OffspringAssignment）**と **Lineage=Snapshot** を **目で確認**し、誤って「Cross に親 ID 直結」「系統樹を保存テーブル化」する実装を防ぐ。

---

## 5. R2 パス（IHL）

```text
ihl/lineage/
├── events/                         # Truth（append-only JSONL）
│   ├── cross.jsonl
│   ├── cross_parent.jsonl
│   ├── offspring_assignment.jsonl
│   └── life_event.jsonl            # birth/death/molt/eclosion（Template 定義 event_type）
└── snapshots/                      # 再生成可能（Truth ではない）
    ├── ancestor_summary/
    ├── descendant_summary/
    ├── lineage_summary/
    ├── cross_summary/
    └── cross_growth_summary/       # 世代別 成長/成績/死亡/繁殖 集計
```

- Individual / Capture / Measurement / Observation は [`05`](./05-観測.md) の `ihl/` ツリー（観測正本）と共有。
- **状態（Observation）と変化（Event）の責務分離**（[ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §2）: `alive_status=dead` は Observation、`death` は life_event。

---

## 6. 影響

- **05 観測**: 個体詳細に **血統タブ**（所属 Cross・親 CrossParent・子 OffspringAssignment・系統樹リンク）を追記。
- **15 データ設計**: Cross / CrossParent / OffspringAssignment / Lineage(Snapshot) を CoreEntityBase 準拠で YAML 化（詳細設計）。
- **09 論文**: 研究 Content は Cross / Lineage を **Citation**（[ADR-H-09](./ADR-H-09-研究フロー-低コスト設計.md)）。血統の証明が研究履歴の根拠。
- **18 写真解析**: 親子確度・形態計測の AI 出力は `AnnotationEvent`（source_type・[ADR-H-05](./ADR-H-05-ガバナンス-v1.3.md)）。OffspringAssignment.confidence の入力。
- **実装 Go 不可** — 設計ゲート 4 点は別途人間確定（血統は重要部位ゆえ **詳細設計・遷移・UI を特に丁寧に**）。

---

## 参照

- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §1–2 — CrossParent / Observation・Event
- [`ADR-H-12-D02-類似検索重み.md`](./ADR-H-12-D02-類似検索重み.md) — lineage 類似度 0.1 の意味
- [`05-観測.md`](./05-観測.md) · [`15-データ設計.md`](./15-データ設計.md)
- [`01-要件/28-個体命名・ブランドテンプレート-v1-DRAFT.md`](../../../01-要件/28-個体命名・ブランドテンプレート-v1-DRAFT.md) — Q7 確定: C（表示は ♂/♀、truth は `parent_role`）
- [`docs/2026.4.4/lineage-feature-node-scope.md`](../../../../docs/2026.4.4/lineage-feature-node-scope.md) — 血統は別 FeatureNode（本体分離）
- [`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア`](../../../2026.06.08/アイディア) §1–2・§7
