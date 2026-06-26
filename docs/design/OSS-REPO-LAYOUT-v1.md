# OSS リポジトリレイアウト設計 v1

> **ステータス**: Phase 1–2 部分実施（2026-06-10）— scaffold + safe peel · pytest 回帰必須
> **作成日**: 2026-06-10
> **対象 repo**: `指示/it-hercules-laboratory/`（Strategy B · 設計+実装統合 · OSS 公開時は `指示/` プレフィックス除去）
> **正本（設計）**: `指示/it-hercules-laboratory/02-設計/_横断/adr/ADR-Phase1-IHL-repoフォルダ構成.md` · `ADR-Phase2-C-USB-component-契約.md` · `component/componentテンプレ-標準構成.md`
> **GitHub 運用**: `指示/it-hercules-laboratory/05-GitHub運用-コンポーネント掲示板.md` · `#19` 詳細設計
> **関連**: [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) · [`指示/.../OSS-CONTRIBUTOR-ONBOARDING-v1.md`](../../docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md)

---

## A. 現状の問題

### A.1 `apps/api/main.py` — 部分 god file

| 指標 | 現状 |
|------|------|
| 行数 | **733 行** |
| インライン `@app.*` | **38 エンドポイント**（market / board / match / economy / dispute / component-board 等） |
| 抽出済み router | 9 ファイル（`auth`, `env`, `devices`, `me`, `onboarding`, `research`, `observation_solid`, `gmo`, `i18n`） |

**問題**: 新規 contributor が「どの PR がどの機能か」を判別しづらい。ドメインロジック（`libs/query`, `libs/scoring` 等）を main から直接呼び、**thin route 原則**に反している。

### A.2 `libs/` — フラット 33 ファイル

```text
libs/
├── gmo_connector.py, gmo_connector_stub.py, gmo_webhook_*.py, ...  (6)
├── switchbot_client.py, placement_store.py, device_registry.py, ... (env 系)
├── event_store.py, r2_io.py, schema_validator.py                  (core)
├── economy_logic.py, market_state.py                              (economy)
├── github_component_board.py, board_store.py                      (board)
└── ... (計 33 .py、サブディレクトリなし)
```

**問題**: OSS 改善時の PR スコープが不明瞭。fork 単位がファイル単位になり、レビュー負荷が増える。

### A.3 `components/` — テンプレ未達

| 項目 | テンプレ要求 | 現状 |
|------|-------------|------|
| ディレクトリ数 | — | **9**（ingest_normalize, embedding_builder, …） |
| `manifest.yaml` | 全 component | **env_ingest のみ** |
| `tests/` colocate | unit + contract | **なし**（`tests/unit/test_*_builder.py` に分離） |
| `fixtures/golden/` | 契約固定 | **なし** |
| `README.md` | 必須 | **なし** |
| `docs/components/<name>/BOARD.md` | #19 索引 | **component-board の 1 件のみ** |

### A.4 `tests/` — 機能から分離

- **58 ファイル**（unit 44 / integration 9 / contract 3 / e2e 1）
- component 名と test ファイル名は対応するが、**同一ディレクトリにない**ため改善ループが長い

### A.5 `schemas/` — 実装 repo に不在

- `libs/schema_validator.py` は `IHL_SCHEMAS_ROOT` → monorepo `指示/.../02-設計/_横断/schema/schemas/` をフォールバック
- ADR 上の canonical は設計ツリー側。**OSS 単体 clone 時の contributor 体験**要改善（junction / submodule / CI マウントは Phase 1 以降）

### A.6 `apps/web/` — ルート中心

- **49** ソースファイル、`src/app/**/page.tsx` ベース
- `hooks/`・`components/` は `src/` 直下。**機能 #NN 単位の colocate なし**

---

## B. 設計原則（OSS · C-USB · fork · PR 粒度）

| ID | 原則 | 内容 |
|----|------|------|
| **P1** | 1 component = 1 directory | `manifest.yaml` · `run.py` · `tests/` · `fixtures/golden/` · `README.md` · （任意）`Dockerfile` |
| **P2** | Domain modules | `libs/ihl/<domain>/` — フラット 50 ファイル禁止 |
| **P3** | API routes thin | `apps/api/routes/<feature>.py` → `libs/ihl/<domain>/` のみ呼ぶ |
| **P4** | Web features colocate | `apps/web/src/features/<nn-name>/` に hooks · components · api-client |
| **P5** | Tests mirror domains | 方針 A: `tests/<domain>/` / 方針 B: component 内 colocate（**component は B 優先**） |
| **P6** | File count control | 各フォルダ **README 索引** · **~15 files/dir 目安** · barrel `__init__.py` は **package 境界のみ** |

**PR 粒度**: 1 PR = 1 スコープ（`component:<name>` OR `domain:<name>` OR `feature:#NN`）。schema 変更は **別 PR**（ADR-Phase2 §6）。

**fork**: C-USB component は `components/<name>/` 単位で fork 可能。ドメイン改善は `libs/ihl/<domain>/`。

---

## C. 提案ツリー（target state）

### C.1 現状 vs 提案（ASCII）

```text
【現状 — 抜粋】                          【提案 — target state】

it-hercules-laboratory/                  it-hercules-laboratory/
├── apps/                                ├── apps/
│   ├── api/                             │   ├── api/
│   │   ├── main.py  ←733L, 38 routes    │   │   ├── main.py      ← wiring only (~80L)
│   │   └── routes/ (9 files)            │   │   └── routes/
│   │       auth, env, gmo, ...          │   │       observation.py, market.py,
│   └── web/src/app/...                  │   │       board.py, dispute.py, ...
│       (route-based pages)              │   └── web/src/
├── libs/  ←33 flat .py                  │       features/
├── components/ ←no tests/README         │         05-observation/
├── tests/unit/ ←far from components     │         06-market/
├── (no schemas/)                        │       app/  ← thin re-export pages
└── docs/components/                     ├── libs/ihl/
    component-board/BOARD.md only        │   core/      event_store, r2_io, schema_validator
                                         │   observation/ query, scoring, embedding, image
                                         │   economy/     economy_logic, market_state
                                         │   env/         switchbot, placement, telemetry
                                         │   governance/  dispute helpers, github_board
                                         │   payments/    gmo_*
                                         │   i18n/        i18n_catalog
                                         ├── components/
                                         │   ingest_normalize/
                                         │   ├── manifest.yaml, run.py, README.md
                                         │   ├── tests/unit/, tests/contract/
                                         │   └── fixtures/golden/
                                         │   embedding_builder/ ...
                                         ├── tests/           ← integration · e2e · cross-domain
                                         │   observation/
                                         │   economy/
                                         ├── schemas/         ← junction → design canonical (Phase 1+)
                                         └── docs/
                                             components/
                                               ingest_normalize/BOARD.md
                                               embedding_builder/BOARD.md
                                               ...
```

### C.2 `libs/ihl/` ドメイン案（現行ファイル対応）

| ドメイン | 移行元（現 `libs/*.py`） |
|----------|-------------------------|
| `core/` | `event_store`, `r2_io`, `schema_validator`, `catalog`, `domain_catalog` |
| `observation/` | `query`, `scoring`, `embedding`, `image`, `faiss_index`, `solid_commit`, `measurement_template_catalog` |
| `economy/` | `economy_logic`, `market_state` |
| `env/` | `switchbot_client`, `placement_store`, `device_registry`, `collector_ingest`, `env_telemetry` |
| `governance/` | `board_store`, `github_component_board`, `pii` |
| `payments/` | `gmo_*`（6 ファイル） |
| `i18n/` | `i18n_catalog` |
| `identity/` | `auth_session`, `preferences_store` |
| `theme/` | `theme_pack` |

### C.3 `apps/api/routes/` 分割案（main.py から peel）

| 新 route ファイル | 機能 # | 移行元 main.py プレフィックス |
|------------------|--------|------------------------------|
| `observation.py` | 05 | `/api/v1/observation/*`, templates, measurements |
| `market.py` | 06 | `/api/v1/market/*` |
| `board.py` | 07, 19 | `/api/v1/board/*`, `/api/v1/component-board` |
| `match.py` | 10 | `/api/v1/match/*` |
| `economy.py` | 08 | `/api/v1/economy/*`, contribution, profile metrics |
| `cross.py` | — | `/api/v1/cross/*` |
| `vote.py` | 20 | `/api/v1/votes/*` |
| `photo_analysis.py` | 18 | `/api/v1/photo-analysis/*` |
| `builder.py` | 16 | `/api/v1/builder/*`, theme-packs |
| `settings.py` | 12 | `/api/v1/settings/*` |
| `legal.py` | 02 | `/api/v1/terms`, `/api/v1/legal/*` |
| `home.py` | 04 | `/api/v1/home/summary` |
| `pipeline.py` | — | `/api/v1/pipeline/*` |
| `dispute.py` | 11 | `/api/v1/dispute/*`（service は `apps/api/` または `libs/ihl/governance/`） |

---

## D. ファイル数 vs 改善しやすさ

| 方式 | ファイル数 | 改善しやすさ | 推奨 |
|------|-----------|-------------|------|
| Monolith `main.py` | 少 | 悪 — 全機能が 1 diff に混ざる | **分割** |
| 1 file per endpoint | 多 | 中 — import 地獄・横断変更が辛い | **避ける** |
| **domain package + thin routes** | 中 | **良** — PR スコープ明確・テスト mirror 可 | **推奨** |
| full microservice per feature | 最多 | 過剰 — OSS 小規模には CI/デプロイ負荷 | **不要** |

**目安（P6）**:

| ディレクトリ | 目標ファイル数 |
|-------------|---------------|
| `libs/ihl/<domain>/` | ≤ 12 .py + README |
| `apps/api/routes/` | 1 feature ≈ 1 file（100–200 行） |
| `components/<name>/` | テンプレ準拠 8–15 |
| `apps/web/src/features/<nn>/` | pages + hooks + components ≤ 15 |

---

## E. GitHub 運用設計

> 正本たたき台: `指示/it-hercules-laboratory/05-GitHub運用-コンポーネント掲示板.md`

### E.1 Issues

| テンプレート | 用途 |
|-------------|------|
| `bug_report.md` | 再現手順 · pytest ログ · 機能 # |
| `feature_request.md` | 要件 FR 参照 · POST-OSS ID |
| `component_improvement.md` | **component ラベル必須** · manifest / golden 影響 |

### E.2 Discussions カテゴリ案

| Category | 用途 |
|----------|------|
| **Q&A** | セットアップ · pytest · schema 参照 |
| **Ideas** | 機能 # · ADR 起票前の brainstorm |
| **Show and tell** | run_info サンプル · 観測パイプライン成果 |
| **component-\*** | パイプライン component 別（`component-ingest`, `component-embedding`, …） |

### E.3 Component board (#19)

**二層モデル**（既存実装と整合）:

| 層 | 正本 | 実装 |
|----|------|------|
| 議論・改善履歴 | GitHub | `docs/components/<name>/BOARD.md` + Discussions |
| ランタイム | R2 append-only | `event_store`（GitHub に置かない） |
| API 索引 | FastAPI | `GET /api/v1/component-board` → `GithubComponentBoard` |

`libs/github_component_board.py` 契約:

- `docs_root = docs/components`
- 各 item: `component_id`, `github_board_url`, `github_discussion_url`, `board_exists`

**ギャップ**: 現状 BOARD は `component-board` のみ。Phase 1 で **各 pipeline component 名**（`ingest_normalize` 等）に BOARD を追加。

### E.4 CONTRIBUTING.md 追記案（PR の出し先）

| 変更内容 | PR 先パス | ラベル例 |
|----------|----------|---------|
| C-USB パイプライン | `components/<name>/` | `component:<name>` |
| ドメインロジック | `libs/ihl/<domain>/` | `domain:<domain>` |
| HTTP API | `apps/api/routes/<feature>.py` | `feature:#NN` |
| UI | `apps/web/src/features/<nn>/` | `feature:#NN` |
| 契約変更 | **別 PR** → schema canonical | `type:schema` |
| 設計のみ | `指示/it-hercules-laboratory/`（monorepo） | `docs-only` |

### E.5 CODEOWNERS 案（optional）

```text
/components/                    @itherculeslaboratory-cyber/pipeline-maintainers
/libs/ihl/observation/          @itherculeslaboratory-cyber/observation
/libs/ihl/payments/             @itherculeslaboratory-cyber/payments
/docs/components/               @itherculeslaboratory-cyber/pipeline-maintainers
/apps/api/routes/               @itherculeslaboratory-cyber/api
/apps/web/src/features/         @itherculeslaboratory-cyber/web
```

---

## F. コンポーネント改善フロー（1 ページ）

```text
Issue / Discussion
    │
    ├─ Intent を docs/components/<name>/BOARD.md に追記（append-only）
    │
    ▼
fork → branch: component/<name>/<short-desc>
    │
    ├─ schema 要否? ──Yes──► 別 PR: 指示/.../02-設計/_横断/schema/
    │
    ▼
実装
    ├─ components/<name>/     （run.py · manifest · golden）
    └─ libs/ihl/<domain>/     （共有ロジック）
    │
    ▼
tests
    ├─ components/<name>/tests/   （colocate · 推奨）
    └─ tests/<domain>/            （横断 integration）
    │
    ▼
PR checklist — テスト設計書 v1 §2 の 11 項目
    1. 必須列が揃う（contract）
    2. 型・enum 適合
    3. provenance 付与
    4. value_origin 正しさ
    5. run_info / errors 出力
    6. immutability（no-overwrite）
    7. manifest golden
    8. 内部ロジック単体
    9. 部分失敗の継続
   10. OSS swap 不変契約
   11. manifest 参照整合
    │
    ▼
CI green → Review（output manifest sample 添付）→ Merge
    │
    └─ BOARD.md に Decision 追記 · Discussion リンク
```

---

## G. 移行フェーズ（実装 repo）

| Phase | 内容 | コード変更 |
|-------|------|-----------|
| **0** | **本 doc のみ** | なし |
| **1** | 新規コードは新パスのみ | 新 component はテンプレ完全準拠 · 新 route は `routes/` · 新 lib は `libs/ihl/` |
| **2** | `main.py` peel | 機能ごとに `routes/<feature>.py` へ移動 · main は router include のみ |
| **3** | `libs/` domain folders | フラット → `libs/ihl/<domain>/` · re-export shim で後方互換（deprecation 1 リリース） |

**禁止**: Phase 0–1 での mass move · 一括 rename · 全 component 同時テンプレ化。

**完了条件（Phase 3 後）**:

- `main.py` < 100 行
- 全 pipeline component に `manifest.yaml` + README + BOARD.md
- `pytest` 緑 · parity script 回帰なし

---

## 参照

| ドキュメント | パス |
|-------------|------|
| アーキテクチャ概要 | `docs/ARCHITECTURE.md` |
| C-USB 契約 | `指示/.../adr/ADR-Phase2-C-USB-component-契約.md` |
| component テンプレ | `指示/.../component/componentテンプレ-標準構成.md` |
| 11 項目 PR checklist | `指示/.../03-テスト計画/_横断/テスト設計書-v1-legacy.md` §2 |
| GitHub 運用 | `指示/.../05-GitHub運用-コンポーネント掲示板.md` |
| OSS オンボーディング | `指示/.../docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md` |

---

---

## H. 移行ステータス（migration status）

> 最終更新: 2026-06-10 · **コミット前バッチ**

### H.1 完了

| 項目 | 状態 | 備考 |
|------|------|------|
| `libs/ihl/<domain>/` scaffold | ✅ | 9 ドメイン · README + `__init__.py` |
| フラット `libs/*.py` → domain move | ✅ | **32 モジュール**移動 |
| 後方互換 shim | ✅ | 各 `libs/<name>.py` → `from libs.ihl.<domain>.<name> import *` |
| `main.py` peel（部分） | ✅ | `observation.py` · `market.py` · `board.py`（計 3 route ファイル追加） |
| `main.py` 行数 | **~380L**（733L から削減） | 残: match · economy · dispute · legal · home 等 |
| component README | ✅ | 8 pipeline components |
| `docs/components/*/BOARD.md` | ✅ | 8 + 既存 `component-board` |
| `apps/web/src/features/README.md` | ✅ | #NN → route マッピング（ページ移動なし） |
| 設計パスリンク修正 | ✅ | CONTRIBUTING · ARCHITECTURE · libs/README 等 |

### H.2 Import shim 一覧

全 shim は **モジュールエイリアス**（`_new_id` 等のプライベート名も互換）:

```python
"""DEPRECATED shim — import from libs.ihl.<domain>.<module> instead."""
import sys
import libs.ihl.<domain>.<module> as _mod
sys.modules[__name__] = _mod
```

| ドメイン | shim 数 | モジュール |
|----------|---------|-----------|
| `core` | 5 | catalog, domain_catalog, event_store, r2_io, schema_validator |
| `observation` | 7 | embedding, faiss_index, image, measurement_template_catalog, query, scoring, solid_commit |
| `economy` | 2 | economy_logic, market_state |
| `env` | 5 | collector_ingest, device_registry, env_telemetry, placement_store, switchbot_client |
| `governance` | 3 | board_store, github_component_board, pii |
| `payments` | 6 | gmo_connector, gmo_connector_stub, gmo_reconciliation_store, gmo_transfer_code, gmo_webhook_client, gmo_webhook_security |
| `i18n` | 1 | i18n_catalog |
| `identity` | 2 | auth_session, preferences_store |
| `theme` | 1 | theme_pack |

**移行スクリプト**: `scripts/ihl-libs-domain-migrate.mjs`（再実行は idempotent · 既移動はスキップ）

### H.3 残作業（commit 時 / Phase 2+）

| 項目 | 優先 |
|------|------|
| `main.py` 残 route peel | economy · match · dispute · legal · home · builder · photo-analysis |
| `main.py` < 100 行 | Phase 2 完了条件 |
| component `manifest.yaml` | env_ingest 以外 7 件 |
| component 内 `tests/` colocate | 方針 B |
| `apps/web/src/features/<nn>/` 実移動 | P4 · 別 PR 推奨 |
| shim 削除 | 1 リリース deprecation 後 |

### H.4 検証

```bash
cd 指示/it-hercules-laboratory && docker compose --profile test run --rm test pytest -q
# 2026-06-10: 159 passed, 1 skipped
```

**付随修正**: `libs/ihl/paths.py`（`REPO_ROOT`）· `docker-compose.yml` schema マウント → `02-設計/_横断/schema/schemas`

*Phase 1–2 partial · 2026-06-10 · レイアウト正本 + migration status*
