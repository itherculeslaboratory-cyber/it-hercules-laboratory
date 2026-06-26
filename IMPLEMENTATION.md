# IT Hercules Laboratory

Append-only / immutable research data lake on Cloudflare R2. **Phase 1 MVP — complete** (pipeline + similarity search + Streamlit 5 pane).

**Design canonical** (pre-promotion): ``  
**Future standalone repo**: `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git`  
**Phase 2 web**: Next.js 15 + FastAPI（機能 01〜20 ルート · HUMAN-IMPL-SIGNOFF 2026-06-09）

## Layout

```text
it-hercules-laboratory/
├── apps/api/                 # FastAPI → libs/query · scoring · mock_store
├── apps/web/                 # Next.js 15 App Router + ThemePack (--civ-*)
├── apps/search/              # Streamlit 5 pane (filter→grid→detail→similar→tag)
├── catalog/components.yaml   # Phase 1 registry + pipeline order
├── components/
│   ├── ingest_normalize/
│   ├── thumbnail_builder/
│   ├── embedding_builder/    # dummy default · dinov2 optional (IHL_EMBEDDING_BACKEND)
│   ├── manifest_builder/
│   ├── qc_builder/           # stub (optional)
│   ├── color_feature_builder/
│   └── tag_aggregator/
├── libs/
│   ├── r2_io.py · event_store.py · query.py · image.py · embedding.py
│   ├── scoring.py · faiss_index.py   # ADR-H-12 rerank (0.5/0.2/0.2/0.1)
│   ├── market_state.py · board_store.py · economy_logic.py · pii.py · theme_pack.py
│   └── catalog.py · schema_validator.py
├── schemas/                  # Junction → 指示/.../schemas (or IHL_SCHEMAS_ROOT)
├── scripts/                  # run-pipeline.py · docker-dev.ps1
├── tests/                    # unit · contract · integration · e2e smoke
└── pyproject.toml            # [ml] optional: torch for dinov2
```

## Phase 1 pipeline

Serial order (`catalog/components.yaml` · `pipeline_order`):

1. **ingest_normalize** — input manifest → normalized capture parquet  
2. **thumbnail_builder** — source image → 512px long-edge PNG (no color correction)  
3. **embedding_builder** — image → L2-normalized `.npy` (`dummy` or `dinov2`)  
4. **manifest_builder** — join → `searchable_capture_set` + `embedding_locator` parquet

```powershell
# PowerShell (from it-hercules-laboratory/)
.\scripts\run-pipeline.ps1 `
  -InputManifest path\to\input_manifest.json `
  -SourceImage path\to\image.jpg `
  -OutputBase .ihl-pipeline-work `
  -RunId run_local_01

# Python (cross-platform)
python scripts/run-pipeline.py `
  --input-manifest path\to\input_manifest.json `
  --source-image path\to\image.jpg `
  --run-id run_local_01
```

### Embedding backends

| `IHL_EMBEDDING_BACKEND` | Deps | Use |
|-------------------------|------|-----|
| `dummy` (default) | none | CI · Docker · local dev |
| `dinov2` | `pip install -e ".[ml]"` | GPU inference (first run downloads weights) |

## Search UI (Streamlit 5 pane)

1. **フィルタ** — species / sex / stage / view (DuckDB whitelist)  
2. **グリッド** — thumbnail cards (色補正なし)  
3. **詳細** — selected capture metadata + raw image  
4. **類似** — embedding cosine + ADR-H-12 rerank (`libs/scoring.py`)  
5. **タグ** — append-only stub (Phase 2 wires `tag_aggregator`)

```powershell
docker compose up search
# http://localhost:8501
```

Parquet auto-discovery: `snapshots/latest_pointer.json` or `IHL_SEARCH_PARQUET`.

## Prerequisites

**推奨**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) のみ（Python 手動インストール不要）

**代替**: Python 3.11+ と pip（または [uv](https://github.com/astral-sh/uv) per ADR-Phase1-OSS）

## Phase 2 Web（Next.js + FastAPI）

**ワンクリック（打鍵・観測 v2 / CSV import 向け）**

```powershell
# civ-os ルート
.\scripts\dev-up.ps1

# または IHL ルート
cd 指示/it-hercules-laboratory
.\scripts\dev-up.ps1              # hybrid: Docker API + local Next.js
.\scripts\dev-up.ps1 -Mode docker # API + Web すべて Docker
```

```powershell
cd 指示/it-hercules-laboratory
docker compose up api          # http://localhost:8000/health

cd apps/web
npm install
npm run dev                    # http://localhost:3000
```

```powershell
# API + Web + Streamlit フルスタック
docker compose --profile full up --build

# API + Web のみ
docker compose --profile web up --build
```

| 層 | URL | 備考 |
|----|-----|------|
| Web | http://localhost:3000 | 01〜20 ルート · `指示/.../00-打鍵チェックリスト-v1.md` |
| API | http://localhost:8000 | DuckDB whitelist · mock ドメイン |
| Streamlit | http://localhost:8501 | 開発用 · Phase 1 検索 |

## Docker クイックスタート（推奨）

```powershell
cd 指示/it-hercules-laboratory
docker compose build
docker compose up search
```

```powershell
# 全 pytest（unit + contract + integration + e2e smoke + API）
docker compose --profile test run --rm test

# PowerShell ショートカット
.\scripts\docker-dev.ps1 up
.\scripts\docker-dev.ps1 test
```

| 項目 | 内容 |
|------|------|
| schemas | `schemas` を `/schemas` にマウント |
| 秘密情報 | `指示/it-hercules-laboratory/.env`（`.env.example` からコピー） |
| 詳細 runbook | [`05-運用/runbooks/local-dev-docker.md`](05-運用/runbooks/local-dev-docker.md) |

## Setup（ネイティブ Python）

```bash
cd 指示/it-hercules-laboratory
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
pytest -q
streamlit run apps/search/app.py
```

Optional ML backend:

```bash
pip install -e ".[dev,ml]"
set IHL_EMBEDDING_BACKEND=dinov2
```

Schemas junction (Windows):

```powershell
cmd /c mklink /J it-hercules-laboratory\schemas 指示\it-hercules-laboratory\schemas
```

## Design gate（repo root）

```bash
node scripts/ihl-four-point-inventory.mjs
node scripts/ihl-mock-coverage.mjs
node scripts/ihl-mock-fr-trace.mjs
node scripts/ihl-transition-edge-trace.mjs
node scripts/ihl-adr-term-conflict.mjs
node scripts/ihl-oss-license-audit.mjs
node scripts/ihl-schema-inventory.mjs
```

## CI

| Workflow | トリガ | 内容 |
|----------|--------|------|
| `ihl-python-ci.yml` | `it-hercules-laboratory/**` | pytest unit + contract + integration + e2e smoke |
| `ihl-design-gate.yml` | `指示/it-hercules-laboratory/**` | 設計機械チェック |

## Phase 1 完了 / Phase 2 以降

| 項目 | Phase 1 | Phase 2（現状） |
|------|---------|----------------|
| Pipeline 4 components | ✅ | color/qc を本配線 |
| Similarity search | ✅ numpy cosine + ADR-H-12 | API 経由 · FAISS は次 |
| Streamlit 5 pane | ✅ dev ツール | Next.js 本番 UI シェル ✅ |
| Web 01〜20 ルート | — | ✅ 到達可能 · mock+実検索混在 |
| FastAPI | — | ✅ whitelist クエリ |
| tag / usage events | stub UI | JSONL writer + aggregator |
| Playwright E2E | smoke pytest | ユーザー打鍵チェックリスト |
| 02 利用規約 | 人間ゲート | 草案バッジ UI ✅ |
| GMO live | stub tier ✅ | `P0-NEXT-GMO-LIVE-EXEC` |

## References

- `指示/it-hercules-laboratory/02-設計/_横断/adr/ADR-Phase1-IHL-repoフォルダ構成.md`
- `指示/it-hercules-laboratory/02-設計/_横断/adr/ADR-H-12-D02-類似検索重み.md`
- `指示/it-hercules-laboratory/02-設計/_ui-global/05-観測-Streamlit.md`
- `it-hercules-laboratory/docs/testing-strategy.md`
