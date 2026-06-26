# ADR-H-17 — DesignTheme（ThemePack · デザイントークン · UI Primitive）

> **ステータス**: **草案 v1 · 人間レビュー待ち**（2026-06-09）
> **判断 ID**: H-17 / DesignTheme
> **前提 ADR**: [ADR-H-01](./ADR-H-01-uibuilder-reframe-adopted.md)（UIbuilder = 配置 + **デザイン** + catalog 紐づけ）· [ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §7（TemplateForkEvent）· [ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md)（OBS-TPL 境界）
> **正本辞書**: [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/design_token.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/design_token.yaml) · [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml)
> **UI 設計**: [`../../02-設計/features/16-UIbuilder/ui/テーマ.md`](../../02-設計/features/16-UIbuilder/ui/テーマ.md)
> **実装禁止ゲート**: 設計 4 点未確定（`.cursor/rules/design-before-implementation-gate.mdc`）

---

## 1. 文脈

UIbuilder（ADR-H-01）の **デザイン層**は、ScreenDef ブロックの `design.token_variant` とライブプレビューまでを含むが、**世界全体の見た目（テーマ）を一括管理する正本**が未定義だった。

| 混同しやすい概念 | 本 ADR の扱い |
|------------------|---------------|
| `rag/theme.csv`（Twin・世界観） | **非対象** — civ-os legacy RAG。IHL ThemePack とは別ドメイン |
| オンボーディング `theme: light/dark`（`03-新規登録.md`） | **Phase 2 で ThemePack 参照に統合**（ユーザー選択 = pack id） |
| 観測計測テンプレ（OBS-TPL · ADR-H-13） | **境界外** — 計測項目・単位・method。色・余白ではない |
| ScreenDef `content[]` | **境界外（配置）** — ブロック構造・binding。テーマは **参照のみ** |

**出典（ビジュアル）**: `ui-reference/preferences.md` §A（認知科学）· §B（血統 OS 黒基調トークン）· `frontend/src/index.css` の `--civ-*` 命名慣行。

---

## 2. 決定（要約）

1. **`ThemePack`** を第一級エンティティとする（R2 INSERT ONLY · fork 可能）。
2. トークン正本は **`design_token.yaml`**（`--civ-*` CSS 変数カタログ）。ThemePack は **許可トークンの値のみ**上書き可能。
3. UI 部品の見た目契約は **`ui_primitive_catalog.yaml`**（Button / Input / Card / Tab / Badge の variant と token 参照）。
4. **世界既定（world default）** ThemePack を 1 つアクティブにし、**全 ScreenDef レンダラ**へ `:root` CSS 変数注入で適用する。
5. **fork** = 親 ThemePack から派生（新 `theme_pack_id` + `ThemeForkEvent` INSERT）。上書き禁止。
6. **UIbuilder テーマ編集**は Phase 1 では **プリセット選択のみ**、Phase 2 で **トークン編集 + primitive プレビュー**。
7. OBS-TPL・ScreenDef 配置・catalog 機能紐づけは **本 ADR のスコープ外**（境界 §8）。

---

## 3. `ThemePack` データ契約

```jsonc
{
  "theme_pack_id": "tp_01J...",           // ULID · INSERT ONLY
  "schema_version": "theme_pack_v1",
  "title": "血統 OS ダーク（既定）",
  "description": "preferences.md §B 準拠の黒基調",
  "parent_theme_pack_id": null,           // fork 時に親 id
  "scope": "world_default",               // world_default | feature_override | screen_override
  "scope_ref": null,                      // feature_node id / screen_def_id（override 時）
  "status": "active",                     // draft | active | deprecated
  "tokens": {                             // design_token.yaml の key のみ
    "--civ-bg-deep": "#0D0D0D",
    "--civ-bg-section": "#121212",
    "--civ-fg": "#E6E6E6",
    "--civ-semantic-success": "#5CD68D",
    "--civ-semantic-danger": "#FF6B6B",
    "--civ-semantic-info": "#4DA3FF"
  },
  "primitive_variant_defaults": {         // ui_primitive_catalog 参照
    "button": "primary",
    "input": "default",
    "card": "surface",
    "tab": "underline",
    "badge": "muted"
  },
  "created_at": "2026-06-09T00:00:00Z",
  "actor_id": "20260414-ITHL-Herc-Labo-ratoryOS"
}
```

| フィールド | 必須 | 内容 |
|------------|:----:|------|
| `theme_pack_id` | ○ | `tp_{ulid}`。版管理の主キー |
| `parent_theme_pack_id` | fork 時 ○ | 系譜。null = ルート pack |
| `scope` | ○ | 適用範囲（§5） |
| `scope_ref` | override 時 ○ | `feature_override` → FeatureNode id · `screen_override` → `screen_def_id` |
| `tokens` | ○ | `design_token.yaml` に存在する key のみ。値は `type` に適合 |
| `primitive_variant_defaults` | ○ | 5 primitive の既定 variant id |
| `status` | ○ | `active` は同一 scope で **1 つのみ**（世界既定は world で 1 件） |

> **不変条件 INV-TP-01**: `tokens` に catalog 外の CSS 変数名を書けない（lint）。
> **INV-TP-02**: 保存は R2 **INSERT ONLY**。修正 = 新 `theme_pack_id`。
> **INV-TP-03**: 装飾目的の新トークン invent 禁止（`preferences.md` §A「色は意味のみ」）。

---

## 4. CSS 変数 `--civ-*` と primitive catalog

### 4.1 トークン辞書

正本: [`design_token.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/design_token.yaml)。

| カテゴリ | 例（`--civ-*`） | 用途 |
|----------|-----------------|------|
| `color.bg` | `--civ-bg-deep`, `--civ-bg-section`, `--civ-bg-card` | 背景階層 |
| `color.fg` | `--civ-fg`, `--civ-fg-muted`, `--civ-fg-disabled` | 本文・補足 |
| `color.border` | `--civ-border`, `--civ-border-subtle` | 枠線 |
| `color.semantic` | `--civ-semantic-success`, `--civ-semantic-danger`, `--civ-semantic-info`, `--civ-semantic-warning` | **意味色のみ** |
| `space` | `--civ-space-section`, `--civ-space-card`, `--civ-space-graph` | 余白（preferences §B 目安） |
| `radius` | `--civ-radius-card`, `--civ-radius-button` | 角丸 |
| `typography` | `--civ-font-family`, `--civ-font-size-body`, `--civ-line-height` | タイポ |

Phase 1 シード pack は **§B 血統 OS 黒基調** + **コア明るめ（light）** の 2 系統を同梱する。

### 4.2 UI Primitive catalog

正本: [`ui_primitive_catalog.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml)。

| primitive | variant 例 | 参照トークン |
|-----------|------------|--------------|
| **Button** | `primary`, `secondary`, `ghost`, `danger` | `--civ-semantic-*`, `--civ-radius-button` |
| **Input** | `default`, `error` | `--civ-border`, `--civ-semantic-danger` |
| **Card** | `surface`, `elevated`（影なし運用） | `--civ-bg-card`, `--civ-border`, `--civ-radius-card` |
| **Tab** | `underline`, `pill` | `--civ-fg`, `--civ-semantic-info` |
| **Badge** | `muted`, `success`, `danger`, `info` | semantic 色のみ |

ScreenDef ブロックの `design.token_variant` は **primitive + variant id** を指す（例: `card/surface`）。詳細設計は [`16-UIbuilder-詳細設計-v1.md`](./16-UIbuilder-詳細設計-v1.md) §3 拡張。

---

## 5. 世界既定（world default）と適用

```text
[ThemePack world_default · active]
        │
        ├─▶ :root { --civ-*: ... }  （全ルート・全 ScreenDef レンダラ）
        │
        ├─▶ feature_override（任意 · 1 FeatureNode）
        │       例: observation → 血統ダーク固定
        │
        └─▶ screen_override（任意 · 1 screen_def_id）
                例: ログインのみ light
```

| 優先度（高→低） | scope | 説明 |
|-----------------|-------|------|
| 1 | `screen_override` | 単一画面のみ |
| 2 | `feature_override` | FeatureNode 配下 |
| 3 | `world_default` | フォールバック |

**全画面適用（FR-DTH-06）**: Phase 2 Web はレンダラ root で active pack を解決し CSS 変数を注入。Phase 1 Streamlit は **同トークン値を `theme.toml` / 注入 CSS に写像**（完全 parity は Phase 2 目標）。

> **混同禁止**: ScreenDef の **配置・binding** はテーマで変えない。テーマは **見た目の変数と primitive variant** のみ。

---

## 6. fork（派生）

[ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §7 の Template 思想に合わせ、ThemePack fork は次を満たす。

| 項目 | 内容 |
|------|------|
| 操作 | 親 pack を選び **新 `theme_pack_id` で INSERT**（トークン差分を `tokens` に保持） |
| イベント | `ThemeForkEvent`: `theme_fork_event_id`, `parent_theme_pack_id`, `child_theme_pack_id`, `actor_id`, `created_at` |
| 公開 | L4 の **fork Apply**（UIbuilder · ADR-H-01）または Governance 承認後 `status: active` |
| 禁止 | 親 pack の UPDATE / DELETE |

**世界既定の切替**: 新 pack を `active` にする際、旧 world_default は `deprecated` へ（新イベントで状態遷移 · Truth はイベント列）。

---

## 7. Phase 1 / Phase 2

| Phase | ThemePack | UIbuilder テーマ編集 | レンダラ |
|-------|-----------|----------------------|----------|
| **1** | 同梱 2 pack（`ihl-lineage-dark`, `ihl-core-light`）· 選択のみ | **プリセット選択**（L1: 名前のみ · L3+: pack id 表示） | Streamlit + 静的 CSS |
| **2** | R2 上で fork · カスタム pack 蓄積 | **トークン編集 + 5 primitive プレビュー**（§9 UI） | Next.js + shadcn（トークン bind） |

Phase 1 で **テーマエディタのフル機能は出さない**（ユーザー向け「未実装」禁止 → 「プリセットから選ぶ」導線で事実ベース表示）。

---

## 8. 境界（OBS-TPL · ScreenDef · catalog）

| 隣接 | 関係 | 本 ADR |
|------|------|--------|
| **OBS-TPL**（ADR-H-13） | 計測項目テンプレ · `measurement_name` · `target_scope` | **触らない**。テンプレ Fork ≠ ThemePack fork |
| **ScreenDef** | `content[]` 配置 · `binding` | `design.token_variant` が primitive を参照。**レイアウト order/gap は ScreenDef** |
| **catalog/components** | 機能部品（value_check 等） | 部品の **ロジック**は catalog。見た目は ThemePack + primitive |
| **観測写真** | 色補正禁止（preferences §C） | ThemePack は **UI chrome のみ**。画像フィルタに使わない |

```text
  ThemePack ──tokens──▶ :root CSS vars
       │
       └──primitive defaults──▶ ScreenDef.design.token_variant
                                      │
  OBS-TPL ──fields──▶ 05i 入力（別系統）   ScreenDef.layout / binding（別系統）
```

---

## 9. 機能要件 FR-DTH-01〜10

| ID | 要件 |
|----|------|
| **FR-DTH-01** | `ThemePack` を R2 上の第一級エンティティとし、`theme_pack_v1` schema で lint する。 |
| **FR-DTH-02** | トークン許可リストは `design_token.yaml` を単一の出所とする。catalog 外 `--civ-*` は拒否（INV-TP-01）。 |
| **FR-DTH-03** | UI primitive は `ui_primitive_catalog.yaml` の 5 種（Button / Input / Card / Tab / Badge）に固定。Phase 2 まで増やさない。 |
| **FR-DTH-04** | 世界（world）に **active な `world_default` ThemePack を 1 つ**持てる。未設定時は `ihl-lineage-dark` を同梱既定とする。 |
| **FR-DTH-05** | ThemePack の fork は INSERT ONLY + `ThemeForkEvent`。親の上書き禁止（INV-TP-02）。 |
| **FR-DTH-06** | active ThemePack の `tokens` を **全 ScreenDef レンダラ**へ CSS 変数として適用する（scope 優先度 §5）。 |
| **FR-DTH-07** | UIbuilder のテーマ編集は **デザイン層のみ**（FR-16-REFRAME-01）。配置・catalog 紐づけ・OBS-TPL 編集を含めない。 |
| **FR-DTH-08** | L1 は **プリセット名での選択**のみ。L3+ はトークン個別編集（Phase 2）。L1 に hex 直打ち・生 JSON を見せない（NFR-16-03）。 |
| **FR-DTH-09** | 色トークンは **意味色 + 中立グレー**に限定。WCAG AA を目標に contrast 警告を lint（preferences §B）。 |
| **FR-DTH-10** | Phase 1 = プリセット · Phase 2 = エディタ + fork。実装タイミングで `accepted_requirements.csv` へ昇格（本 ADR は要件層草案）。 |

---

## 10. 非機能要件

| ID | 内容 |
|----|------|
| NFR-DTH-01 | R2 INSERT ONLY（ProjectRules 思想 · ADR-H-03） |
| NFR-DTH-02 | テーマ適用は **FOUC 最小化**（:root 注入を初回 paint 前） |
| NFR-DTH-03 | 主要導線: Builder → テーマタブ → プリセット選択 → プレビュー → 保存（3 クリック以内） |
| NFR-DTH-04 | エラー時は raw CSS パースエラーを出さず「この色は使えません」等の平易文言 |

---

## 11. 設計ゲート 4 点

| # | 成果物 | 状態 |
|---|--------|------|
| 1 | 要件（本 ADR · FR-DTH） | **草案 v1 · 人間レビュー待ち** |
| 2 | 詳細設計 | [`16-UIbuilder-詳細設計-v1.md`](./16-UIbuilder-詳細設計-v1.md) §2.3 追記 |
| 3 | 遷移設計 | [`16-UIbuilder-遷移設計-v1.md`](./16-UIbuilder-遷移設計-v1.md) §1.4 追記 |
| 4 | UI 設計 | [`16-UIbuilder-UI設計-v1.md`](./16-UIbuilder-UI設計-v1.md) · [`../../02-設計/features/16-UIbuilder/ui/テーマ.md`](../../02-設計/features/16-UIbuilder/ui/テーマ.md) |

---

## 12. 参照

- [`16-UIbuilder.md`](./16-UIbuilder.md) §12.3（デザイン層）· §14
- [`ADR-H-01-uibuilder-reframe-adopted.md`](./ADR-H-01-uibuilder-reframe-adopted.md)
- [`ADR-H-13-観測計測テンプレ契約.md`](./ADR-H-13-観測計測テンプレ契約.md)（OBS-TPL 境界）
- `ui-reference/preferences.md` §A · §B
- [`02-設計/_横断/oss-selection-component-map-v1.md`](../02-設計/_横断/oss-selection-component-map-v1.md) §4（shadcn 対応）

---

*草案 v1 · 非正本 / 人間レビュー用 / 実装禁止ゲート有効*
