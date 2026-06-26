# IHL ローカル開発 — Docker

Phase 1 実装リポ（`it-hercules-laboratory/`）を **Python 3.11 手動インストールなし**で起動する手順。

設計正本: `指示/it-hercules-laboratory/` · OSS 選定: `02-設計/_横断/adr/ADR-Phase1-OSS選定表.md`

## 前提

| 項目 | 内容 |
|------|------|
| 必須ソフト | **Docker Desktop** のみ（Compose v2 同梱） |
| 不要 | ホスト側 Python 3.11 / venv |
| 秘密情報 | イメージに含めない。`.env.platform` / `.env.local` は `env_file` のみ |

## 初回セットアップ

1. Docker Desktop を起動する。
2. （任意）R2 / GMO / collector 接続時は設計フォルダで env を用意する。

   ```powershell
   cd d:\Programs\civilization-os\指示\it-hercules-laboratory
   copy .env.platform.example .env.platform
   copy .env.local.example .env.local
   # .env.platform は管理者向け、.env.local はユーザー向け（秘密をコミットしない）
   ```

3. イメージをビルドする。

   ```powershell
   cd d:\Programs\civilization-os\it-hercules-laboratory
   docker compose build
   ```

## 起動（検索 UI · Streamlit 8501）

```powershell
cd d:\Programs\civilization-os\it-hercules-laboratory
docker compose up search
```

ブラウザ: http://localhost:8501

PowerShell ショートカット:

```powershell
.\scripts\docker-dev.ps1 up
```

## テスト（pytest · dev 依存込み）

```powershell
docker compose --profile test run --rm test
# または
.\scripts\docker-dev.ps1 test
```

## schemas / junction について

| 環境 | 挙動 |
|------|------|
| Windows ホスト + junction `it-hercules-laboratory/schemas` | ネイティブ Python では junction 可 |
| Docker（Linux VM） | junction はコンテナに伝播しない |

Compose では設計ツリーを **read-only マウント**し、環境変数で正本を指す:

- ホスト: `schemas`
- コンテナ: `/schemas`
- `IHL_SCHEMAS_ROOT=/schemas`

`libs/schema_validator.py` の `default_schemas_root()` と整合。

## 含まれる Phase 1 依存（pyproject.toml）

`streamlit` · `duckdb` · `polars` · `pydantic` · `jsonschema` · `boto3` · `pyyaml` · `pillow` · `numpy` · `pytest`（dev）

**含めない（最小イメージ）**: `torch` · OpenCV — DINOv2 本番 backend は別 profile / 将来イメージ。CI は `libs/embedding.py` の dummy backend。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| **`dockerDesktopLinuxEngine` / `pipe` が見つからない**（例: `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`） | **Docker Desktop が起動していない**（プロジェクトのバグではない）。① Windows メニューから **Docker Desktop** を起動 ② タスクトレイのアイコンが **緑（Running）** になるまで待つ（初回は 1〜2 分）③ **Settings → General → Use the WSL 2 based engine** を有効（推奨）④ まだ失敗する場合は Docker Desktop を **Restart** し、`docker version` が Client/Server 両方応答するか確認 |
| `Cannot connect to the Docker daemon` | 上記と同様。Desktop 起動後に PowerShell を**開き直す**。 |
| `schemas not found` | `指示/it-hercules-laboratory/schemas` が存在するか確認。Compose を `it-hercules-laboratory/` から実行しているか確認。 |
| 8501 が使用中 | `docker compose down` 後、他プロセスの 8501 を解放。 |
| `.env.platform` / `.env.local` 未作成 | 問題なし（`env_file` は `required: false`）。必要な接続時のみ作成。 |
| コード変更が反映されない | `search` は `.:/app` をマウント。Streamlit は多くの場合自動リロード。反映されない場合はコンテナ再起動。 |
| Docker 未起動で pytest したい | ホストに Python 3.11+ がある場合: `cd 指示/it-hercules-laboratory` → `pip install -e ".[dev]"` → `IHL_SCHEMAS_ROOT=./02-設計/_横断/schema/schemas pytest`。無い場合は **GitHub `IHL Python CI` を正**とする。 |

## 参照

- [`docs/dev-runbook.md`](../dev-runbook.md) — **ver2 `.dev` hybrid**（API :8000 + Next :3000 · `dev-up`）
- `it-hercules-laboratory/README.md` — Docker クイックスタート
- `指示/it-hercules-laboratory/.env.platform.example` — 基盤 env プレースホルダ
- `指示/it-hercules-laboratory/.env.local.example` — ユーザー env プレースホルダ
