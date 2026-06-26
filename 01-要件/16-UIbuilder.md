# 16. UIbuilder — 機能要件定義（たたき台・非正本）

> **完成度**: △→設計 v1 — **H-01 解決（2026-06-07 · B）** — FR-16-REFRAME を要件正本（[ADR-H-01](../02-設計/_横断/adr/ADR-H-01-uibuilder-reframe-adopted.md)）。**テーマ**: [ADR-H-17](../02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md)（草案 v1 · 2026-06-09）。**詳細設計 △→v1**: [詳細](../02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md) · [遷移](../02-設計/features/16-UIbuilder/遷移設計-v1.md) · [UI](../02-設計/features/16-UIbuilder/ui/UI設計-v1.md) · [テーマ UI](../02-設計/features/16-UIbuilder/ui/テーマ.md)（いずれも草案 v1・人間確定待ち）。

> **用途**: 人間レビュー・設計 AI 引き継ぎ用。  
> **非正本**: 採用・実装判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/` を優先。  
> **根拠**: `01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §16、`design/phases/Phase8_builder_universal.md`、`frontend/src/builder/BuilderShell.tsx`、`docs/builder-coverage-matrix.md`  
> **作成日**: 2026-06-07

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ①機能概要（平易に3-5文）

UIbuilder は、文明 OS の画面・コンポーネント定義（ScreenDef）を編集する統合 IDE である。L1（ノーコード）から L4（開発者）まで層別に編集権限を分け、パレット・ツリー・D&D キャンバス・ライブプレビュー・fork v2 公開までを `/dev/builder` 系ルートで提供する。Phase8 の目標は全ルートを `screendef` / `hybrid` / `native` に分類し、native を ScreenDef 化して「万物フォーク」可能な万能 Builder に近づけることである。現状は dev 向け PoC と観測テンプレ・スケール紙 Builder が先行し、一般ユーザー向け L1 統合は未完である。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ②ユーザーができること

| 利用者層 | できること（現状） |
|----------|-------------------|
| **L1 ノーコード** | `/dev/builder/nocode-blocks` で積み木パレットからブロック追加・並べ替え（PoC）。本番 L1 統合は未完了。 |
| **L2 ローコード** | Builder IDE で改善案・系譜・AI アシストタブを利用（L2 モード切替）。 |
| **L3 上級** | ScreenDef のコード/R2 タブ、RAG 検索、Copy JSON。固体観測テンプレ・スケール紙 Universal Builder パネル。 |
| **L4 開発者** | Fork（`POST /api/fork/v2`）、Dev 固定（localStorage override）、META 編集。ルート別 ScreenDef 編集。 |
| **全認証ユーザー** | `/help/builder-capability` で L1/L2 と L3/L4 の能力境界を確認（オンボーディング未完了でも可）。 |

**fork v2 対象（entity_kind）**: `screen_def` / `labelme_template` / `value_check_template` / `scale_template` / `scale_sheet` / `kernel_bundle`（R2 INSERT ONLY）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ③スコープ内/外

### スコープ内（civilization-os）

- ScreenDef JSON の編集・lint・プレビュー・Dev 固定
- hybrid パイロット（`/manual`・`/complaint` 等）の ScreenDef 主導化
- fork v2 によるテンプレ・画面定義の系譜管理
- L1–L4 モードによる UI 出し分け（`builderMode.ts`）
- ルート掃引・Builder カバレッジ行列の自動生成（`export-route-matrix`）
- 観測スケール紙・固体テンプレートの Builder 入口（REQ-027）

### スコープ外

- 新規 API・新規本番ルートの黙示的追加（憲法・REQUIREMENTS 更新が別途必要）
- 経済マスター・司法・ProjectRules の UI からの変更
- Driver 本番ランタイムの追加（Builder 編集だけでは不可 — `builder-capability-boundary.md` §0）
- IHL（IT Hercules Laboratory）向け Streamlit UI の実装

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ④機能要件（番号付き）

### FR-16-01 層別 Builder モード

- L1 `nocode` / L2 `lowcode` / L3 `advanced` / L4 `dev` の 4 モードをツールバーで切替可能とする。
- 各層で表示タブ・Fork・Copy JSON・Dev 固定・META の出し分けは `design/Builder_layers_L1-L4.md` の表に従う。
- 未設定時は `advanced`（L3）を既定とし後方互換を保つ。

### FR-16-02 Builder IDE シェル

- `BuilderShell.tsx` が flexlayout-react ドック型レイアウトでパレット・ツリー・プロパティ・コード・プレビュー・D&D キャンバスを統合する。
- ルート文脈（`routeIdentity`）から編集対象 ScreenDef を解決できる。
- 観測スケール紙 Universal Builder パネルを IDE 内から開ける。

### FR-16-03 ScreenDef スキーマ整合

- Zod + `screen-def.schema.json` + Ajv による lint。`syncFromJson` は Zod 検証を通す。
- `LegacyContentRenderer` が解釈する `content[].type` を正本とする。

### FR-16-04 hybrid パターン

- レイアウト・説明は `componentData/*.json`、動的スロットは `hybrid_slot` + React 注入。
- dev ビルドでは Dev 固定により `localStorage` override で即反映可能。

### FR-16-05 fork v2 統一プロトコル

- `POST /api/fork/v2` で entity_kind 別に R2 へ INSERT ONLY 保存。
- 衝突時 409。`forks/v2/index.json` へレジストリ追記。

### FR-16-06 ルート分類とカバレッジ

- 全ルートを `screendef` / `hybrid` / `native` に分類（`route-matrix` 生成）。
- `docs/builder-coverage-matrix.md` を route-matrix と同時自動生成する。
- native 残は featureNode 単位 Pilot（Pilot-B13-*）で消化。1 path 1 行の機械的 `[ ]` 増殖はしない。

### FR-16-07 能力境界の明示

- `/help/builder-capability` に L1/L2 合成可能範囲と L3/L4 必須範囲を掲載。
- オンボーディング・マイページ・Builder ツールバーから 1 クリックで到達可能。

### FR-16-08 観測 Builder 入口（REQ-027）

- 固体観測テンプレート・スケール紙・QR ラベル印刷を Builder Hub の通常入口に整理する。
- `scale_sheet` と `scale_template`（機器校正）を混同しない。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑤非機能要件

| ID | 要件 |
|----|------|
| NFR-16-01 | R2 は INSERT ONLY。上書き・削除禁止（ProjectRules）。 |
| NFR-16-02 | C-USB 互換性検証をスキップしない。fork 公開は 4 媒体同期の対象。 |
| NFR-16-03 | L1 利用者に生 JSON・raw エラーを見せない（`preferences.md` §A）。 |
| NFR-16-04 | 主要導線は 3 クリック以内（Builder → 対象画面編集 or 能力境界ヘルプ）。 |
| NFR-16-05 | `export-route-matrix` 再生成後は PR に route-matrix / coverage-matrix 差分を含める。 |
| NFR-16-06 | E2E: `builder-dev-surface.spec.ts`（モード切替）、`builder-capability-help.spec.ts`、fork 連鎖系。 |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑥MiniKernel/C-USB上の位置づけ

```
World → FeatureNode(dev/builder) → Kernel(view/builder) → Component(ScreenDef) → SubComponent(content blocks)
```

| 要素 | 位置づけ |
|------|----------|
| **FeatureNode** | `dev` / `improve` 等。Builder は開発・改善ドメインの Kernel 経由で到達。 |
| **Kernel** | `view` 型。UUID ルーティングではなく `/dev/builder/*` explicit ルートが主。 |
| **Component** | ScreenDef JSON が C-USB 準拠の文明原子。ITO（IN→Transform→OUT）でレンダラへ OUT。 |
| **Builder 層** | v2.5 の **B（Builder）** レイヤー。L1–L4 は Governance のレイヤー 0–3 と対応するが、Builder モード名とは別体系（混同注意）。 |

**builderKind 分布（2026-05-01 生成）**: screendef 138 / hybrid 9 / native 81（合計 228）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑦IHL repoとの関係

| 項目 | 判定 |
|------|------|
| **スコープ** | **stays in civilization-os** |
| **理由** | IHL Phase 1 UI は Streamlit たたき台。Twin・Builder・経済は混在禁止（`00-AI-HANDOFF-BRIEF.md` §2）。 |
| **共有知見** | ScreenDef / fork / append-only の**思想**は参照可。実装は IHL 側で別コンポーネント契約（`指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/`）。 |
| **将来接続** | 観測テンプレ・スケール紙の export 形式が一致すれば、IHL manifest と civ-os fork v2 の橋渡し ADR を検討（現時点未決）。 |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑧正本ファイル

| 種別 | パス |
|------|------|
| Phase 正本 | `design/phases/Phase8_builder_universal.md` |
| 層定義 | `design/Builder_layers_L1-L4.md` |
| 能力境界 | `docs/builder-capability-boundary.md` |
| カバレッジ | `docs/builder-coverage-matrix.md`（自動生成） |
| ルート行列 | `docs/generated/route-matrix.{json,csv}` |
| 実装シェル | `frontend/src/builder/BuilderShell.tsx` |
| モード | `frontend/src/builder/lib/builderMode.ts` |
| fork API | `backend/src/api/routes/forkV2.ts`（または同等） |
| 採用 REQ | REQ-027（implemented）、REQ-012（superseded・Twin 分離） |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑨未決・ギャップ

| ギャップ | 内容 | 優先度 |
|----------|------|--------|
| **native 81 件** | ScreenDef 化または ADR 残置。Pilot-B13 エピックで段階消化。 | P2 |
| **L1 本番統合** | `nocodePaletteBlocks` と `COMPONENT_DEFS` の単一ソース化未完了。 | P2 |
| **一般ユーザー L1** | `/dev/builder` は dev 色が強い。REQ-024 IA 再設計と連動。 | P2 |
| **LabelMe/scale payload Zod** | fork v2 内検証強化は次イテレーション（Phase8 本文）。 | P3 |
| **観測スケール紙 L3 万能化** | `OBS-FV-05-SCALE-SHEET-UNIVERSAL-BUILDER` キュー残。 | P2 |

**採用 REQ 未昇格の oral**: fb_00042 / fb_00052 / fb_00070 / fb_00088（Builder 万能化関連・候補のみ）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑩設計AI参照順

1. `design/phases/Phase8_builder_universal.md`（完了定義・M1–M9）
2. `docs/builder-capability-boundary.md`（L1/L2 vs L3/L4 境界）
3. `design/Builder_layers_L1-L4.md`（モード表）
4. `docs/builder-coverage-matrix.md`（現状の native 母集団）
5. `frontend/src/builder/BuilderShell.tsx`（実装の入口）
6. `ui-reference/preferences.md` §A（認知科学・3 クリック）
7. `civilization/ProjectRules.md`（憲法トレーサ）
8. `docs/civilization-ui-ux-intent-map.md`（Builder / Driver 接続 — REQ-024）

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## ⑪ 2026.06,06 資料との関係（2026-06-07 調査）

> **調査対象**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/`（`要件定義1`・`詳細設計書`・`AI実装指示書`・`ファイル別実装指示`）  
> **結論**: 2026.06,06 資料群は **IHL 個体画像検索基盤**の設計であり、**civilization-os UIbuilder（ScreenDef IDE）の新方向は含まない**。

### 11.1 結論

| 論点 | 判定 |
|------|------|
| UIbuilder（ScreenDef IDE）の新仕様 | **なし** — 2026.06,06 に ScreenDef / L1–L4 / fork v2 / hybrid 等の記述は存在しない |
| 「builder」の意味 | **パイプライン component 名**（`thumbnail builder` / `embedding builder` / `manifest builder` 等）。civ-os の **B（Builder）レイヤー・ScreenDef IDE とは別概念** |
| Phase 1 UI | **Streamlit 検索 UI**（`apps/simple_search_ui`）。metadata 絞り込み + thumbnail 表示 + embedding 類似検索 |
| 正本の所在 | UIbuilder 正本は引き続き **Phase8**（`design/phases/Phase8_builder_universal.md`）および本ファイル §⑧。2026.06,06 は **IHL repo 向け参照のみ** |

**用語衝突の解消**: 2026.06,06 の「builder」= **データ処理 CLI component**（ingest → thumbnail → embedding → manifest の各 `run.py`）。civ-os §16 の「UIbuilder」= **ScreenDef 編集 IDE**（`/dev/builder`）。同一語彙・別ドメイン。

### 11.2 比較表（§16 UIbuilder vs 2026.06,06）

| 観点 | §16 UIbuilder（civilization-os） | 2026.06,06（IHL 画像 lake） |
|------|----------------------------------|-----------------------------|
| **対象システム** | civilization-os | IT Hercules Laboratory（別 repo） |
| **主目的** | 全ルート ScreenDef 化・L1–L4 編集・fork v2 | R2 上の個体画像 metadata + embedding 検索 |
| **「builder」の実体** | `BuilderShell.tsx` / ScreenDef JSON IDE | `components/*/run.py` パイプライン（thumbnail / embedding / manifest builder 等） |
| **UI 技術** | React + flexlayout-react（`/dev/builder/*`） | Streamlit（Phase 1 第一候補。`要件定義1` §385, §640–645） |
| **データ契約** | ScreenDef / C-USB / fork v2 entity_kind | Parquet manifest / snapshot / append-only R2 ファイル |
| **編集モデル** | Dev 固定・hybrid_slot・R2 INSERT ONLY fork | 更新なし・削除なし・snapshot 採用・latest pointer |
| **検索** | RAG 検索（Builder IDE 内タブ） | DuckDB/Polars whitelist + numpy cosine 類似検索 |
| **スコープ混在** | IHL Streamlit は §③ スコープ外と明記 | Twin / Builder / 経済 / 120 画面 API 混在禁止（`00-AI-HANDOFF-BRIEF.md` §1.2） |
| **Phase 正本** | Phase8_builder_universal | Phase 1 必須成果物 = ingest → manifest → Streamlit UI（`詳細設計書` 完了条件） |

### 11.3 2026.06,06 UI 関連（Streamlit — reference only）

2026.06,06 が定義する UI は **IHL Phase 1 検索たたき台**のみ。civ-os UIbuilder への取り込み対象ではない。

| 項目 | 2026.06,06 の記述 |
|------|---------------------|
| **配置** | `apps/simple_search_ui/app.py`（Streamlit） |
| **起動時読込** | latest `searchable_capture_set` / `embedding_locator` / `tag_aggregate`（R2 または cache） |
| **画面構成** | filter sidebar（species, sex, stage, view type, qc, year, horn length range 等）→ 結果 table + thumbnail grid → 詳細 pane / 類似検索 pane / タグ追加 pane |
| **通常検索** | DuckDB SQL whitelist 実行 |
| **類似検索** | query capture id → embedding locator → candidate filter → cosine + color/size rerank |
| **ログ** | usage logger（search / view / similar_search）、tag event logger |
| **Phase 2 以降** | FastAPI / DuckDB-Wasm / FAISS index builder は **Phase 1 非対象**（`詳細設計書`・`要件定義1` Part 6） |

**参照パス（IHL 設計たたき台）**:

- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/要件定義1` — Part 6 画面/API 設計、Streamlit 第一候補
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/詳細設計書` — `simple search ui` 詳細、OSS 一覧（UI=Streamlit）
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` — repo 構成 `/apps/simple_search_ui/`、Phase 1 完了条件
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/ファイル別実装指示` — component 一覧と Streamlit UI 実装指示

### 11.4 推奨（Phase8 正本維持・2026.06,06 から上書き不要）

1. **UIbuilder 正本は Phase8 を維持** — `design/phases/Phase8_builder_universal.md`・§⑧ 正本表・`BuilderShell.tsx` 実装を変更根拠とする。2026.06,06 から ScreenDef / L1–L4 / hybrid の上書き指示は **不要かつ該当なし**。
2. **用語を混同しない** — IHL 設計 AI・実装 AI 引き継ぎ時は「builder = pipeline component」と明記。本 §16 の「UIbuilder = ScreenDef IDE」と区別する（`00-AI-HANDOFF-BRIEF.md` §2 混在禁止と整合）。
3. **§⑦ 共有知見の範囲に留める** — append-only / snapshot / fork 思想の**参照**は可。UI 実装・ScreenDef スキーマの**移植は不可**。
4. **将来接続は ADR 待ち** — 観測テンプレ・スケール紙 export 形式が一致した場合のみ、civ-os fork v2 ↔ IHL manifest の橋渡し ADR を検討（§⑦ 将来接続。現時点未決）。
5. **設計ゲート** — IHL Streamlit は IHL repo の UI 設計書確定後に実装。 civ-os UIbuilder 実装禁止ゲート（`design-before-implementation-gate.mdc`）の対象外だが、**civ-os 側に Streamlit を追加しない**（§③ スコープ外の再確認）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 12. ユーザー設計思想（2026-06-07）— 配置・デザイン・機能の三層分離

> **出典**: ユーザー口頭（2026-06-07）。本節は **要件の再定義**であり、§④ の現行 FR を即座に置き換えるものではない。採用前に §14 設計ゲートを通す。

### 12.1 ユーザー意図（要約）

UIbuilder は **「万能 IDE」ではなく「UI 専用の組み立て工場」** であるべき、という設計思想。

| 層 | UIbuilder の責務 | やらないこと |
|----|------------------|--------------|
| **配置（layout / placement）** | ScreenDef ブロックの並べ替え・D&D・PageColumn / Stack 相当の構造 | 新規ルート・API の黙示的追加 |
| **デザイン（visual）** | トークン・見た目・プレビュー・L1 向けの視覚編集 | ドメイン固有ロジックの実装 |
| **機能（behavior）** | **既存** Component / Kernel / API コネクタの **選択・紐づけのみ**（USB-C 型カタログから差し込む） | 新機能の開発・fork プロトコル拡張・native 移行そのもの |

**機能開発**（新 Component・新 Kernel・新 API・Driver 接続・観測パイプライン等）は **repo / Docker / CI パイプライン** で行う — 2026.06,06 IHL の `components/*/run.py` 思想と同型。**UIbuilder 内でコードを書いて機能を増やさない**。

### 12.2 現行 §④ FR の過剰詰め込み評価

**判定: はい（over-pack）** — 現行 §④ は Phase8「万物フォーク・全ルート ScreenDef 化」の **実装・運用タスク** を UIbuilder の機能要件として束ねており、ユーザー理想の「配置＋デザイン＋紐づけ」とずれている。

| 現行 FR / 記述 | over-pack 例 | UIbuilder **IN** | UIbuilder **OUT**（紐づけのみ or 外部） |
|----------------|--------------|-------------------|----------------------------------------|
| **FR-16-05 fork v2** | R2 INSERT ONLY・entity_kind 拡張・409 衝突処理を Builder 機能として記載 | 既存 fork 済み ScreenDef / テンプレの **選択・適用**（L4 で公開ボタンを触るのは可） | fork v2 **プロトコル設計・API 実装・entity_kind 追加** → backend / R2 / ADR |
| **L4 META 編集** | §② L4「META 編集」を Builder 能力として列挙 | 紐づけ先メタの **表示・読取**（プレビュー用） | core / rag / security の **編集** → C-USB 開発・Governance |
| **FR-16-08 観測 Builder** | 固体テンプレ・スケール紙・QR ラベルを Builder Hub に **統合** | 観測 UI ブロックの **配置・デザイン**、登録済みテンプレの **選択** | テンプレ **スキーマ開発**・scale_sheet / scale_template **実装**・固体 commit API → 観測ドメイン + pipeline |
| **FR-16-06 hybrid / native 移行** | 全 228 ルート分類・Pilot-B13・native 81 件消化を Builder スコープに含む | hybrid 画面の **レイアウト JSON 編集**・`hybrid_slot` **スロットへの既存 Component 紐づけ** | native → ScreenDef 化の **Pilot 実装**・registry 変更・新 React スロット開発 → featureNode 開発 + CI |
| **FR-16-02 IDE シェル** | RAG 検索・AI アシスト・系譜・コード/R2 タブを同一 IDE に同居 | パレット・ツリー・プロパティ・**プレビュー**・D&D キャンバス | RAG 重み編集・AI 推論・fork レジストリ運用 → 各 FeatureNode |

**要約**: Phase8 の **達成目標**（万物フォーク・native ゼロ）は文明 OS 全体のロードマップとして残してよいが、**UIbuilder の機能要件として書くべきではない**。Builder はその結果を **編集・プレビュー・既存部品の組み立て** する面に限定する。

### 12.3 再定義スコープ（ユーザー理想）

#### UIbuilder **IN**（配置・デザイン）

- ScreenDef `content[]` ブロックの追加・並べ替え・削除（L1 D&D / L3 プロパティ）
- レイアウト primitives（section / list / PageColumn 相当）の配置
- 視覚トークン・`civUi.css` 準拠の見た目プレビュー（色は意味のみ）
- ライブプレビュー・Dev 固定（開発時の即反映）
- lint（Zod / Ajv）— **スキーマ整合のため**、新スキーマ invent はしない

#### UIbuilder **OUT / 紐づけ only**（機能）

- **機能** = カタログから **既存** Component / Kernel / `hybrid_slot` / API connector を **選んで差し込む**（C-USB / ITO 契約済み部品のみ）
- 例: 「このボタン → `POST /api/value-check/evaluate`」「このスロット → `economy_hub_core`」
- fork **利用**（親テンプレを選んで派生を開始）は可。**fork プロトコル・新 entity_kind** は Builder 外
- Driver / 外部接続: **manifest 選択・draft 表示**まで。本番接続は Governance（`builder-capability-boundary.md` §0 整合）

#### **機能開発**（UIbuilder 外）

| 作業 | 場所 | 参照 |
|------|------|------|
| 新 Component / Kernel | `frontend/src/` featureNode + `backend/src/` | C-USB・4 媒体同期 |
| 新 API・ルート | backend + `docs/REQUIREMENTS.md` | 憲法・REQUIREMENTS 更新必須 |
| データパイプライン | Docker + `components/*/run.py` + CI | IHL `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/` |
| 観測テンプレ・scale スキーマ | 観測ドメイン + R2 | REQ-027・Phase8 M4 |

### 12.4 既存 civ-os ドキュメントとの整合

| 正本 | 整合点 |
|------|--------|
| **`docs/2026.4.4/ui-component-separation.md`** | 三層（**機能** / **見た目** / **配置**）と **一致**。ユーザー思想は civ-os フロント規範の Builder 版: Builder = **配置 + 見た目** を編集し、**機能** は hook / api / 既存 Component への **配線（紐づけ）** に留める。 |
| **`docs/builder-capability-boundary.md` §0** | 「Builder は既存 ScreenDef・JSON・fork **草案**の編集が中心」「新規 API・本番 Driver 接続は不可」— **整合**。本節は §0 を **より狭く** UI 専用化する方向性。 |
| **`design/phases/Phase8_builder_universal.md`** | Phase8 の **完了定義**（native ゼロ・fork v2 統一）は **プロジェクト目標**として維持可。ただし M1–M9 の多くは **Builder 機能** ではなく **platform / backend / Pilot** タスク。UIbuilder 要件から **切り離す ADR** が必要（§12.5）。 |
| **`.cursor/rules/civilization-ui-implementation.mdc`** | 「fetch は hook / lib/api」「ページは配線のみ」— Builder も同型。**Builder 内に fetch / mutation を増やさない**。 |

### 12.5 Phase8 とのギャップ（ADR で狭める項目）

Phase8 正本は「万能 Builder」志向が強い。ユーザー思想に寄せるには **スコープ窄化 ADR**（案: `ADR-uibuilder-separation-scope`）で次を明文化する必要がある。

| Phase8 記述 | 現状 | 窄化後の扱い |
|-------------|------|--------------|
| 完了定義「native ゼロに近づける」 | Builder カバレッジ行列・Pilot-B13 と一体 | **Platform エピック**（Builder 外）。Builder は分類結果を **表示・フィルタ** のみ |
| M3 fork v2 統一 | Builder L4 から直接 POST | **Catalog + Apply** UI。API 本体は backend 正本のまま |
| M4 スケールテンプレ first-class | Universal Builder パネル内蔵 | テンプレ **選択 UI** のみ。スキーマ・R2 キーは観測 ADR |
| M6 L1–L4 モード | Fork・META・R2 を層別に出し分け | L4 も **紐づけ・公開トリガ** に限定。META **編集**は L4 から除外検討 |
| M9 カバレッジ行列 | `export-route-matrix` と Builder 連動 | **docs 自動生成**は維持。Builder IDE 内タブとして必須にしない |
| 「万物フォーク」 | fb_00042 等 oral | **fork 可能な catalog** の UX 目標に降格。プロトコル開発は Builder 外 |

**未決**: Phase8 を改訂するか、UIbuilder 専用の **Phase8-B（UI-only Builder）** を分岐するか — 人間判断待ち（§14）。

### 12.6 比較表 — 現行 §16 vs ユーザー理想 vs 2026.06,06 IHL component 思想

| 観点 | 現行 §16 doc（Phase8 整合） | ユーザー理想（本節） | 2026.06,06 IHL component 思想 |
|------|----------------------------|----------------------|--------------------------------|
| **Builder の役割** | ScreenDef IDE + fork + 観測 + ルート移行 + L1–L4 万能編集 | **UI 専用**: 配置 + デザイン + 既存機能の紐づけ | **パイプライン部品**: ingest / thumbnail / embedding / manifest 各 `run.py` |
| **機能開発** | Builder 内タブ・fork・Pilot で暗に包含 | **repo / Docker / CI** で開発。Builder は触らない | `components/` + Makefile + Docker。UI（Streamlit）は **別 app** |
| **差し替えモデル** | hybrid_slot + Dev 固定 + fork v2 | **固定契約**（C-USB / ScreenDef schema）の **カタログから選択** | **固定 manifest 契約**（input/output manifest, errors.jsonl）。部品は **swap 可能** |
| **「builder」語彙** | civ-os B レイヤー = UI 編集 IDE | 同上（UIbuilder に限定） | **データ処理 CLI component**（civ-os UIbuilder とは別語） |
| **preview** | Builder 内ライブプレビュー | **中心機能** | Streamlit = 検索結果 preview（pipeline 出力の表示） |
| **over-pack リスク** | **高**（§④ に platform タスク混在） | **低**（境界明確） | **低**（component 単位で責務分離済み） |

### 12.7 再定義 FR 草案（FR-16-REFRAME-*）

> **ステータス**: 草案・未昇格。§④ を置換する前に §14 ゲート通過と `accepted_requirements.csv` 昇格が必要。

| ID | 要件（窄化 UIbuilder） |
|----|------------------------|
| **FR-16-REFRAME-01** | UIbuilder は **配置**（ScreenDef ブロック構造・D&D・section/list 等）と **デザイン**（トークン・プレビュー・L1 視覚編集）のみを第一級機能とする。 |
| **FR-16-REFRAME-02** | **機能**は **既存 catalog**（Component / Kernel / hybrid_slot / 登録済み API connector）からの **選択・紐づけ** に限定する。catalog に無い能力は Builder 内で invent しない。 |
| **FR-16-REFRAME-03** | 新 Component・新 API・新ルート・Driver 本番接続・観測テンプレスキーマ開発は **UIbuilder スコープ外** とし、§③ スコープ外表に明示する。 |
| **FR-16-REFRAME-04** | L1–L4 モードは **UI 編集権限**（JSON 可視性・紐づけ先選択範囲）の出し分けに用い、fork プロトコル実装・META core 編集・R2 運用を L4 の **必須能力** としない。 |
| **FR-16-REFRAME-05** | ライブプレビューと Dev 固定は **配置・デザイン変更**の即時確認に限定して提供する。 |
| **FR-16-REFRAME-06** | lint（Zod / Ajv）は **既存 ScreenDef schema** への適合検証のみ。schema 拡張は Builder 外（レンダラ + schema 正本 PR）。 |
| **FR-16-REFRAME-07** | 観測・市場・ValueCheck 等ドメイン UI は、Builder では **登録済みブロック／スロットへの紐づけ** のみ。テンプレ・scale・固体 commit **ロジック**は各 FeatureNode / pipeline。 |
| **FR-16-REFRAME-08** | Phase8 の route 分類・カバレッジ・Pilot-B13 は **platform ドキュメント／CI** として維持し、UIbuilder FR から **切り離す**（表示用 read-only リンクは可）。 |
| **FR-16-REFRAME-09** | `/help/builder-capability` は **「UI でできること / 開発パイプラインでやること」** の二層境界を、本節 12.3 に沿って改稿する。 |
| **FR-16-REFRAME-10** | IHL component 思想（固定 manifest・swap 可能部品・UI と pipeline 分離）を **参照モデル** と明記し、civ-os では C-USB catalog + ScreenDef が同等契約であることを §⑦ に追記する。 |

### 12.8 ThemePack / デザイントークン（ADR-H-17 · 2026-06-09）

> **ステータス**: 草案 v1 · 人間レビュー待ち — [ADR-H-17](../02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md)

UIbuilder **デザイン層**の正本。`ThemePack` エンティティ · `--civ-*` トークン · 5 UI primitive（Button/Input/Card/Tab/Badge）· 世界既定 + fork · 全画面 CSS 変数適用。

| ID | 要件（要約） |
|----|--------------|
| FR-DTH-01〜10 | ADR-H-17 §9 参照（ThemePack · design_token.yaml · primitive catalog · Phase 1/2） |

| 境界 | 内容 |
|------|------|
| **IN** | プリセット選択 · トークン値編集（Phase 2）· primitive プレビュー · world_default 適用 |
| **OUT** | OBS-TPL（ADR-H-13）· ScreenDef 配置 · catalog 機能 invent · 写真色補正 |

正本: [`02-設計/_横断/schema/dictionaries/design_token.yaml`](../02-設計/_横断/schema/schemas/dictionaries/design_token.yaml) · [`ui_primitive_catalog.yaml`](../02-設計/_横断/schema/schemas/dictionaries/ui_primitive_catalog.yaml) · UI [`../02-設計/features/16-UIbuilder/ui/テーマ.md`](../02-設計/features/16-UIbuilder/ui/テーマ.md)

**§④ との関係**: FR-16-01〜08 は **現行実装の記述**として残置可。採用判断時は REFRAME へ **マージまたは supersede** する。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 14. 設計ゲート（要件改訂 — 未着手）

`design-before-implementation-gate.mdc` に従い、**§12 ユーザー設計思想に基づく UIbuilder スコープ窄化**は **要件改訂**であり、**本節通過前の実装コード変更（Phase8 方向への追加開発）は禁止**とする。

| # | 成果物 | UIbuilder 窄化で最低限含む内容 | ステータス |
|---|--------|----------------------------------|------------|
| 1 | **要件定義** | FR-16-REFRAME 正本（H-01=B）— [ADR-H-01](../02-設計/_横断/adr/ADR-H-01-uibuilder-reframe-adopted.md) | **☑ 人間解決（要件層）** |
| 2 | **詳細設計** | **UI-only Builder** の catalog 契約；ThemePack（ADR-H-17 §2.3）；ScreenDef 紐づけ；L1–L4 権限表 | **草案 v1**（人間確定待ち） |
| 3 | **遷移設計** | 編集 SM · catalog pick · **テーマ編集 SM**（§1.4）；機能開発は repo 外導線 | **草案 v1**（人間確定待ち） |
| 4 | **UI 設計** | 配置 IDE ワイヤー · **テーマタブ**（ADR-H-17）；RAG/fork/Pilot 去留；`preferences.md` §A | **草案 v1**（人間確定待ち） |

**Phase8 分離**: H-01=B — Phase8 platform は [ADR-H-01](../02-設計/_横断/adr/ADR-H-01-uibuilder-reframe-adopted.md) に従い UIbuilder FR から分離。`accepted_requirements.csv` 昇格は実装フェーズ。

**エージェント向けチェック**: 上表 4 点 + Phase8/ADR 判断が **確定 or 明示 Go** になるまで、UIbuilder への **新機能追加実装**（fork 拡張・観測 Universal Builder 統合・Pilot 新規等）は **禁止**。**既存 Phase8 バグ修正・REQ-027 維持**は除外。

**更新（2026-06-07）**: **H-01 人間確定（B）** — 要件層 Go。詳細/遷移/UI の設計ゲート 4 点は未確定。

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
