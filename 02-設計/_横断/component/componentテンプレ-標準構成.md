# component テンプレ — 標準構成（`components/<name>/`）

> **ステータス**: 草案（人間レビュー待ち · 実装 Go 不可）
> **作成日（草案）**: 2026-06-08
> **正本（前提）**: [`ADR-Phase2-C-USB-component-契約.md`](./ADR-Phase2-C-USB-component-契約.md) · [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) §3 · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md)
> **テスト/CI 連動**: [`テスト設計書-v1.md`](./テスト設計書-v1.md) · [`CI設計書-v1.md`](./CI設計書-v1.md) · [`../02-設計/_横断/schema/02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md)
> **run.py モデル正本**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書`（共通: 全 component に `run.py`、CLI 引数 `--input-manifest --output-dir --run-id --config`、出力は output manifest + run_info.json + errors.jsonl）
> **実装禁止ゲート**: `.cursor/rules/design-before-implementation-gate.mdc` — 本書はテンプレ定義であり、実体コードは設計ゲート 4 点の人間確定後

---

## 0. このテンプレの目的

ユーザー開発サイクル **「OSS 薄ラップ → C-USB component → unit/contract test → component 別 CI → 自己 QA」** を、**全 component で同一フォルダ構成**にすることで自動化する。CI（path-filter）・テスト・catalog 登録がすべて同型になる。

---

## 1. フォルダテンプレート

```text
components/<name>/
├── manifest.yaml            # C-USB 契約宣言（ADR-Phase2 §3）— 必須
├── run.py                   # CLI エントリ（または run.ts）— 必須
├── __init__.py
├── Dockerfile              # 1 component = 1 Docker target（共通 base 可）
├── README.md               # 使い方・入出力・OSS・Phase 境界
├── requirements.txt        # （任意。uv の場合はルート pyproject.toml で集約）
├── tests/
│   ├── unit/               # 内部ロジック（join・cosine・hash）
│   │   └── test_<name>_logic.py
│   └── contract/           # OUT が out_schema_ref に適合・provenance・no-overwrite
│       └── test_<name>_contract.py
└── fixtures/
    ├── input/              # 小さな input manifest + ダミー artifact
    │   └── input_manifest.parquet
    └── golden/             # golden output（期待 OUT のスナップショット）
        └── output_manifest.expected.json
```

> **`run.ts` 採用時**（一部 component を TS にする場合）: `run.py` を `run.ts` に、`tests/` を vitest 構成に、`requirements.txt` を `package.json` に読み替える。manifest.yaml / fixtures / contract の思想は不変。Phase 1 の主言語は Python（OSS 選定表）。

---

## 2. ファイル別の責務

| ファイル | 責務 | 入れない |
|----------|------|----------|
| `manifest.yaml` | C-USB 契約（name/version/kind/in_out schema_ref/errors/value_origin/provenance）。schema は参照のみ | schema 本体の複製 |
| `run.py` | CLI。input manifest 読込 → `libs/` 経由処理 → output manifest + run_info + errors 出力 | OSS の直接呼び出し（必ず `libs/`）・R2 への上書き |
| `Dockerfile` | 実行環境固定（共通 base + component 依存） | 秘密鍵の埋込 |
| `README.md` | IN/OUT 例・OSS 第一候補/代替・Phase 境界・`make <name>` | — |
| `tests/unit/` | 純ロジック（決定的・R2 不要・fs モック可） | 実 R2 アクセス |
| `tests/contract/` | OUT の schema 適合・required 列・enum・provenance・no-overwrite | 値の科学的妥当性 |
| `fixtures/` | 最小入力 + golden 期待出力 | 大容量・本番データ |

---

## 3. `manifest.yaml`（コメント付きサンプル）

```yaml
# components/embedding_builder_dinov2/manifest.yaml
# C-USB component 宣言。02-設計/_横断/schema/（canonical）を参照するだけで、列定義は複製しない。

name: embedding_builder_dinov2        # catalog/components.yaml の id と一致させる
version: 0.1.0                        # 実装の SemVer（schema_version とは別）
kind: transform                      # ITO role: transform | input | output
description: 画像から DINOv2 embedding を生成し embedding_manifest と locator を出力する

# --- C-USB 入出力契約（参照のみ・ADR-Phase2 §6） ---
in_schema_ref:  02-設計/_横断/schema/manifest/input_manifest.schema.yaml
out_schema_ref: 02-設計/_横断/schema/manifest/embedding_manifest.schema.yaml
out_artifacts:
  - { type: embedding, format: npy,     r2_prefix: derived/embeddings/ }   # embeddings.npy
  - { type: manifest,  format: parquet, r2_prefix: manifests/ }            # locator/manifest

# --- 共通出力（全 component 必須） ---
emits_run_info: true                 # run_info.json
emits_errors:   true                 # errors.jsonl（record 単位 append）

# --- errors 契約 ---
errors:
  schema_ref: 02-設計/_横断/schema/manifest/errors.schema.yaml
  error_types: [io_error, decode_error, model_error, schema_violation, unknown]

# --- value_origin（観測の真実性・F8） ---
value_origin:
  default: image_derived             # embedding は画像由来
  forbidden_mix: true                # 直接観測値と混ぜない

# --- OSS 薄ラップ（swap 可能性） ---
oss:
  primary:  { name: dinov2, via: libs/embedding.py }
  fallback: [openclip, dummy]        # CI は dummy backend（鍵・GPU 不要）
  pinned_contract: [embedding_dim, normalized_flag, dtype_float32]

# --- provenance（全出力レコードに付与） ---
provenance_fields: [run_id, schema_version, input_hash, model_name, model_version]

phase: 1                             # Phase 1 = Streamlit 期
status: draft                        # draft | review | accepted（実装ゲート連動）
```

---

## 4. golden fixture パターン

**目的**: 「決まった入力 → 決まった出力」を固定し、リグレッションと契約破壊を検知する。

```text
fixtures/
├── input/
│   ├── input_manifest.parquet      # 3 行程度の最小 manifest
│   └── tiny_*.jpg                  # テスト用に生成した小画像（テストが作る）
└── golden/
    └── output_manifest.expected.json   # 期待 OUT（provenance は除外 or 正規化）
```

**比較ルール**:
1. **決定的フィールドのみ**比較する（`record_id`/`capture_id`/`artifact_type`/列の有無・dtype・enum 値）。
2. **非決定的フィールド**（`run_id`/`created_at`/`docker_image`/`git_commit`）は **正規化（マスク）してから**比較する。
3. embedding 等の数値は **shape・dtype・`normalized_flag`・NaN なし**を検証し、ベクトル値そのものは（dummy backend で）決定的化するか許容差で比較する。
4. golden を更新するときは **PR の差分でレビュー**できるようにする（自動上書き禁止）。

```python
# tests/contract/test_embedding_contract.py（擬似コード・実装はゲート後）
def test_output_matches_golden(tmp_path):
    out = run_component(fixtures="fixtures/input", out_dir=tmp_path)   # dummy backend
    expected = load_json("fixtures/golden/output_manifest.expected.json")
    assert mask_nondeterministic(out.manifest) == expected            # 決定的列のみ
    assert validate_schema(out.manifest, "02-設計/_横断/schema/manifest/embedding_manifest.schema.yaml")
    assert all(f in out.manifest.columns for f in PROVENANCE_FIELDS)  # provenance 揃う
    assert out.embeddings.dtype == "float32" and not has_nan(out.embeddings)
```

---

## 5. 新しい component の追加手順（4 ステップ）

[`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) §3 を本テンプレに沿って実行する。

| # | 手順 | 成果物 | 正本リンク |
|---|------|--------|------------|
| 1 | **フォルダ** | 本テンプレ §1 を `components/<name>/` にコピー（manifest + run.py + tests + fixtures + Dockerfile + README） | 本書 §1 |
| 2 | **schema PR** | `02-設計/_横断/schema/` に in/out schema を追加し、manifest が参照（canonical・複製しない） | [`../02-設計/_横断/schema/02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) |
| 3 | **ADR** | `docs/adr/NNN-<name>.md`（なぜ追加・OSS 選定・代替・Phase 境界） | [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) |
| 4 | **catalog 行** | `catalog/components.yaml` に 1 行（id/kind/in/out/r2_prefix/status）→ UIbuilder REFRAME が紐づけ可能に | [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) §3 · [`ADR-H-01-uibuilder-reframe-adopted.md`](./ADR-H-01-uibuilder-reframe-adopted.md) |

**さらに**: ルート `Makefile` に `make <name>` を pipeline 直列順で追加。CI は path-filter で `components/<name>/**` 変更時にその component ジョブのみ起動（[`CI設計書-v1.md`](./CI設計書-v1.md)）。

---

## 6. `run.py` の最小契約（2026.06,06 モデル）

`指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` の共通契約を再掲（実装はゲート後）:

```text
CLI:  python run.py --input-manifest <path> --output-dir <dir> --run-id <ulid> --config <yaml>
      （ingest のみ --raw-images-prefix --metadata-path --output-prefix も可）

必須出力（output-dir 配下 / R2）:
  - output_manifest.parquet   # 成果物宣言（ADR-Phase2 §4.3）
  - run_info.json             # 1 run の監査（§4.1）
  - errors.jsonl              # record 単位の失敗（§4.2）

規律:
  - R2 write 前に exists チェック、存在すれば例外（no-overwrite）
  - tmp は tempfile（永続化禁止）
  - ID は ulid（ind/cap/img/run/snap/emb/thumb/qc...）
  - raw 画像 hash は SHA256(bytes)
  - 例外は record 単位で捕捉し継続
  - 大依存は遅延 import
```

---

## 7. 参照 component（2026.06,06 由来 · テンプレ適用例）

[`00-土台`](./00-土台-MiniKernel-C-USB-コンポーネント.md) §8.2 の一覧を本テンプレに当てはめると:

| component | kind | OUT artifact | OSS（第一候補） |
|-----------|------|--------------|------------------|
| `ingest_normalize` | transform | captures.parquet / individuals.parquet / input_manifest.parquet | Pillow/OpenCV |
| `thumbnail_builder` | transform | derived/thumbnails + thumbnail_manifest | Pillow |
| `embedding_builder_dinov2` | transform | embeddings.npy + embedding_manifest | PyTorch+DINOv2（CI=dummy） |
| `manifest_builder` | transform | searchable_capture_set / embedding_locator / individual_master | Polars/DuckDB |
| `tag_aggregator` | transform | tag_aggregate.parquet | Polars |
| `preference_aggregator` | transform | preference 集計（ADR-H-02） | Polars |

---

## 影響

- 本テンプレは [`ADR-Phase2-C-USB-component-契約.md`](./ADR-Phase2-C-USB-component-契約.md) の契約を実体化する唯一のフォルダ標準。
- [`CI設計書-v1.md`](./CI設計書-v1.md) の path-filter は本テンプレのフォルダ規約に依存する。
- 実装は設計ゲート 4 点の人間確定後。

---

*草案・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止ゲート有効 — 実装 Go 不可*
