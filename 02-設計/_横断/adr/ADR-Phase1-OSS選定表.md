# ADR-Phase1-OSS選定表 — OSS 第一候補・代替・Phase 境界・IHL 固定契約・ラップ方針

> **ステータス**: 草案（人間レビュー待ち）
> **決定日（草案）**: 2026-06-07
> **判断 ID**: Phase 1 — OSS 選定
> **正本**: 本 ADR · [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §9 · [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md)
> **前提**: F7 **OSS は薄くラップ** — 固定するのは schema / manifest / ID / 入出力契約（引き継ぎ §1.3）。ユーザー意図: **OSS 最大活用・カスタム UI 最小**（特に market / board）。

---

## 文脈

IHL（IT Hercules Laboratory）は **R2 を唯一の永続保存先**とする append-only / immutable データレイク上に、Parquet manifest 表検索と embedding 画像類似検索を載せるファイル契約型システム。Phase 1 は **Streamlit 検索 UI** が主（[`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §7）。本 ADR は各層の OSS 第一候補と代替、Phase 境界、IHL 側が固定する契約、ラップ方針を一覧化する。

**ラップ原則（全層共通）**: OSS は **swap 可能な部品**として扱い、IHL は **入出力契約（schema / manifest / ID / R2 キー）** のみを固定する。OSS の API をアプリ全体に漏らさず、`libs/` の薄いアダプタ経由で呼ぶ（フォルダ構成 ADR §「component 追加手順」と整合）。

---

## 1. OSS 選定表（層別）

| 層 | 第一候補 OSS | 代替 | Phase 境界 | IHL が固定する契約 | ラップ方針 |
|----|--------------|------|------------|--------------------|------------|
| **Web shell（Phase 2 UI）** | **Next.js 15（App Router）+ shadcn/ui + Tailwind** | Remix / SvelteKit + DaisyUI | **Phase 2**（Phase 1 は Streamlit）。Phase 1 では未導入 | ルート規約（`/match`=好み 等）・API 契約（OpenAPI）・デザイントークン | shadcn は **コピーイン**（vendoring）でそのまま使用。独自デザインシステムを増やさない。`components/ui/` は shadcn 生成物を直接利用 |
| **Forum / BBS ブリッジ（07 掲示板）** | **Discourse（埋め込み / Discourse API）** または **GitHub Discussions** を薄くブリッジ | Flarum / NodeBB | **Phase 2+**（Phase 1 はスレ列の R2 JSONL のみ） | `thread` / `post` / `pointer` イベント schema · `dispute_kind=board_pointer`（11 裁判が争い正本） | **BBS 本体を自作しない**。既存 forum OSS を埋め込み、IHL は **R2 へのイベントミラー（pointer）** と検索インデックスのみ持つ。争いフローは 11 へ委譲（F5） |
| **Market UI パターン（06 マーケット）** | **Medusa.js（admin / storefront UI patterns）** または **Saleor storefront** の UI 部品を参照 | Vendure UI / 自作最小カード | **Phase 2+**（Phase 1 は出品/取引なし） | `listing-state` / `trade-events` イベント列・8%=23 参照・取引成立=06 §11.0.1 | **非エスクロー**（F6）のため決済・配送 OSS は使わない。Medusa は **UI レイアウト参照のみ**（カート/一覧/詳細の構造）。状態機械は IHL 固定 |
| **検索 UI（Phase 1 主役）** | **Streamlit** | Gradio / Panel | **Phase 1 = 必須**。Phase 2 で Next web shell へ移行（Streamlit は内部ツール残置可） | filter→grid→detail→similar→tag の 5 pane 構成・query whitelist | Streamlit はそのまま使用。検索ロジック（DuckDB / cosine）は `libs/` に置き UI から分離（fetch べた書き禁止と同型） |
| **表クエリエンジン** | **DuckDB**（Parquet 直読 + SQL whitelist） | Polars（lazy frame）· PyArrow | **Phase 1 = 必須** | query whitelist（許可列・許可 filter）・`searchable_capture_set` 列契約 | DuckDB を `libs/query.py` でラップ。生 SQL をユーザー入力にしない（whitelist 経由）。Polars は前処理・rerank で併用可 |
| **データフレーム / 前処理** | **Polars** | pandas · PyArrow | **Phase 1 = 必須** | manifest 列 dtype・null/value_origin 規則（F8） | Polars lazy で manifest を読む薄いヘルパ。pandas は Streamlit 表示変換のみ |
| **画像処理** | **Pillow + OpenCV + scikit-image** | imageio · scikit-video（将来動画） | **Phase 1 = 必須**（ingest / thumbnail / color feature） | normalized 出力 manifest（サイズ・色空間・撮影条件保持）・**色補正しない**（preferences §C） | 各 `components/*/run.py` 内で利用。色補正・自動明度調整を **しない**ことを契約化（観測の真実性） |
| **embedding（画像ベクトル）** | **PyTorch + timm + DINOv2** | **OpenCLIP（ViT-B/32 等）** · CLIP · ResNet feature | **Phase 1 = 必須**（CI は dummy backend、本番 dinov2 — H-09/D-03） | `embedding_manifest` / `embedding_locator` 契約・`model_name` / `model_version` 記録（再解析可能性） | backend を **差し替え可能**に（dummy / dinov2 / openclip）。`libs/embedding.py` が共通 IF。次元・正規化・dtype を固定 |
| **ベクトル索引** | **subset numpy cosine**（Phase 1）→ **FAISS**（Phase 2） | Qdrant · pgvector（常駐 DB は F4 と要整合・原則回避） | **Phase 1 = numpy cosine（数十〜数百件で十分）**。FAISS は Phase 2 | 類似スコア rerank 重み（**H-05 待ち** — D-02）・candidate filter 順序 | 常駐 DB 化しない（DB 禁止 F2 思想）。FAISS index も R2 上の build_info manifest で再生成可能に |
| **R2 クライアント** | **boto3（S3 互換）** または **aioboto3** | s3fs · cloudflare-python（管理系） | **Phase 0 = 必須**（接続検証済 ADR-H-03） | env 4 変数（`R2_ENDPOINT` 等）・キー階層（`raw/` `normalized/` `derived/` `manifests/latest/` `events/`）・**no-overwrite 思想**（append-only） | `libs/r2_io.py` で put / get / list / exists をラップ。バケット作成は管理スクリプト（`CF_API_TOKEN`）に分離。civ-os `backend/src/utils/r2.ts` の思想を salvage（実装移植はしない） |
| **CI** | **GitHub Actions** | （なし — GitHub 運用前提 F3） | **Phase 1 = 必須**（lint / test / dummy embedding） | workflow 契約（lint→test→build）・dummy embedding backend（CI）· schema validate | `.github/workflows/` に最小 workflow。本番鍵・実 R2 書込は CI で行わない（read-only probe のみ可） |
| **コンテナ / 実行** | **Docker + Python CLI + Makefile** | docker-compose（多 component 起動時） | **Phase 1 = 必須** | 各 component の CLI 契約（input manifest → output manifest + run_info + errors） | 1 component = 1 `run.py` = 1 Docker target。Makefile が pipeline を直列起動。2026.06,06 component 思想と同型 |
| **Python パッケージ管理** | **uv**（高速・lock 再現性） | poetry · pip-tools | **Phase 0 = 決定**（D-未割当 / 本 ADR で uv 推奨） | `pyproject.toml` + `uv.lock` をコミット | uv を採用（CI も uv）。poetry からの移行容易性のため `pyproject.toml` 準拠を維持 |
| **スキーマ検証** | **Pydantic v2 + jsonschema** | attrs · marshmallow | **Phase 1 = 必須** | `02-設計/_横断/schema/*.yaml`（capture / searchable_capture_set / preference_event 等）を正本 | YAML schema を正本に、Pydantic は生成/検証アダプタ。civ-os の Zod 正本思想（16）と同型 |
| **テスト** | **pytest**（+ pytest-cov） | unittest | **Phase 1 = 必須** | immutability テスト（同一キー再 put 拒否）・schema 適合・manifest round-trip | `tests/` に unit / component / integration / immutability を分離 |
| **ライセンス（OSS 公開）** | **Apache-2.0**（特許条項あり・企業利用安心） | MIT | **公開前 = 決定**（H-07 / D-06 — 人間確定待ち） | NOTICE / LICENSE をルートに固定 | 依存 OSS のライセンス互換を CI で軽くチェック（将来） |

---

## 2. 「OSS 最大・カスタム UI 最小」方針の適用（market / board）

ユーザー意図に従い、**06 マーケット / 07 掲示板は UI を極力自作しない**。

| 機能 | 自作する最小部分 | OSS / 外部に委ねる部分 |
|------|------------------|------------------------|
| **07 掲示板** | R2 への `thread`/`post`/`pointer` イベント記録・検索インデックス・**11 裁判への指摘ブリッジ** | スレッド表示・投稿エディタ・通知（Discourse 等の forum OSS を埋め込み） |
| **06 マーケット** | `listing-state` / `trade-events` 状態機械・8% 起算（23 連動）・取引成立判定（06 §11.0.1） | 一覧/詳細/カートの UI レイアウト（Medusa/Saleor の storefront パターンを参照流用） |

**境界の理由**: 争い（F5）・取引成立（C1）・8%（C2）・振込（C3）は **IHL 固定契約**であり OSS に委ねられない。それ以外の **表示層は OSS 流用**でコストを下げる。

---

## 3. Phase 境界サマリー

| Phase | 導入する OSS | 導入しない |
|-------|--------------|-----------|
| **Phase 0** | boto3（R2 probe）· uv · pytest | 検索・embedding 本番・UI |
| **Phase 1** | Streamlit · DuckDB · Polars · Pillow/OpenCV · PyTorch+DINOv2（本番）/ dummy（CI）· numpy cosine · Docker · GHA · Pydantic | FAISS · Next web shell · forum/market OSS · FastAPI 本格 API |
| **Phase 2+** | FAISS · Next.js+shadcn web shell · Discourse/forum ブリッジ · Medusa/market UI パターン · FastAPI | 常駐 DB を真実源泉化（F2 で禁止） |

---

## 4. 未決（人間確定 / 別 ADR）

| ID | 論点 | 状態 |
|----|------|------|
| H-05 / D-02 | 類似スコア rerank 重み（cosine/color/size/lineage） | **未決** — 詳細設計前 |
| H-07 / D-06 | ライセンス（Apache-2.0 推奨 vs MIT） | **未決** — 公開前 |
| H-09 / D-03 | embedding CI backend（dummy + dinov2） | AI 指示書記載・**人間未確定** |
| Pkg 管理 | uv 採用（本 ADR 推奨） | 草案 — 人間確定で確定 |

---

## 影響

- [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) の `libs/` アダプタ層と整合（OSS は薄くラップ）。
- 05 観測の詳細設計（schema YAML 化）は本表の DuckDB / Polars / embedding 契約を前提にできる。
- 設計ゲート 4 点の人間確定は別途（本 ADR は OSS 選定の草案）。

## 参照

- [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) §9 OSS 第一候補 · §7 Phase 1 スコープ
- [`00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md`](../05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md) §1.3 F7
- [`02-設計/_横断/component/05-観測-OSS候補表.md`](../component分解/05-観測-OSS候補表.md)
- [`ADR-H-03-r2-bucket-dedicated.md`](./ADR-H-03-r2-bucket-dedicated.md)

---

*草案・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止ゲート有効*
