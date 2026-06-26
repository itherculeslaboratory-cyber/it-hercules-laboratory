# CIV-OS / IHL AI 実装指示 — 統合版（たたき台・非正本）

> **用途**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/` 配下 4 ファイルの **共通参照** として civilization-os 側に置く統合版。  
> **正本（将来）**: `it-hercules-laboratory` リポジトリ `05-運用/queues/` へ移行後は **IHL repo 側を正** とする。  
> **作成日**: 2026-06-07  
> **根拠**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書`・`詳細設計書`・`要件定義1`・`ファイル別実装指示`

---

## 読み方

| 項目 | 内容 |
|------|------|
| **本文** | 下記 §1 は `AI実装指示書` の **全文**（ユーザー貼付 spec の正本コピー） |
| **目標アーキテクチャ** | [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md) |
| **civ-os とのギャップ** | [`01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md`](./01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md)・[`02-設計/_横断/component/00-マスターcomponent分解表.md`](./02-設計/_横断/component/00-マスターcomponent分解表.md) |
| **観測 OSS 詳細** | [`02-設計/_横断/component/05-観測-OSS候補表.md`](./02-設計/_横断/component/05-観測-OSS候補表.md) |

**注意**: 本書は **実装 Go ではない**。設計ゲート（`.cursor/rules/design-before-implementation-gate.mdc`）通過前はコード変更禁止。

---

## 関連資料（2026.06,06 原本）

| ファイル | 内容 |
|----------|------|
| [`../2026.06,06/要件定義1`](../2026.06,06/要件定義1) | Part 1: 上位要件・OSS 一覧・R2 ディレクトリ・ファイル契約 |
| [`../2026.06,06/詳細設計書`](../2026.06,06/詳細設計書) | schema 列・component 詳細・検索 rerank・snapshot 規則 |
| [`../2026.06,06/AI実装指示書`](../2026.06,06/AI実装指示書) | 本文 §1 の原本 |
| [`../2026.06,06/ファイル別実装指示`](../2026.06,06/ファイル別実装指示) | モジュール単位 ToDo + 完了判定 11 項目 |

---

## §1 AI実装指示書（全文）

```
AI実装指示書 圧縮版v0.1| あなたはR2オンリー/DBなし/append-only/ファイル契約ペースの個体画像検索基盤を実装する。目的: raw画像+metadataをR2へ保存

し、normalized Parquet/derived artifacts/manifests/latestを生成し、Streamlit UIでmetadata検索+thumbnail表示+既存captureをqueryにしたembedding類似検索

+tag/usage記録を行う。厳守、永続保存はCloudflare R2のみ:DB禁止、既存ファイル更新/削除禁止、同run id出力先存在時はfail: 修正は新record/新snapshotで表現: latestは

再生成物、真実はR2上ファイル:OSSは交換可能に薄く使う、直接観測/画像由来/推定/補間を混同しない。技術: Python3. 11+, boto3/s3fs or fsspec for R2. pyarrow, polars, duckdb, numpy, pillow, opencv-python, torch, timm or torch, hub DIN0v2, streamlit, pydantic/pyyaml.ulid-py.pytest。リポジトリ構成 /components/lingest normalize. thumbnail builder, embedding builder dinov2, manifest builder, tag aggregator):/apps/simple search ui:/libs/(r2 io, schema_validator, ids, hashing, parquet io, logging contract, embedding io, search)/02-設計/_横断/schema./dictionaries:/configs./tests/Makefile:/README.md。共通実装すべてのcomponentにrun. pyを置きCLI引数 -input manifest -output dir run id-config を受ける。ただしingestは -raw images prefix metadata path -

output prefix も可。共通出力は必ず output manifest, parquet, run info ison, errors isonl, run infoには

run_id, component_name, component version, pipeline name, pipeline version, input manifest, output_path, output_manifest, errors_path, created_at, finished_at, status. git_commit, docker_image, parameters, input count, output count, error count, warning count, schema version を入れる。errors.jsonlは

error_id, capture_id, individual_id , input path, error_type , severity, message, detail, run id created at, schema version, output manifestは record id, capture id, individual id, artifact type, artifact path, artifact format, pipeline name, pipeline_version, model_name, model_version, input_hash, schema_ver sion, run id, created_at, R2 1/0 r2://bucket/key を扱える関数 list_objects, read_bytes, write bytes, read parquet, write_parquet, read jsonl, write jsonl_part, exists を実装。write時はexistsチェックし、存在すれば例外。ローカ

ルtmpは tempfile 使用、永続化禁止。ID: ulidで ind.cap. img run, snap emb, thumb qc cf sfte ue を生成。hash: raw画像はSHA256 bytes schema validator: YAML schemaを読み、required列存在、型の概略、dictionary enumを検証。Phase1必須schema列は以下を実装時固定。capture: capture id, individual id, image id, image path, capture_timestamp, year, species, sex, alive_status, stage_name, stage subtype, view type, source type, raw_source_ref.m

issing reason, record version, schema version, run id, created at individual: individual id, local label text, species, birth or hatch date, source_type, raw_source_ref, note, record_version, schema version, run_id, created_at, thumbnail_manife st

thumbnail id, capture id. image_id, individual_id, thumbnail_path, width px, height px, format, source_image_path, input_hash, thumbnail_version, pipeline_name, pipelin e version, schema version, run id, created at, embedding manifest

embedding id, capture id, individual id. image id, part type, embedding model, embedding version, embedding dim, embedding file, vector_offset, vector_length, normaliz ed_flag, input_image path, input hash, preprocessing_name, preprocessing version, model_name, model_version, pipeline_name, pipeline_version, snapshot_id, schema vers ion, run id, created at searchable capture set:

capture id, individual id. image id snapshot id, species, year, capture_timestamp, sex, alive status, stage_name, stage_subtype, view_type, qc_flag, qc score, body_lengt

h_mm, body_length_value_origin, horn_length_mm, horn_length_value_origin, thorax_width_mm, thorax_width_value_origin, hue_mean, hue_std, saturation mean, saturation_ std, brightness mean, brightness_std, black_ratio, aspect_ratio, symmetry_score, sire_id, dam_id, lineage_id, lineage group, thumbnail path, image path, embedding ref.p ipeline name, pipeline version, model_name, model_version, input hash, schema_version, run_id, created_at, embedding locator: capture_id, individual_id, image_id, part_type, embedding id, embedding model, embedding version, embedding dim, embedding file, vector_offset, normalized_flag, adopte

d_flag, snapshot_id, source_run_id, schema_version, run id,created_at, tag event JSONL

tag_event_id, target_type, target_id, tag, tag_type, action, source type, source_id,confidence, reason, evidence_ref, model_name, model version, run id. created at schem a version, usage event JSONL

usage event id, event type, user id hash, session id, query id, target_type, target_id, filters, sort key, result_count, top result_ids, ui_name, ui_version, created_at. schema_version。辞書最小

sex=(male, female, unknown, undetermined): alive status-lalive, dead, unknown, not applicablel stage name=legg. larva, pupa, adult, unknown) view type=[dorsal, ventral. lateral left, lateral_right, frontal, oblique, unknown); ac flag-lusable, warning, reject, unchecked) source type=(manual_import,camera_exif. batch_import, user_raw, s ystem_raw, human_added, batch_added, model_inference, unknown): value origin=(direct_observed, image derived, environment derived, lineage_derived, estimated, imputed aggregate, unknown) tag action=ladd, invert, review needed, deprecate, weak add, alias, merge, split) tag type=topic. morphology, color, lineage, quality, status, warni ng, duplicate hint, research gap, hypothesis, review) usage event type=search. view, cite, download, similar search, tag add, tag invert, export) artifact type=(raw_image, normalized_table, thumbnail, embedding, manifest, snapshot, run_info, error_log)。実装1 ingest normalize: 入力 metadata CSV/JSONLは最低

image path, individual id任意, species, sex, stage name, view type, capture timestamp, horn length mm等任意を許可。R2 raw画像を読みhash。capture id/image idがなけ

れば生成。yearはcapture timestampから派生。individual idがなければ空でも可、local label textから生成しない。captures, parquet, individuals, parquet, input manifest, parquetを出力。input manifest列

capture id, individual_id, input path, input type, species, view type, stage name, schema version, input hash。実装2 thumbnail builder input manifestを読み画像をR2 から取得、PillowでEXIF transpose、長辺512px、JPEG保存。thumbnail path=output dir/thumbnails/(capture id) jpg. thumbnail manifest とoutput manifest作成。失敗行はerrorsへ、処理継続。実装3 embedding builder dinov2: input manifestを読み画像取得、Pillow RGB、モデルはまず簡易実装でもよいが本番はDINOv2。最小実装では config model backend= (dummy, dinov2) を用意しdummyは画像resize後の色/簡易特徴から固定dimペクトル生成、dinov2はtorchで実装。必ずfloat32 np. ndarray shape=(n. dim) を embeddings.npy 保存、各行offsetをembedding manifestへ。L2 normalize Lnormalized flag=true。NaN禁止。実装4 manifest builder: 入力configで captures path. thumbnail manifest path, embedding manifest path を受ける。Polarsでleft join し snapshot id生成。searchable capture setを作成し manifests/snapshots/searchable capture set/snapshot id=snapshot id)/part-000 parquet と manifests/latest/searchable capture set/part-000. parquet に保存。embedding locatorも同様。individual masterはindividual idごとにcapture count/latest capture/representative captureを集計して保存。latest保存時も既存があれば上書きしない方針に矛盾するため、実装は latest tmp (snapshot id) を作り、ローカル/運用上はポインタ方式を推奨は

manifests/latest/searchable capture set pointer, json 等を新規作成できない場合は timestamp付き pointer を作り、UIは最新created at pointerを読む。簡易Phase1で latest実体コピー先が存在しない初回のみ作成、以後はpointer方式。実装5 simple search ui: Streamlit。設定でR2 bucketとlatest pointer/pathを指定。searchable capture setをDuckDBまたはPolarsで読込。sidebar filter species, sex, stage name, view type, qc flag, year, horn length range。結果table+thumbnail表

示 。capture idを選んで類似検索。類似検索はembedding locatorからquery/candidateのembedding file+offset取得。NPY全体読込で可。cosine=dot。final score=0.7 *cosine + 0.3*size similarity、size similarityはhorn/body/thoraxの標準化差、欠損なら0.5。topK表示。検索時usage eventを書き込む。画像閲覧時view event。タグ追加UIでtag eventを書き込む。実装6 tag aggregator tags/events/**/*. jsonlを読み、target type, target id tagでgroup。add系count, invert count, review needed count を集計。tag stated invert/review>0 disputed, add>=2 strong、add=1 weak、deprecate O deprecated, tag aggregate parquetをsnapshot/latest pointer方式で保存。 実装7 usage/tag writer: 既存JSONLに追記せず logs/.../part-luuid).json! または tags/events/.../part-luuid).ison! を新規作成。テスト: tests/dataに小画像3枚を生成するfixtureを作る。pytestで r2_io はローカルfsモック可。ただし本番コードはr2//対応。test ingest

outputs required columns, test thumbnail files exist, test embedding shape_and_manifest_offsets, test_manifest_join_and_snapshot, test_similarit y_order_dummy, test tag_aggregate disputed, test_no_overwrite, Makefile: init-02-設計/_横断/schema, ingest, thumbnail, embedding, manifest, ui. tag-aggregate, test. README に、env例を書く: R2 ENDPOINT URL, R2 ACCESS KEY ID, R2 SECRET ACCESS KEY, R2 BUCKET. Docker 各component共通baseでよい。品質型ヒントを付ける。例外はrecord単位で捕捉。ログは標準出力+errors.jsonl。大きな依存は遅延 import UIは大量画像を一括DLしない、thumbnailのみ表示。納品物実行可能なPythonコー

ド、02-設計/_横断/schema/dictionaries yaml、サンプルconfig、Makefile、README、pytest。最小動作確認コマンド: make test: make ingest RAW PREFIX=r2://... METADATA=r2://... make thumbnail: make embedding MODEL BACKEND=dummy make manifest, make ui。注意:Qdrant/SQLite/Postgres等を使わない。FAISSはPhasel不要。もしキャッシュを使う場合も永続真実扱いしない。既存R2オブジェクト削除APIを呼ばない。既存keyへのputを禁止。latest更新問題はpointer新規作成で解決すること。実装中に不明点があれば、R2上のappend-only性と再解析可能性を優先して判断する。
```

---

## §2 ファイル別実装指示（要約）

`指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/ファイル別実装指示` より。詳細は原本参照。

| モジュール | 責務 |
|-----------|------|
| `libs/ids.py` | ULID 生成（prefix 付き） |
| `libs/hashing.py` | SHA256 bytes / filelike / JSON |
| `libs/r2_io.py` | R2Client — exists / read / write（no overwrite）/ Parquet / JSONL part |
| `libs/schema_validator.py` | YAML schema + dictionary enum 検証 |
| `libs/logging_contract.py` | RunContext — run_info / errors / output_manifest |
| `libs/embedding_io.py` | NPY offset 読取・L2 normalize |
| `libs/search/scoring.py` | cosine / color-size similarity / final score |
| `components/ingest_normalize/run.py` | metadata → captures / individuals / input manifest |
| `components/thumbnail_builder/run.py` | EXIF transpose · 512px JPEG |
| `components/embedding_builder_dinov2/run.py` | dummy + dinov2 backend |
| `components/manifest_builder/run.py` | join · snapshot · pointer |
| `components/tag_aggregator/run.py` | tag event JSONL 集約 |
| `apps/simple_search_ui/app.py` | Streamlit 検索 UI |

**完了判定 11 項目**（実装 AI 自己検査）:

1. DB import/起動なし  
2. R2 以外を永続保存にしない  
3. 既存 key 上書き/削除なし  
4. 全 component が run_info / errors / output_manifest を出力  
5. Parquet 列が schema と一致  
6. embedding offset で正しい vector  
7. searchable capture set から UI 検索可  
8. 類似検索が query 自身を最上位または除外設定で次点  
9. tag event を消さず tag aggregate で状態表現  
10. latest 更新を新 snapshot/pointer で表現  
11. README だけで再現実行可  

---

## §3 詳細設計・要件定義への参照

| トピック | 参照先 |
|----------|--------|
| R2 ディレクトリ階層 | `要件定義1` §R2ディレクトリ設計書 |
| OSS 第一候補一覧 | `要件定義1` §使用OSS一覧 |
| schema 全列 | `詳細設計書` 圧縮版 v0.21 + 追補 v0.2 |
| 検索 rerank 重み | 詳細設計書: 0.50 embedding + 0.20 color + 0.20 size + 0.10 lineage（**AI指示書 0.7/0.3 と揺れ — ADR 要**） |
| Phase 1 スコープ | `要件定義1` §Phase 1 実装スコープ定義書 |
| USB-C 比喩 | `要件定義1` §3.3 コンポーネント設計思想 |

---

## §4 目標アーキテクチャ・civ-os ギャップ（別表）

**本書本文は IHL Phase 1 実装指示**。CivilizationOS 現状との差分は以下を正とする。

| 観点 | 目標（IHL） | civilization-os 現状 | ギャップ表 |
|------|-------------|----------------------|------------|
| リポジトリ | `it-hercules-laboratory` | `civilization-os` monorepo | [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md) §3 |
| 永続保存 | R2 のみ・DB 禁止 | R2 SSOT + 投影 DB 可 | `00-AI-HANDOFF-BRIEF.md` §4 |
| パイプライン | Python CLI component | Node/Express + 固体観測 API | [`05-観測-OSS候補表.md`](./02-設計/_横断/component/05-観測-OSS候補表.md) |
| UI Phase 1 | Streamlit | React Kernel UI | `16-UIbuilder.md` §11 |
| 掲示板 | GitHub PR/Issue + component BBS（IHL） | file-board linkage（**legacy** civ-os） | [`05-GitHub運用-コンポーネント掲示板.md`](./05-GitHub運用-コンポーネント掲示板.md) |
| 20 機能分解 | component 7 分類 | FeatureNode + Kernel（**legacy**） | [`00-マスターcomponent分解表.md`](./02-設計/_横断/component/00-マスターcomponent分解表.md) |

---

## §9 リポジトリ戦略 — IHL 単一 OSS · legacy civ-os archive（2026-06-07）

> **ユーザー確定方針** — 詳細: [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md) · [`00-AI-HANDOFF-BRIEF.md`](./00-AI-HANDOFF-BRIEF.md) §2.1

| 項目 | 理想設計 |
|------|----------|
| **正本 repo** | `it-hercules-laboratory` — component · UI · R2 runtime を **1 repo** に載せる |
| **legacy** | `civilization-os` — 参照 + salvage のみ。**並行製品 · consumer モデルは廃止** |
| **C-Sync** | **理想設計では全面不採用** — GitHub（改善履歴）+ R2（本番データ） |
| **ランタイムデータ** | 観測 JSON · karma · platinum = **R2 append-only 必須**（GitHub 非保存） |
| **公開** | IHL = **OSS public** 方向 |
| **本書 §1 の実装指示** | **IHL repo 向け**。civ-os monolith への実装 Go **ではない** |

**設計 AI**: §4 の「civilization-os 現状」列は **legacy ギャップ参照** と読む。新実装先は **IHL のみ**。

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
