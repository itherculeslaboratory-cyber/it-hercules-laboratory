# libs/ — IHL 共有ライブラリ（#00 土台）

> **正本**: [`指示/it-hercules-laboratory/02-設計/_横断/schema/`](../02-設計/_横断/schema/) · [`01-要件/00-土台-MiniKernel-C-USB-コンポーネント.md`](../01-要件/00-土台-MiniKernel-C-USB-コンポーネント.md)  
> **レイアウト**: [`docs/design/OSS-REPO-LAYOUT-v1.md`](../docs/design/OSS-REPO-LAYOUT-v1.md)

## 役割

`libs/` は IHL アプリ（`apps/api` · `components/*`）が共有する **Python ドメイン層**である。新規コードは `libs/ihl/<domain>/` に配置する。ルートの `libs/<name>.py` は **後方互換 shim**（`from libs.ihl.<domain>.<name> import *`）。

### ドメイン索引（`libs/ihl/`）

| ドメイン | 主モジュール |
|----------|-------------|
| `core/` | `event_store` · `r2_io` · `schema_validator` · `catalog` |
| `observation/` | `query` · `scoring` · `embedding` · `solid_commit` |
| `economy/` | `economy_logic` · `market_state` |
| `env/` | `switchbot_client` · `placement_store` · `collector_ingest` |
| `governance/` | `board_store` · `github_component_board` · `pii` |
| `payments/` | `gmo_connector` · `gmo_*` |
| `i18n/` | `i18n_catalog` |
| `identity/` | `auth_session` · `preferences_store` |
| `theme/` | `theme_pack` |

### よく使う shim（互換）

| shim | 用途 |
|------|------|
| `event_store.py` | Truth イベント JSONL 書込 · schema 検証 · immutability |
| `schema_validator.py` | YAML schema-pack 読込 · `enum_ref` 解決 · jsonschema 検証 |
| `auth_session.py` | #01 magic link · session（非 R2） |
| `pii.py` | actor ハッシュ · PII 境界 |
| `gmo_connector.py` | #23 tier 切替（stub/stg/live）· env 契約 |

## スキーマ解決

`default_schemas_root()` は次の順で `schemas/` を解決する:

1. 環境変数 `IHL_SCHEMAS_ROOT`
2. `02-設計/_横断/schema/`（junction）
3. `指示/02-設計/_横断/schema/`（monorepo フォールバック）

Docker Compose テストプロファイルは `/schemas` ボリュームマウントを使用する（`docker-compose.yml` · `IHL_SCHEMAS_ROOT=/schemas`）。

## テスト

- `tests/unit/test_event_store.py` — event writers · immutability
- `tests/contract/test_schema_validator.py` — schema-pack contract
- `tests/unit/test_schema_registry.py` — registry helpers
