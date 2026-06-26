# OSS 選定 — Component 対応マップ v1

> **ステータス**: **草案 v1 · 人間レビュー待ち**
> **作成日**: 2026-06-08
> **正本**: [`ADR-Phase1-OSS選定表.md`](../02-設計/_横断/adr/ADR-Phase1-OSS選定表.md) · [`ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md) · Phase2 ADR 群 · [`00-土台-MiniKernel-C-USB-コンポーネント.md`](../01-要件/00-土台-MiniKernel-C-USB-コンポーネント.md)
> **実装禁止**: 設計ゲート 4 点未確定

---

## 1. 原則（再掲）

| 原則 | 内容 |
|------|------|
| **F7 薄ラップ** | OSS は swap 可能。固定するのは schema / manifest / ID / R2 キー |
| **三層分離** | 機能=`hooks/`·`libs/` · 見た目=CSS/トークン · 配置=PageColumn/Stack（Phase 2 Web） |
| **C-USB** | 1 component = 1 `run.py` = 1 manifest.yaml 契約（IHL） |
| **UI 最小** | 06/07 は Medusa/Discourse **パターン参照** · 状態機械は IHL 固定 |

---

## 2. Phase 境界 × OSS 採用

| Phase | 採用 OSS | 不採用 |
|-------|----------|--------|
| **0** | boto3 · uv · pytest | UI · embedding 本番 |
| **1** | Streamlit · DuckDB · Polars · Pillow/OpenCV · PyTorch+DINOv2 · numpy cosine · Docker · GHA · Pydantic | FAISS · Next · forum/market OSS 本体 |
| **2** | Next.js 15 + shadcn/ui · FAISS · FastAPI · Discourse bridge · Medusa UI パターン | 常駐 DB 正本 · エスクロー決済 OSS |

---

## 3. OSS → IHL ラップ層 → C-USB component

| OSS | ラップ（`libs/`） | C-USB component 例 | 固定契約 |
|-----|-------------------|-------------------|----------|
| boto3 / aioboto3 | `libs/r2_io.py` | （全 component 共通） | R2 キー階層 · no-overwrite |
| DuckDB | `libs/query.py` | manifest_search（概念） | query whitelist · searchable_capture_set 列 |
| Polars | `libs/manifest.py` | ingest 前処理 | dtype · value_origin |
| Pillow/OpenCV | `libs/image.py` | thumbnail_builder | 色補正禁止 · 4:3 |
| PyTorch+timm DINOv2 | `libs/embedding.py` | embedding_builder_dinov2 | embedding_dim · normalized · model_version |
| numpy cosine | `libs/similarity.py` | similar_search（Phase 1） | ADR-H-12 重み |
| FAISS（P2） | `libs/faiss_index.py` | similar_search_faiss | index manifest on R2 |
| Streamlit | `apps/search/` | —（UI 層 · component ではない） | 5 pane 構成 |
| Next.js+shadcn（P2） | `apps/web/components/ui/` | — | ルート規約 · **ThemePack → `--civ-*` bind**（ADR-H-17） |
| ThemePack / CSS vars | `libs/theme_pack.py`（概念） | theme_apply（概念） | `design_token.yaml` · R2 INSERT ONLY |
| Pydantic+jsonschema | `libs/schema_validator.py` | 全 component IN/OUT 検証 | `02-設計/_横断/schema/*.yaml` |
| pytest | `tests/` | contract test per component | immutability · round-trip |
| Discourse API（P2） | `libs/forum_bridge.py` | bbs_mirror（概念） | thread/post pointer イベント |
| Medusa（P2 参照のみ） | — | — | listing UI **レイアウト参照のみ** |

---

## 4. UI コンポーネント → shadcn / 機能分離（Phase 2 想定）

| IHL UI 部品 | shadcn / OSS | 機能層（分離） |
|-------------|--------------|----------------|
| **ThemePack 適用** | `:root` CSS vars · shadcn `cn()` + token | `useThemePack()` · ADR-H-17 |
| **UIbuilder テーマ編集** | Form · Color input（L3+）· Card プレビュー | `useThemeEditor()` · Phase 2 |
| Button / Input / Card / Tab / Badge | shadcn 同名 | `ui_primitive_catalog.yaml` variant bind |
| 観測フィルタ | Select · Input · Button | `useObservationSearch()` |
| 計測入力行 | Select · Input · ToggleGroup | `useMeasurementInput()` |
| テンプレカード | Card · Badge | `useMeasurementTemplates()` |
| マーケットカード | Card（Medusa 参照） | `useMarketListings()` |
| プライベートボード | ScrollArea · Textarea | `useTradeBoard()` |
| 掲示板スレッド | （Discourse 埋め込み or Card 列表） | `useBoardThreads()` |
| pairwise 2 枚 | Button × 2 + Card | `usePairwisePreference()` |
| 設定 PII フォーム | Form · Input · Switch | `useCounterpartyPii()` |
| 機器一覧 | Table · Badge | `useDeviceRegistry()` |
| 3 指標プロフィール | Card × 3 | `useProfileMetrics()` |

> **禁止**: ページ内 fetch べた書き · OSS API を UI から直接 import（`libs/` 経由）。

---

## 5. 機能 → component 分解（MiniKernel 対応）

| 機能 # | FeatureNode | Transform component | View（Phase） |
|--------|-------------|-------------------|---------------|
| 05 観測 | observation | ingest · thumbnail · embedding · manifest_builder | Streamlit → Next |
| 05 計測テンプレ | observation_template | template_store（概念）· measurement_bridge | 入力/一覧/詳細 |
| 06 マーケット | market | listing_state · auction · trade_events | Medusa パターン |
| 07 掲示板 | board | bbs_mirror · pointer | Discourse bridge |
| 10 好み | match | preference_event_writer | pairwise UI |
| 13 機器 | env_connector | collector_ingest | device registry |
| 18 写真解析 | photo_analysis | embedding_builder · qc_builder | — |
| **16 UIbuilder テーマ** | dev/builder | theme_pack_store（概念） | ThemePack エディタ · Phase 1 プリセット |

正本分解表: [`02-設計/_横断/component/00-マスターcomponent分解表.md`](../02-設計/_横断/component/00-マスターcomponent分解表.md)

---

## 6. civ-os C-USB との関係

| civ-os（憲法） | IHL（本 repo） |
|----------------|----------------|
| `C-USB.md` core+rag+io+compatibility | `manifest.yaml` in_schema/out_schema |
| `ComponentFramework.md` ITO | IN→Transform→OUT + run_info |
| `CoreEntityBase.md` | provenance 列 + actor（ADR-H-05） |
| C-Sync 4 媒体 | **不採用**（R2 append-only のみ） |

---

## 7. 未決（人間 Go）

| ID | 論点 |
|----|------|
| OSS-01 | Discourse vs GitHub Discussions（07） |
| OSS-02 | Medusa vs Saleor UI 参照（06） |
| OSS-03 | FastAPI 導入タイミング（Phase 2 前半 vs 後半） |
| OSS-04 | uv 採用確定（Phase1 ADR 草案） |
| OSS-05 | Streamlit Phase 1 の ThemePack 写像（`theme.toml` vs 注入 CSS）の parity 方針 |

---

## 8. ThemePack · デザイントークン（ADR-H-17）

| 成果物 | パス |
|--------|------|
| ADR | [`02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md`](../02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md) |
| トークン辞書 | `02-設計/_横断/schema/dictionaries/design_token.yaml` |
| Primitive catalog | `02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml` |
| UI 設計 | [`02-設計/features/16-UIbuilder/ui/テーマ.md`](../02-設計/features/16-UIbuilder/ui/テーマ.md) |

**境界**: OBS-TPL（計測テンプレ）· ScreenDef 配置 · `rag/theme.csv`（Twin 世界観）は **対象外**。

---

*草案 v1 · 非正本 / 人間レビュー用 / 実装禁止ゲート有効*
