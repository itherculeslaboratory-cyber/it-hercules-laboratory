# ADR-Phase1-IHL-repoフォルダ構成 — it-hercules-laboratory リポジトリ構造

> **ステータス**: 草案（人間レビュー待ち）
> **決定日（草案）**: 2026-06-07
> **判断 ID**: Phase 1 — repo 構成
> **対象 repo**: `it-hercules-laboratory`（`https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git`）
> **正本**: 本 ADR · [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §6 · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md)
> **前提**: F1 単一正本 IHL · F2 legacy salvage · F4 R2 append-only · F7 OSS 薄くラップ · F10 画面単位設計禁止（Kernel UUID）

---

## 文脈

IHL は **唯一の正本システム**（OSS 公開予定）。civ-os は archive。本 ADR は新 repo のフォルダ構成を確定し、**component 追加手順**（フォルダ + manifest + ADR + catalog 行）を 2026.06,06 の `run.py` モデルおよび [ADR-H-01](./ADR-H-01-uibuilder-reframe-adopted.md) REFRAME（**Builder = catalog 紐づけのみ**）と整合させる。

---

## 1. 決定 — トップレベル構成

```text
it-hercules-laboratory/
├── apps/                      # 実行可能アプリ（UI / API のエントリ）
│   └── search_ui/             # Phase 1 = Streamlit（app.py）
│       └── app.py
├── components/                # 文明原子相当の処理部品（1 component = 1 run.py）
│   ├── ingest_normalize/
│   ├── thumbnail_builder/
│   ├── embedding_builder/
│   ├── manifest_builder/
│   ├── tag_aggregator/
│   └── preference_aggregator/ # 10 マチアプ preference_event 集計（ADR-H-02）
├── libs/                      # OSS 薄ラップ・共通契約（fetch/IO の集約点）
│   ├── r2_io.py               # boto3 ラップ（put/get/list/exists・no-overwrite）
│   ├── query.py               # DuckDB whitelist
│   ├── embedding.py           # dummy/dinov2/openclip 共通 IF
│   ├── schema_validator.py    # Pydantic + jsonschema
│   ├── scoring.py             # cosine + color/size rerank（H-05 待ち）
│   └── catalog.py             # component / screen catalog 読取（REFRAME 紐づけ用）
├── 02-設計/_横断/schema/                   # YAML schema 正本（capture / searchable_capture_set / preference_event 等）
├── dictionaries/              # enum 正本（value_origin / sex / stage / tag_type 等）
├── configs/                   # 環境別 config（dev / ci）。秘密はコミットしない
├── catalog/                   # ★ REFRAME 用カタログ（component / kernel / connector / screen_def 登録簿）
│   ├── components.yaml        # 利用可能 component 一覧（UIbuilder が読む）
│   ├── connectors.yaml        # 登録済み API connector
│   └── screen_defs/           # ScreenDef JSON（配置・デザイン正本）
├── docs/
│   ├── adr/                   # ADR 正本（001-governance.md 〜）
│   ├── requirements/          # 要件 v1.0
│   ├── design/                # architecture / r2-layout / components/*.md
│   ├── ui/                    # UI 設計（streamlit-v1 / web-shell）
│   ├── test/                  # テスト戦略
│   └── migration/             # from-civilization-os-legacy.md（salvage 一覧）
├── tests/                     # unit / component / integration / immutability
├── scripts/                   # r2_probe.py / bootstrap_r2_layout / create_bucket（CF API）
├── docker/                    # component 別 Dockerfile
├── .github/workflows/         # GHA（lint / test / dummy embedding）
├── pyproject.toml             # uv 管理
├── uv.lock
├── Makefile                   # pipeline 直列起動
├── LICENSE                    # Apache-2.0 推奨（H-07 待ち）
└── README.md
```

**civ-os たたき台（HANDOFF §6）からの差分**: `catalog/` を新設（REFRAME の「既存部品の選択・紐づけ」を実体化）・`components/preference_aggregator/` を追加（ADR-H-02）・`docs/` 配下を細分化。

---

## 2. ディレクトリ責務

| ディレクトリ | 責務 | 入れない |
|--------------|------|----------|
| `apps/` | UI / API のエントリのみ。ロジックは `libs/` 呼び出し | データ処理ロジック・直接の OSS 呼び出し |
| `components/` | 1 処理部品 = 1 `run.py`。input manifest → output manifest + run_info + errors | UI・他 component への直接依存 |
| `libs/` | OSS 薄ラップ・共通契約。**fetch/IO の集約点** | ドメイン分岐の肥大化（部品横断ロジックのみ） |
| `02-設計/_横断/schema/` | YAML schema **正本** | コード生成物（生成は CI / アダプタ） |
| `catalog/` | UIbuilder（REFRAME）が **選択・紐づけ**する登録簿 | 新規 component の実装本体（それは `components/`） |
| `docs/adr/` | 決定記録の正本 | たたき台（たたき台は civ-os `指示/` 側） |
| `scripts/` | 運用・bootstrap・probe | 本番 pipeline（それは `components/` + Makefile） |

---

## 3. component 追加手順（標準ワークフロー）

新しい処理部品を足すときは、**4 点セット**を必ず揃える（REFRAME と整合 — Builder では機能を作らず、ここで作る）。

```text
1. フォルダ:   components/<name>/run.py + __init__.py + (任意) README.md
2. manifest:   その component の入出力契約を 02-設計/_横断/schema/ に追加
               - input_manifest_<name>.yaml / output_manifest_<name>.yaml
               - 共通: run_info（run_id/model/input_hash）+ errors.jsonl
3. ADR:        docs/adr/NNN-<name>.md（なぜ追加・OSS 選定・代替・Phase 境界）
4. catalog 行: catalog/components.yaml に 1 行追記
               - id / kind / input_schema / output_schema / r2_prefix / status
               → これで UIbuilder（REFRAME）が「選択・紐づけ」可能になる
```

**Makefile への登録**: pipeline の直列順に `make <name>` ターゲットを追加。CI は dummy backend で実行。

**REFRAME との接続（ADR-H-01）**: UIbuilder は `catalog/components.yaml` / `catalog/connectors.yaml` を **読み取り専用**で参照し、ScreenDef ブロックへ **紐づける**だけ。**新 component の invent は Builder 外**（= 本手順 1〜4 を repo / Docker / CI で行う）。

---

## 4. 2026.06,06 `run.py` モデルとの整合

| 2026.06,06 思想 | IHL repo での実体 |
|-----------------|-------------------|
| 1 component = ingest/thumbnail/embedding/manifest 各 `run.py` | `components/<name>/run.py` |
| 固定 manifest 契約（input/output manifest, errors.jsonl） | `02-設計/_横断/schema/*_manifest_*.yaml` + 共通 run_info/errors |
| 部品は swap 可能 | `libs/` の共通 IF（embedding backend 差し替え等） |
| UI（Streamlit）は別 app | `apps/search_ui/` |
| Makefile が pipeline 起動 | ルート `Makefile` |

---

## 5. R2 キー階層との対応（ADR-H-03）

```text
raw/                            ← ingest_normalize の input
normalized/                     ← ingest_normalize の output
derived/                        ← thumbnail / embedding / feature
manifests/latest/               ← manifest_builder（latest 方式は H-04 待ち）
events/preference_event.jsonl   ← 10 マチアプ（ADR-H-02）
events/tag_event.jsonl          ← 観測タグ
```

各 component の `r2_prefix` は `catalog/components.yaml` に明記し、キー階層と 1:1 対応させる。

---

## 6. ブランチ / 公開運用（GitHub・F3）

- 改善履歴 = **GitHub**（PR / Discussions / `docs/BOARD.md`）。C-Sync 4 媒体は不採用。
- ランタイムデータ（観測 JSON / preference_event 等）は **R2 append-only**（GitHub に置かない・F4）。
- 公開範囲・ライセンスは H-07 / H-08（人間確定待ち）。

---

## 7. 未決

| ID | 論点 | 状態 |
|----|------|------|
| H-04 / D-01 | latest manifest 更新方式（実体コピー vs pointer） | **未決** — `manifests/latest/` 構造に影響 |
| H-06 / D-07 | 個体 ID 既存データ移行（civ-os lineage → capture_id） | **未決** — `docs/migration/` |
| H-07 / D-06 | ライセンス（Apache-2.0 推奨） | **未決** |
| Pkg | uv 採用（OSS 選定表 §1） | 草案 |

---

## 影響

- [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) の `libs/` 薄ラップ方針と一体。
- [`16-UIbuilder-詳細設計-v1.md`](./16-UIbuilder-詳細設計-v1.md) の catalog 契約は本 ADR の `catalog/` を参照先とする。
- 実装は設計ゲート 4 点の人間確定後（`design-before-implementation-gate.mdc`）。

## 参照

- [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §6 構成たたき台 · §12 salvage
- [`02-設計/_横断/理想設計-構成マップ.md`](../02-設計/_横断/理想設計-構成マップ.md)
- [`ADR-H-01-uibuilder-reframe-adopted.md`](./ADR-H-01-uibuilder-reframe-adopted.md)
- [`ADR-H-03-r2-bucket-dedicated.md`](./ADR-H-03-r2-bucket-dedicated.md)

---

*草案・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止ゲート有効*
