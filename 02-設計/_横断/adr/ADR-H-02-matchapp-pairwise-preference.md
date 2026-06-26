# ADR-H-02: マチアプ — pairwise 優先 UX と preference_event 単一ストリーム（H-02 = B + 統一 UX）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-02  
> **正本**: 本 ADR · [`10-マチアプ.md`](./10-マチアプ.md)

---

## 文脈

MatchApp（画像 YES/NO stub）と ValueCheck（多次元マトリクス・採用済み）の統合方針が未決だった。

## 決定

**選択肢 B（併存・役割分担）+ 統一 UX** を採用する。

### 一次 UX（本番 IHL）

| 要素 | 仕様 |
|------|------|
| 形式 | **pairwise** — 2 枚画像、タップ **[左]** または **[右]**（どちらが ○ か） |
| 副次 | **[どちらも ×]** — 任意 1 タップ（両方不採用） |
| ルート | `/match` は **一般ユーザー向け「好み」導線**（dev-only ではない） |
| PoC 源 | civ-os **MatchApp SAMPLE** → IHL 本番 UI へ移植設計 |

### 詳細オプション

- **ValueCheck** は **詳細画面のみ** の writer（多次元 `dimension_matrix`）。
- 本線の pairwise / どちらも× は MatchApp 系フローが担当。

### データ契約

- **単一 append-only ストリーム**: `preference_event`（R2 JSONL 想定）
- `kind` 分支:
  - `pairwise_choice` — 左/右（+ 任意 どちらも×）
  - `binary_image` — レガシー YES/NO 互換（移行期のみ・新規は pairwise 優先）
  - `dimension_matrix` — ValueCheck 詳細のみ

### 同期・正本

- **civ-os タグ同期は行わない** — **IHL が canonical**。
- legacy `tag_event` は参照・salvage のみ。新規好み記録は `preference_event` を正とする。

## イベントスキーマ（たたき台 · 詳細設計で YAML 化）

| 列 | 説明 |
|----|------|
| preference_event_id | `pe_{ulid}` |
| kind | `pairwise_choice` \| `binary_image` \| `dimension_matrix` |
| user_id | JWT 主体 |
| session_id | 好みセッション（任意） |
| left_asset_id / right_asset_id | pairwise 時（capture_id 等） |
| choice | `left` \| `right` \| `neither` \| `skip` |
| dimensions | dimension_matrix 時（ValueCheck） |
| template_id | ValueCheck テンプレ（任意） |
| source | `match_ui` \| `valuecheck_detail` |
| created_at | ISO8601 |
| schema_version | 例: `preference_event_v1` |

## 影響

- [`10-マチアプ.md`](./10-マチアプ.md) の FR・appendix を本 ADR に整合。
- searchable rerank への反映は `preference_event` 集計パイプラインで設計（Phase 1 以降）。

## 参照

- [`10-マチアプ.md`](./10-マチアプ.md) §H-02 確定節
- `design/phases/Phase_value_alignment.md`
