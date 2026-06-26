# ADR-Phase2-C-USB-component-契約 — IHL component の入出力契約（C-USB）

> **ステータス**: 草案（人間レビュー待ち · 実装 Go 不可）
> **決定日（草案）**: 2026-06-08
> **判断 ID**: Phase 2 — C-USB component 契約
> **対象 repo**: `it-hercules-laboratory`（設計たたき台は本フォルダ）
> **正本（前提 ADR）**: [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) · [`ADR-H-05-ガバナンス-v1.3.md`](./ADR-H-05-ガバナンス-v1.3.md) · [`ADR-H-06-IHL経済-独立schema.md`](./ADR-H-06-IHL経済-独立schema.md) · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) · [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md)
> **構造前提**: [`00-土台-MiniKernel-C-USB-コンポーネント.md`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §3・§8 · `civilization/C-USB.md` · `civilization/ComponentFramework.md` · `civilization/CoreEntityBase.md`
> **実装禁止ゲート**: `.cursor/rules/design-before-implementation-gate.mdc` — 本 ADR は設計ドキュメントであり、コード実装は 4 点（要件・詳細・遷移・UI）人間確定後

---

## 文脈

IHL は **OSS を機能ごとに薄くラップ → C-USB component → unit test + contract test → component 別 CI → 開発者の自己 QA** という開発サイクルを取る（ユーザー意図）。本 ADR は、その中核である **「IHL における C-USB component の入出力契約」** を確定する。

ここで言う C-USB は、civ-os の **C-Sync（4 媒体同期）** とは **別物**である。本 ADR で扱うのは [`00-土台`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §8 の「2026.06,06 component USB-C 契約」、すなわち **ファイル契約（schema / manifest / ID / R2 キー）として固定される入出力規格**である。

| 用語 | 本 ADR での意味 |
|------|----------------|
| **C-USB（本 ADR）** | IHL component の **ファイル入出力契約**（IN → Transform → OUT を manifest + schema で固定）。比喩は「USB-C 機器」 |
| ~~C-Sync~~ | civ-os legacy の spec/post/commit/R2 4 媒体同期。**IHL では不採用**（HANDOFF §2.1-3） |
| **C-USB（civ-os 憲法）** | `civilization/C-USB.md` の文明原子接続 IF（core+rag+io+compatibility）。IHL は **思想を共有**するが型をそのまま実装しない（[`00-土台`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §8.3） |

---

## 1. 決定 — C-USB component の定義

**1 component = 1 処理部品 = 1 `run.py`（または `run.ts`）= 1 Docker target = 1 manifest 契約。**

各 component は次を満たす:

1. **IN → Transform → OUT**（ITO）の Transform 段に位置する（Input/Output 専用 component も可）。
2. 入力は **input manifest**（参照のみ。生 OSS API を UI/他 component から直接叩かない）。
3. 出力は **output manifest + run_info + errors** の 3 点を **必ず** 出す。
4. すべての出力に **provenance**（`run_id` / `schema_version` / `input_hash` / `model_name` / `model_version`）を付与する。
5. R2 は **append-only**（同一キー再 put は fail）。修正は新 record / 新 snapshot / 新 pointer。
6. OSS は `libs/` の薄いアダプタ経由で呼ぶ。**ドメインロジックを `apps/`（UI）に置かない**。

---

## 2. IN → Transform → OUT（IHL 版 ITO）

```text
            ┌─────────────────────────────────────────┐
  IN        │  Transform（components/<name>/run.py）   │   OUT
 ─────────► │   1. input manifest を読む（契約検証）    │ ─────────►
 input      │   2. R2 から artifact 取得（libs/r2_io）  │  output manifest
 manifest   │   3. OSS 薄ラップで処理（libs/<oss>）      │  + run_info.json
 (+ R2 key) │   4. provenance 付与・schema 検証          │  + errors.jsonl
            │   5. R2 へ append-only put（no-overwrite）│  (+ derived artifact)
            └─────────────────────────────────────────┘
```

| 段 | IHL の実体 | 契約 |
|----|------------|------|
| **IN** | input manifest（Parquet/YAML 参照）+ R2 キー prefix | `in_schema_ref` で固定。許可列・dtype・enum を schema_validator が検証 |
| **Transform** | `run.py` 内の純処理。OSS は `libs/` アダプタ経由 | 副作用は R2 への **append のみ**。tmp はローカル（永続化禁止） |
| **OUT** | output manifest + run_info + errors（+ derived artifact） | `out_schema_ref` で固定。provenance 必須 |

ITO の対応は [`00-土台`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §8.1 の概念対応表に従う（`input manifest.parquet` = io.inputs + Input 段、等）。

---

## 3. `manifest.yaml`（component 宣言）フィールド

各 component フォルダに置く **`manifest.yaml`** は、その component の C-USB 契約を宣言する。`02-設計/_横断/schema/`（canonical）への **参照**を持ち、schema 本体は重複させない（§6）。

```yaml
# components/<name>/manifest.yaml — C-USB component 宣言（草案フィールド）
name: embedding_builder_dinov2        # component 一意名（catalog/components.yaml の id と一致）
version: 0.1.0                         # component 実装バージョン（SemVer）
kind: transform                       # transform | input | output（ITO role）
description: 画像から DINOv2 embedding を生成し locator を出力        # rag.description 相当

# --- C-USB 入出力契約（02-設計/_横断/schema/ への参照のみ。本体は重複させない） ---
in_schema_ref:  02-設計/_横断/schema/manifest/input_manifest.schema.yaml          # IN の契約
out_schema_ref: 02-設計/_横断/schema/manifest/embedding_manifest.schema.yaml      # OUT の契約
out_artifacts:                        # 生成する artifact（artifact_type は dictionaries 準拠）
  - { type: embedding,  format: npy,     r2_prefix: derived/embeddings/ }
  - { type: manifest,   format: parquet, r2_prefix: manifests/ }

# --- 共通出力（全 component 必須・§4） ---
emits_run_info: true                  # run_info.json を必ず出す
emits_errors:   true                  # errors.jsonl を必ず出す

# --- errors 契約（error_type は schema / dictionaries で固定） ---
errors:
  schema_ref: 02-設計/_横断/schema/manifest/errors.schema.yaml
  error_types: [io_error, schema_violation, decode_error, model_error, unknown]

# --- value_origin 宣言（観測の真実性・F8） ---
value_origin:                         # この component が出す値の由来（dictionaries/value_origin.yaml）
  default: image_derived              # 例: embedding は画像由来
  forbidden_mix: true                 # 直接観測値と画像由来値を同列に混ぜない

# --- OSS 薄ラップ（swap 可能性の宣言） ---
oss:
  primary:  { name: dinov2, via: libs/embedding.py }   # 第一候補（ADR-Phase1 OSS 選定表）
  fallback: [openclip, dummy]                           # CI は dummy backend
  pinned_contract: [embedding_dim, normalized_flag, dtype_float32]   # OSS 差替でも固定する契約

# --- provenance（全出力レコードに付与・§5） ---
provenance_fields: [run_id, schema_version, input_hash, model_name, model_version]

# --- Phase 境界 ---
phase: 1                              # 1=Streamlit 期 / 2=web shell（ADR-Phase1 §3）
status: draft                         # draft | review | accepted（実装ゲートと連動）
```

**フィールド最小集合（必須）**: `name` · `version` · `kind` · `in_schema_ref` · `out_schema_ref` · `errors` · `value_origin` · `provenance_fields`。
**任意**: `out_artifacts` · `oss` · `phase` · `description`。

> `name` / `version` は CivilizationOS C-USB の `compatibility.version` 思想に対応。`value_origin` / `provenance_fields` は IHL 固有（F8・再解析可能性）。

---

## 4. 共通出力（全 component 必須） — run_info / errors

2026.06,06 AI 実装指示書の固定契約を IHL の C-USB 共通出力として確定する。

### 4.1 `run_info.json`（1 run = 1 ファイル · 監査 Truth）

```text
run_id, component_name, component_version, pipeline_name, pipeline_version,
input_manifest, output_path, output_manifest, errors_path,
created_at, finished_at, status,
git_commit, docker_image, parameters,
input_count, output_count, error_count, warning_count, schema_version
```

### 4.2 `errors.jsonl`（record 単位 append-only）

```text
error_id, capture_id, individual_id, input_path, error_type, severity,
message, detail, run_id, created_at, schema_version
```

- 例外は **record 単位**で捕捉し、処理は継続（1 行失敗で pipeline 全停止にしない）。
- ログは標準出力 + `errors.jsonl`。

### 4.3 `output manifest`（成果物宣言）

```text
record_id, capture_id, individual_id, artifact_type, artifact_path, artifact_format,
pipeline_name, pipeline_version, model_name, model_version,
input_hash, schema_version, run_id, created_at
```

---

## 5. CoreEntityBase サブセット（IHL 版）

IHL は civ-os の `CoreEntityBase`（core + rag）を **そのまま**は使わない（[`00-土台`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §5.5・§8.3）。代わりに **思想を写像した最小サブセット**を全レコードに要求する。

| CoreEntityBase（civ-os） | IHL サブセット（必須） | 用途 |
|--------------------------|------------------------|------|
| core.lineage_hash / generation | `run_id`, `snapshot_id`, `input_hash` | 系譜・再現性 |
| core.content_hash | `input_hash`（raw は SHA256 bytes） | 内容同定 |
| core.created_at | `created_at`（ISO8601） | 追記時刻 |
| rag.title / description / tags | `local_label_text`, tag_event（append-only） | 検索メタ（固定列の現在値にしない・F7） |
| rag.embedding | embedding_manifest（別 artifact） | 類似検索 |
| — （IHL 固有） | `schema_version`, `value_origin`, `source_type` | バージョン・由来区別（F8・ADR-H-05） |

**rag を必要とする箇所**: 検索対象（capture / individual / searchable_capture_set）と tag/usage イベント。**rag 不要な箇所**: 純内部 derived artifact（embeddings.npy 等）。embedding は manifest 側に検索メタを持たせ、バイナリ本体は core 系 provenance のみ。

**経済系レコード**は本サブセットではなく [`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md) の event/snapshot 列を正とする（`*_event_id`, `actor_id`, `created_at` 等）。

---

## 6. `02-設計/_横断/schema/`（canonical）と `components/*/manifest.yaml` の関係

```text
02-設計/_横断/schema/                                  ← 契約の唯一の正本（canonical）
├── manifest/input_manifest.schema.yaml
├── events/preference_event.schema.yaml
└── ...
        ▲ 参照（in_schema_ref / out_schema_ref）
        │
components/<name>/manifest.yaml            ← component 宣言（schema を「指す」だけ）
```

| 観点 | `02-設計/_横断/schema/`（canonical） | `components/*/manifest.yaml` |
|------|------------------------|------------------------------|
| 役割 | 列・dtype・enum・required の **正本** | component が **どの schema を使うか**の宣言 |
| 重複 | 列定義はここだけ | schema 本体を **複製しない**（参照のみ） |
| 変更 | schema PR（§7 手順 2）+ versioning（[`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md)） | component 実装 PR |
| 検証 | CI が ajv/zod/jsonschema で実体データを検証 | CI が manifest 参照の整合（ref 切れ検知）を検証 |

**原則**: schema を直す = `02-設計/_横断/schema/` の PR。component を直す = `components/<name>/` の PR。両者を 1 PR に混ぜない（CI の path-filter が分離 — [`CI設計書-v1.md`](./CI設計書-v1.md)）。

---

## 7. component 追加手順（4 点セット）

[`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) §3 の標準ワークフローを C-USB 契約の観点で再掲する。

```text
1. フォルダ:   components/<name>/  （manifest.yaml + run.py + tests/ + Dockerfile + README.md）
               → 標準構成は componentテンプレ-標準構成.md
2. schema PR:  02-設計/_横断/schema/ に in/out schema を追加・参照（canonical · §6）
3. ADR:        docs/adr/NNN-<name>.md（なぜ追加・OSS 選定・代替・Phase 境界）
4. catalog 行: catalog/components.yaml に 1 行追記（id/kind/in/out/r2_prefix/status）
               → これで UIbuilder（REFRAME・ADR-H-01）が「選択・紐づけ」可能になる
```

詳細・テンプレは [`componentテンプレ-標準構成.md`](./componentテンプレ-標準構成.md)。

---

## 8. C-USB が保証するもの — contract / unit / pipeline の役割分担

| テスト種別 | 何を検証 | C-USB の保証範囲 | 正本 |
|------------|----------|------------------|------|
| **unit test** | run.py 内部ロジック（join・cosine・hash 等）が正しい | component **内部**の正しさ | [`テスト設計書-v1.md`](./テスト設計書-v1.md) |
| **contract test** | OUT が `out_schema_ref` に適合・required 列・enum・provenance 揃う | **C-USB 契約そのもの**（IN/OUT の形） | 本 ADR §3–5 |
| **pipeline integration** | 上流の OUT が下流の IN に **そのまま入る**（OUT⊇次 IN） | component **間の接続性**（swap 可能性） | [`CI設計書-v1.md`](./CI設計書-v1.md) §downstream |

**C-USB が保証すること**:
- OUT は宣言した schema に必ず適合する（contract test green ⇒ 下流が信頼してよい）。
- provenance が全レコードに揃う（再解析可能性）。
- 同一キー再 put が起きない（append-only・immutability test）。
- OSS を差し替えても `pinned_contract`（次元・dtype・正規化等）は不変。

**C-USB が保証しないこと**: 値の科学的正しさ（それは観測者責任）・性能（Phase 1 は低レイテンシ非要求 FOUND-N06）・UI 体験。

---

## 9. アンチパターン（即 reject）

| アンチパターン | なぜ禁止 | 正しい形 |
|----------------|----------|----------|
| **`apps/`（Streamlit/UI）にドメインロジック** | レイヤー混在・テスト不能・swap 不能 | ロジックは `components/*/run.py` + `libs/`。UI は表示のみ |
| **UI / component から OSS を直接呼ぶ** | OSS API が全体に漏れ、差替不能 | `libs/<oss>.py` の薄アダプタ経由（`pinned_contract` 固定） |
| **schema をコンポーネント側に重複定義** | canonical が二重化し破綻 | `02-設計/_横断/schema/` を参照（`in/out_schema_ref`・§6） |
| **R2 既存キーへ上書き / delete** | append-only 違反・再解析不能 | 新 record / 新 snapshot / 新 pointer（immutability test） |
| **provenance なしの出力** | 再解析・監査不能 | `run_id`/`schema_version`/`input_hash`/`model_*` 必須 |
| **直接観測値と画像由来値を同列混在** | 観測の真実性が壊れる（F8） | `value_origin` で区別。色補正もしない（preferences §C） |
| **run_info / errors を出さない** | 監査・部分失敗追跡不能 | 3 点出力（manifest + run_info + errors）必須 |
| **常駐 DB を真実源泉に** | DB 禁止（F2）・R2 が SSOT | DuckDB/Polars は Parquet を読むだけ |

---

## 影響

- [`componentテンプレ-標準構成.md`](./componentテンプレ-標準構成.md) は本 ADR の manifest/共通出力契約を実体化する。
- [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) は §6 の canonical schema 配置・versioning を定義する。
- [`CI設計書-v1.md`](./CI設計書-v1.md) / [`テスト設計書-v1.md`](./テスト設計書-v1.md) は §8 の保証範囲を CI ジョブ・テストピラミッドに落とす。
- 実装は設計ゲート 4 点の人間確定後（`design-before-implementation-gate.mdc`）。**本 ADR 単独では実装 Go 不可**。

## 参照

- [`00-土台-MiniKernel-C-USB-コンポーネント.md`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §3 C-USB · §5 CoreEntityBase · §8 2026.06,06 対応
- [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) — OSS 薄ラップ方針
- [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) §3 component 追加手順
- [`../../00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §2.1 単一正本 · §4 設計思想固定前提
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` — run.py / run_info / errors / output manifest 契約

---

*草案・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止ゲート有効 — 実装 Go 不可*
