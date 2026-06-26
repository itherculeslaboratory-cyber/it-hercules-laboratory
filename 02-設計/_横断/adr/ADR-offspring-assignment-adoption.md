# ADR: OffspringAssignment 採用ロジック（複数 assignment の正準判定）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **作成日**: 2026-06-08
> **判断 ID**: H-offspring-adoption
> **解消ギャップ**: P0-DATA-04 / AO-G-03（同一 (cross_id, child) に複数 OffspringAssignment が来たとき「どれが採用か」未決）
> **正本前提**: [`ADR-H-11-血統-Cross-設計.md`](./ADR-H-11-血統-Cross-設計.md) §1/§5 · [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §2 · [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) §4

---

## 文脈

OffspringAssignment（Truth · append-only）は子個体の親 Cross 割当を表す。`confidence`（親子確度）は **DNA 未確定でも記録し、後から新 assignment で更新**できる（ADR-H-11 §1）。

問題: 同一 `(cross_id, child_individual_id)` に **複数行**が積まれたとき、Lineage Snapshot 再構築で「**どの assignment を採用**するか」のルールが無い。これにより:

- 系統樹（descendant_summary）が **二重カウント / 矛盾**しうる。
- `confidence` 集計の分母が曖昧（P0-DATA-04）。

さらに **1 個体が複数 Cross に割り当てられる**（矛盾割当）ケースの正準化も必要。

---

## 決定

### 1. 採用 = 「最新かつ最高確度」の単一行（latest-wins + confidence tiebreak)

同一 `(cross_id, child_individual_id)` 群から **採用行 1 つ**を以下で決める:

1. `superseded_by` で **明示的に後継指定**された行は除外（取消・置換）。
2. 残りのうち **`created_at` が最大**の行を第一候補（最新意思を尊重）。
3. `created_at` が同時刻なら **`confidence` が最大**の行。
4. なお同点なら `assignment_id` の辞書順最大（決定的タイブレーク）。

> 「latest-wins」を基本とする理由: append-only では「後から積んだ行 = より新しい判断」が自然。confidence を一次キーにすると、古い高確度が新しい訂正を上書きしてしまう。

### 2. 個体の所属 Cross 正準化（child は原則 1 Cross に属する）

1 個体が **複数 Cross** に採用行を持つ矛盾は、Snapshot 再構築時に:

- 各 Cross の採用行のうち **`confidence` 最大**を「**primary cross**」とする。
- 他は `descendant_summary` で **`assignment_status=disputed`** として可視化（捨てない）。
- `disputed` がある個体は UI で **注意（#FFD66B）** 表示し、確定を促す。

### 3. confidence 集計（AI 入力との整合）

- AnnotationEvent(`annotation_type=parentage_hint`, source_type=model) は **OffspringAssignment を直接書き換えない**。
- AI 入力は新しい OffspringAssignment 行（`source_type=model`, `value_origin=model_inference`）として積み、§1 の採用ロジックで初めて反映される（人の最終確定を妨げない）。
- 集計の分母 = 採用行（disputed 除く）。分子 = `confidence >= 閾値`（閾値は詳細設計）。

---

## 採用ロジック擬似コード

```python
def adopt(rows):  # rows: 同一 (cross_id, child) の全 OffspringAssignment
    live = [r for r in rows if r.assignment_id not in superseded_ids(rows)]
    if not live:
        return None
    return max(live, key=lambda r: (r.created_at, r.confidence, r.assignment_id))

def primary_cross(child_rows_by_cross):  # 個体の複数 Cross
    adopted = {c: adopt(rs) for c, rs in child_rows_by_cross.items() if adopt(rs)}
    if not adopted:
        return None, []
    primary = max(adopted.values(), key=lambda r: r.confidence)
    disputed = [r for r in adopted.values() if r.cross_id != primary.cross_id]
    return primary, disputed
```

---

## 影響

- **schema**: `offspring_assignment.schema.yaml` に `superseded_by`（任意・弱参照）と `value_origin` を含める（[`02-設計/_横断/schema-yaml-draft-v1.md`](../02-設計/_横断/schema-yaml-draft-v1.md) §4）。
- **Snapshot**: `descendant_summary` / `cross_summary` の再構築 SQL は本ロジックを実装（P1-DATA-02 の pipeline 設計に組み込む）。
- **UI**: `/cross/:id` 子一覧で採用行を実線・disputed を注意色。`/individual/:id` 血統タブで primary cross と disputed を区別表示。
- **append-only 維持**: どの行も削除しない。採用は **再計算の結果**であって Truth の改変ではない。

---

## 参照

- [`ADR-H-11-血統-Cross-設計.md`](./ADR-H-11-血統-Cross-設計.md) §1/§5
- [`ADR-cross-status-event.md`](./ADR-cross-status-event.md)（同型: 変化を新イベントで・最新を Snapshot 採用）
- [`02-設計/_横断/ai-training-export-pipeline-v1.md`](../02-設計/_横断/ai-training-export-pipeline-v1.md)（confidence 集計の AI 入力）

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
