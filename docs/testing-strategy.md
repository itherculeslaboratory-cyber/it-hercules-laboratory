# IHL テスト戦略（it-hercules-laboratory）

> **正本**: `指示/it-hercules-laboratory/03-テスト計画/_横断/テスト設計書-v1-legacy.md` · `05-運用/queues/CI設計書-v2.md`  
> **対象 repo**: `it-hercules-laboratory/`（monorepo 内実装リポ）

---

## ピラミッドとディレクトリ対応

```text
                    ▲ 少
            ┌───────────────────┐
            │  E2E minimal      │  Implementation Sign-off 後（Streamlit / Playwright）
            ├───────────────────┤
            │  design contract  │  CI: `.github/workflows/ihl-design-gate.yml`
            ├───────────────────┤
            │  integration      │  tests/integration/
            ├───────────────────┤
            │  contract (C-USB) │  tests/contract/
            ├───────────────────┤
            │  unit             │  tests/unit/
            └───────────────────┘
                    ▼ 多
```

| 層 | パス | 内容 | 実行 |
|----|------|------|------|
| **unit** | `tests/unit/` | `libs/*.py`（`r2_io` · `query` · `schema_registry`）+ component stub（`thumbnail_builder`） | `pytest tests/unit` |
| **contract** | `tests/contract/` | `schema_validator` + YAML schema 正本との整合 | `pytest tests/contract` |
| **integration** | `tests/integration/` | pipeline smoke（`ingest_normalize` → parquet → DuckDB query · `ingest` → `thumbnail_builder` 連鎖） | `pytest tests/integration` |
| **design gate** | （Node スクリプト） | 4 点 inventory · mock trace · ADR 用語 | `ihl-design-gate.yml`（`指示/**` 変更時） |

---

## モック方針

| 依存 | テスト時 | 本番 |
|------|----------|------|
| R2 | `LocalFilesystemBackend` + `IHL_R2_LOCAL_ROOT` | boto3（`R2_*` env） |
| DuckDB | fixture parquet（`tests/conftest.py`） | `normalized/` / `snapshots/` の Parquet |
| GMO | stub tier のみ（`P0-NEXT-GMO-LIVE-EXEC` まで live 禁止） | 人間ゲート後 |

**no-overwrite**: `libs/r2_io.py` の `write_*` は存在チェック後に put。上書き試行は `R2NoOverwriteError`。

---

## CI

| Workflow | トリガ | ジョブ |
|----------|--------|--------|
| `IHL Python CI` | `it-hercules-laboratory/**` | pytest（unit + contract + integration） |
| `IHL Design Gate` | `指示/it-hercules-laboratory/**` | Node 設計機械チェック + schema junction |

ローカル: `docker compose --profile test run --rm test` またはホスト `pip install -e ".[dev]" && pytest`。

Docker Desktop 未起動時は **GitHub Actions を正**とする（`05-運用/runbooks/local-dev-docker.md` §トラブルシュート）。

---

## Phase 1 MVP 完了のテスト観点

- [x] `thumbnail_builder`（`libs/image.py` · unit + ingest 連鎖 integration）
- [x] `embedding_builder` · `manifest_builder`（unit + full pipeline integration）
- [x] immutability 専用テスト（`test_immutability_r2.py` · `test_immutability.py`）
- [x] `libs/scoring.py`（cosine + ADR-H-12 rerank · `test_scoring.py`）
- [x] optional stubs（`qc_builder` · `color_feature_builder` · `tag_aggregator`）
- [x] E2E smoke（`tests/e2e/test_search_smoke.py` — pipeline + similarity、Playwright なし）
- [ ] Playwright フル UI E2E（Phase 2 · Next shell 移行後）

*2026-06-09 · Phase 1 MVP pytest + e2e smoke 完走*
