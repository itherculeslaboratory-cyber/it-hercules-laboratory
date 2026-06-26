# CivilizationOS local SwitchBot collector

Legacy Node collector for SwitchBot polling and signed ingest to civ-os backend.
IHL uses the same SwitchBot HMAC contract in `libs/switchbot_client.py` and Ed25519 ingest in `libs/collector_ingest.py` (`POST /api/env/ingest` on IHL API :8000).

## Env file (gitignored)

| Path | Used by |
|------|---------|
| `../.env.platform` | platform/infra（原則ユーザーは編集しない） |
| `../.env.local` | **Canonical**: collector 設定（ユーザー編集） |
| `../.env` | 互換 fallback（非推奨） |
| `collector/.env` | Deprecated fallback only (legacy local setup) |

Copy templates and set variable **names** (never commit values):

- `copy ..\.env.platform.example ..\.env.platform`
- `copy ..\.env.local.example ..\.env.local`

- `SWITCHBOT_TOKEN`, `SWITCHBOT_SECRET` — **必須**（SwitchBot Open API）
- `SWITCHBOT_DEVICE_IDS` — **任意**。未設定なら `GET /v1.1/devices` から温湿度系（Meter / Hub 2 / Outdoor / CO2 等）を自動選別してポーリング
- `ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64` — **ingest 送信に必須**（Ed25519 秘密鍵 PEM を base64 1 行）
- `CIV_INGEST_URL` — civ-os: `http://host.docker.internal:3001/api/env/collector/ingest`（Express は **:3001**）; IHL: `http://host.docker.internal:8000/api/env/ingest`
- `CIV_USER_ID`, `CIV_COLLECTOR_ID`

### Ed25519（collector 署名 ↔ API 検証）

| 鍵 | 置き場 | 必須タイミング |
|----|--------|----------------|
| **秘密鍵** (`ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64`) | `../.env.local` | ingest POST するたび |
| **公開鍵** (`ENV_COLLECTOR_PUBLIC_KEY` または `ENV_COLLECTOR_PUBLIC_KEYS_JSON`) | `../.env.local` | API が署名を検証するとき |

ingest 先は `CIV_INGEST_URL` で切り替える。IHL API 利用時は `http://host.docker.internal:8000/api/env/ingest` を指定。ingest ヘッダは `X-IHL-Collector-*`（Ed25519 署名）。

**鍵の生成（コピペミス防止・推奨）**

IHL ルートで次を実行すると、Ed25519 秘密鍵（PKCS#8 PEM の base64 1 行）を `../.env.local` に書き込み、公開鍵 sync まで行う。**鍵値はログに出さない。**

```powershell
node collector/generate-ed25519-key.mjs
```

`ED25519_SMOKE=FAIL` や `DECODER routines::unsupported`（base64 が PEM ではない・9 bytes 等）が出たら、上記を再実行する。

**公開鍵の配布（手動 secret 設定後）**

1. `../.env.local` に `ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64` を設定（Ed25519 秘密 PEM を base64 1 行）
2. リポジトリ root で次を実行:

```powershell
node collector/sync-public-key-from-collector.mjs
```

秘密鍵から公開鍵 PEM を導出し、`../.env.local`（無ければ `.env.local.example` から作成）へ `ENV_COLLECTOR_PUBLIC_KEY` を書き込む。**鍵値はログに出さない。**

`node collector/smoke-keys.cjs` は **運用必須ではなくローカル検証用**。`../.env.platform` → `../.env.local`（または legacy fallback）を順に読み、秘密鍵があると **先に sync を自動実行**し、SwitchBot 一覧・status・Ed25519 roundtrip を秘密値なしで PASS/FAIL 表示する。

## Smoke (no secrets in output)

From IHL root, after `ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64` is set in `../.env.local`:

```powershell
node collector/smoke-keys.cjs
```

（sync だけ先に走らせる場合: `node collector/sync-public-key-from-collector.mjs`）

Reports only: which env **paths exist**, which **variable names** are set (yes/no), and `SWITCHBOT_LIST` / `SWITCHBOT_STATUS` / `ED25519_*` pass or fail.

## Run collector (Docker)

```powershell
docker compose --profile collector up collector
```

Health: `http://127.0.0.1:8787` (see `switchbot-local-collector.mjs`).

## IHL contract tests (no live API)

```powershell
cd 指示/it-hercules-laboratory
docker compose --profile test run --rm test pytest -q tests/unit/test_switchbot_client.py tests/contract/test_collector_ingest.py
```
