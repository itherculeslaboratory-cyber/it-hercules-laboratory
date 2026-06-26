# IHL ver3 本番デプロイ Runbook

> **ステータス**: **ハイブリッド確定**（2026-06-26）— CF Pages + Sakura VPS 512MB API-only · 実デプロイは **人間ゲート**（秘密情報・DNS）  
> **正本**: [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §3 · §8.1 B1/B2/B3/B7  
> **非エンジニア向け**: [**ver3-あなたがやること.md**](./ver3-あなたがやること.md)（さくらパネル確認 · Phase 0〜6 チェックリスト）  
> **開発対比**: [`.dev` runbook](./dev-runbook.md)（ver2 hybrid · ローカル）  
> **Git remote（確定）**: `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git`  
> **legacy archive**: `https://github.com/itherculeslaboratory-cyber/civilization-os`（参照・salvage のみ）

## リポジトリと作業ツリー（2026-06-26 時点）

| 項目 | 状態 |
|------|------|
| **正本 repo（方針）** | `itherculeslaboratory-cyber/it-hercules-laboratory` |
| **実コードの現在地** | **Strategy B** — `civilization-os/指示/it-hercules-laboratory/` にネスト（モノレポ内） |
| **CI** | civ-os `.github/workflows/ihl-*.yml`（path: `指示/it-hercules-laboratory/**`） |
| **ver3 デプロイ前の必須作業** | 新 repo へ push / mirror · IHL 専用 CI ワークフロー · ルートパスからの `docker compose` / `apps/web` ビルド |

> **注意**: ローカル `civilization-os` の `git remote` がまだ legacy の場合、ver3 デプロイは **新 repo を clone した作業ツリー**で行う（下記 §インフラ選択）。

## ver3 公開の定義（要約）

| 項目 | ver2（`.dev`） | ver3（本番） |
|------|----------------|--------------|
| ホスティング | ローカル hybrid | **CF Pages（Web）+ Sakura VPS 512MB（API）**（§8.1 **B1=A** · ハイブリッド脚注） |
| ドメイン | `localhost:3000` | **it-hercules.uk**（§8.1 **B7=B** · 現行プロトタイプ置換） |
| 認証 | magic link（dev token） | **メール + magic link** · **オープン登録**（§8.1 **B2=B** · **B3=A**） |
| R2 | `.ihl-local-r2` / dev バケット | **本番 R2 バケット**（§8.1 **C2=A**） |
| データ移行 | — | **不要**（§8.1 **C3=B** · 空または意図的 seed のみ） |

---

## アーキテクチャ（確定 · 2026-06-26）

```text
[Browser] ──HTTPS──► it-hercules.uk (Cloudflare Pages · Next.js)
                           │
                           │ /api/* rewrite ──► api.it-hercules.uk
                           ▼
              Sakura VPS 512MB — API のみ（Docker api · uvicorn）
                           │
                           ▼
              Cloudflare R2 (it-hercules-laboratory-prod)
                           │
              Truth events (events/*.jsonl)
```

| レイヤ | 技術 | 備考 |
|--------|------|------|
| Web | Next.js · **Cloudflare Pages** | `apps/web` · `IHL_API_URL=https://api.it-hercules.uk` |
| API | FastAPI · **Sakura VPS 512MB** · Docker `api` のみ | `api.it-hercules.uk` · **Web コンテナは載せない** |
| 永続化 | Cloudflare R2（S3 互換） | VPS 上に blob 永続化しない · `IHL_R2_LOCAL_ROOT` **未設定** |
| 認証 | opaque `session_token` + magic link | `libs/ihl/identity/auth_session.py` · 本番メール送信は別 ADR |
| DNS | CF 管理 | `it-hercules.uk` → Pages · `api.it-hercules.uk` → VPS（CF プロキシ ON 推奨） |

> **it-hercules.uk プロトタイプ**: リポジトリ内に旧実装の参照は **設計 doc のみ**（§8.1 B2/B7）。ver3 は **本 IHL モノレポ**で置換する。

### Sakura VPS 512MB 制約

| 制約 | 方針 |
|------|------|
| **RAM 512MB** | **API 単体**のみ（`docker compose` の `api` サービス 1 本 · `--reload` 禁止） |
| **Web 非載せ** | Next.js は Pages のみ — VPS で `:3000` を立てない |
| **ワーカー / 常駐 poll** | **禁止**（SwitchBot ADR-H-30 同様 · 512MB に余力なし） |
| **スワップ** | 本番では **想定しない** — uvicorn workers は **1** |
| **ディスク** | R2 オフロード前提 · ローカルはログ + Docker レイヤのみ |
| **HTTPS** | CF プロキシ終端 or VPS 前段 nginx — **秘密は Dashboard / VPS env のみ**（本 runbook に書かない） |

---

## インフラ選択（§8.1 B1=A · ハイブリッド確定 · 2026-06-26）

| レイヤ | 採用 | 理由 |
|--------|------|------|
| Web | **Cloudflare Pages** | §8.1 B1=A · CDN · 自動 HTTPS |
| API | **Sakura VPS 512MB** · `api.it-hercules.uk` | 現行 FastAPI/uvicorn を **移植なし**で載せる · CF の API フック |
| ストレージ | **Cloudflare R2**（本番バケット） | 設計固定 · VPS ローカル永続化は使わない |
| ドメイン | **it-hercules.uk** + **api.it-hercules.uk** | §8.1 B7=B · 旧プロトタイプ login を ver3 IHL に置換 |

**不採用（ver3）**: CF Containers 単独 · Workers 全面（FastAPI 移植）· VPS 単一サーバーで Web+API 同居（512MB 不足）。

### 参考: Sakura VPS 単一サーバー（Web+API · 未採用）

§8.1 を変更しない限り **正式プランではない**が、技術的には次で動く:

```text
[Browser] ──HTTPS──► it-hercules.uk (nginx)
                         ├─ /        → Next.js :3000 (Docker web)
                         └─ /api/*   → FastAPI :8000 (Docker api)
                                    └─► Cloudflare R2（S3 API · リモート）
```

| 項目 | VPS 単一サーバー |
|------|------------------|
| 構成 | `docker compose --profile web`（本番用: `--reload` 無効 · `IHL_DEV_*` 未設定） |
| リバースプロキシ | nginx + Let's Encrypt（または CF DNS プロキシ ON で VPS 直前のみ SSL） |
| メリット | 既存 `Dockerfile` / `docker-compose.yml` をほぼ流用 · デバッグ容易 |
| デメリット | §8.1 ロックと不一致 · スケール・CDN・ゼロダウン deploy は自前 · `/costs` の Sakura 行は「実際に使っている」前提と整合 |

**SwitchBot（ADR-H-30）**: VPS / CF / Workers **いずれを選んでも**、本番サーバでの server-side poll は **禁止**。collector は **ユーザー PC**（`collector/switchbot-local-collector.mjs`）のまま。

### システム切替で変わるもの（共通）

| 領域 | ver2（`.dev`） | ver3 本番 |
|------|----------------|-----------|
| **GitHub** | civ-os ネスト or 新 repo 未 push | `it-hercules-laboratory` をデプロイ元に |
| **環境変数** | `IHL_R2_LOCAL_ROOT` · dev token 露出 | `R2_*` 本番 · `IHL_AUTH_REQUIRED=1` · dev フラグ **全 OFF** |
| **R2** | dev バケット / ローカル | `it-hercules-laboratory-prod`（新設 · C3=B 移行不要） |
| **DNS** | localhost | `it-hercules.uk` → Pages · `api.it-hercules.uk` → VPS |
| **認証** | dev token ボタン | magic link メール（SMTP/Resend 等 · 人間ゲート） |
| **CORS** | 未設定可 | `IHL_CORS_ORIGINS=https://it-hercules.uk` |
| **旧プロトタイプ** | 別系統で稼働中 | DNS cutover · `/login` オープン登録に置換 |

### デプロイ自動化チェックリスト（未整備 · 作成候補）

| 方式 | 必要なもの | 現状 |
|------|------------|------|
| **CF Pages** | GitHub 連携 · `apps/web` · `@cloudflare/next-on-pages` | Build output **`.vercel/output/static`** · `npm run pages:build` |
| **CF API hook** | `IHL_API_URL=https://api.it-hercules.uk` · VPS に `api` のみ deploy | runbook 確定 · **秘密注入は人間ゲート** |
| **GitHub Actions** | 新 repo `.github/workflows/` — pytest · Playwright · deploy | civ-os 側に **テストのみ** 3 本 |
| **VPS** | `docker compose -f docker-compose.prod.yml` · nginx · pm2 Express 停止 | [vps-api-deploy.md](./vps-api-deploy.md) · `deploy/nginx/ihl-api.conf` |

---

## 環境変数一覧

### 本番 API（必須）

| 変数 | 例 / 説明 | 秘密 |
|------|-----------|------|
| `R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` | はい |
| `R2_ACCESS_KEY_ID` | R2 オブジェクト read/write 用 | はい |
| `R2_SECRET_ACCESS_KEY` | 同上 | はい |
| `R2_BUCKET` / `R2_IHL_BUCKET` | `it-hercules-laboratory-prod`（新設 · dev と分離） | いいえ |
| `IHL_AUTH_REQUIRED` | `1` — 観測 API にセッション必須 | いいえ |
| `IHL_AUTH_BYPASS` | **本番では未設定** | いいえ |
| `IHL_CORS_ORIGINS` | `https://it-hercules.uk`（必要なら preview オリジンを追加） | いいえ |
| `IHL_EVENT_ROOT` | R2 上の Truth プレフィックスまたはマウント | 設定による |

### 本番 API（認証 · メール）

| 変数 | 例 / 説明 | 備考 |
|------|-----------|------|
| `IHL_DEV_EXPOSE_MAGIC_TOKEN` | **未設定**（本番禁止） | dev/CI のみ `1` |
| `IHL_MAGIC_LINK_BASE_URL` | `https://it-hercules.uk` | magic link URL 生成（未設定時は `PUBLIC_APP_URL`） |
| `SMTP_*` · `MAIL_FROM` · `PUBLIC_APP_URL` | Express と同名 | [`libs/ihl/identity/magic_link_mail.py`](../libs/ihl/identity/magic_link_mail.py) · [vps-api-deploy.md](./vps-api-deploy.md) |

### 本番 Web（Pages）

| 変数 | 例 / 説明 |
|------|-----------|
| `IHL_API_URL` | `https://api.it-hercules.uk`（Pages rewrite 先） |
| `NODE_VERSION` | `20`（Pages ビルド Node） |
| `IHL_WEB_AUTH_BYPASS` | **未設定**（本番では middleware 認証 ON） |

### ローカル開発（ver2 互換 · 変更なし）

| 変数 | 既定 | 用途 |
|------|------|------|
| `IHL_DEV_EXPOSE_MAGIC_TOKEN` | `1` | ログイン dev token ボタン |
| `IHL_AUTH_REQUIRED` | 未設定（= OFF） | API 観測ルートは無認証可 |
| `IHL_AUTH_BYPASS` | 未設定 | `1` で API 認証強制を無効化 |
| `IHL_WEB_AUTH_BYPASS` | 未設定 | `1` で Next middleware 認証スキップ |
| `IHL_R2_LOCAL_ROOT` | `.ihl-local-r2` | ローカル R2 相当 |

テンプレ: [`.env.platform.example`](../.env.platform.example) · [`.env.local.example`](../.env.local.example)

---

## R2 本番バケット

| 項目 | 方針 |
|------|------|
| バケット名（案） | `it-hercules-laboratory-prod` |
| 作成手段 | Cloudflare API + `CF_API_TOKEN`（[ADR-H-03](../02-設計/_横断/adr/ADR-H-03-r2-bucket-dedicated.md) 同型） |
| dev バケット | `it-hercules-laboratory-dev` — **そのまま維持** |
| データ移行 | **不要**（§8.1 **C3=B**）— 本番は空から開始 |
| ローカル切替 | `IHL_R2_LOCAL_ROOT` を **削除**し `R2_*` を設定 |

---

## 認証フロー（ver3 基盤 · 実装済み）

1. `POST /api/v1/auth/magic-link` — メール入力 · 監査イベント追記  
2. （本番）メールに `https://it-hercules.uk/login?token=...` — **メール送信は人間ゲート後**  
3. `POST /api/v1/auth/verify` — `session_token` 発行  
4. Web: `ihl_session_token` cookie 保存 · API 呼び出しに `X-IHL-Session` ヘッダ  
5. `GET /api/v1/auth/session` — セッション有効性確認  
6. 観測 API: `IHL_AUTH_REQUIRED=1` 時は無セッション **401 `AUTH_REQUIRED`**

オープン登録（B2=B）: `/register` でハンドル登録（現行 stub）→ magic link で同一 actor に紐付けは **次バッチ**。

---

## デプロイ手順（ドラフト · 未実行）

> **スコープ外（本バッチ）**: 実際の `wrangler` / Pages デプロイはユーザー秘密情報が必要。

### 1. 前提チェック

- [ ] Cloudflare アカウント · `CF_API_TOKEN`（R2 + Pages スコープ）
- [x] 本番 R2 バケット作成 · read/write キー発行（バケット `it-hercules-laboratory-prod` · 2026-06-26）
- [ ] `it-hercules.uk` DNS が Cloudflare 管理下
- [ ] メール送信（magic link）方式の ADR 確定

### 2. API ビルド・デプロイ（Sakura VPS · api のみ）

```powershell
# 新 repo ルート（推奨）または civ-os ネスト（移行中）
git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git
cd it-hercules-laboratory
docker compose build api
# VPS へ api イメージのみ配置 · compose は api サービス単体 · :8000
# DNS: api.it-hercules.uk → VPS（CF プロキシ ON 推奨）
```

環境変数は **`.env.platform` をコミットせず**、VPS env / CF Dashboard に注入（**本 runbook に秘密を書かない**）。

### 3. Web（Pages）デプロイ

**Cloudflare Dashboard（推奨）**

| 設定 | 値 |
|------|-----|
| Root directory | `apps/web` |
| Build command | `npm ci && npm run pages:build` |
| Build output directory | **`.vercel/output/static`** |
| Production env | `IHL_API_URL=https://api.it-hercules.uk` · `NODE_VERSION=20` |

**ローカル検証**

```powershell
cd apps\web
npm ci
npm run pages:build
# 出力: .vercel/output/static （25 MiB 超ファイルが無いこと）
```

`next.config.ts` の `/api/*` rewrite が `IHL_API_URL` を指すことを確認。

### 4. 本番スモーク（V3-1 〜 V3-3 向け）

| # | 確認 |
|---|------|
| 1 | `https://api.it-hercules.uk/health` → 200 · Pages 経由 `/api/*` も 200 |
| 2 | `/login` → magic link（本番はメール受信） |
| 3 | `/observation` 検索 · 詳細 · 画像 |
| 4 | 観測 commit → 本番 R2 に blob 存在 |
| 5 | 未認証で観測 API → 401（`IHL_AUTH_REQUIRED=1`） |

---

## 人間ゲート（本バッチ後）

| ゲート | 内容 |
|--------|------|
| **CF 秘密情報** | `R2_*` · `CF_API_TOKEN` · DNS（`it-hercules.uk` · `api.it-hercules.uk`）· Pages プロジェクト · VPS env |
| **メール送信** | SMTP / Resend / CF Email — magic link 本番配信 |
| **it-hercules.uk cutover** | 旧プロトタイプからの DNS 切替 · ユーザー告知 |
| **Tier D** | 公開導線手打鍵（V3-6） |
| **GMO** | スコープ外（ver4+） |

---

## 関連ドキュメント

- [**ver3-あなたがやること.md**](./ver3-あなたがやること.md) — オーナー向け · さくらパネル · CF · 週次チェックリスト
- [vps-api-deploy.md](./vps-api-deploy.md) — Sakura VPS · Docker prod · nginx · health
- [github-mirror-push.md](./github-mirror-push.md) — 新 repo 初回 push
- [dev-runbook.md](./dev-runbook.md) — ver2 `.dev`
- [runbooks/local-dev-docker.md](./runbooks/local-dev-docker.md)
- [runbooks/secrets-rotation-playbook.md](../05-運用/runbooks/secrets-rotation-playbook.md)
- [01-ログイン 詳細設計-v2.md](../02-設計/features/01-ログイン/詳細設計-v2.md)
- [ADR-H-30 SwitchBot 秘密非保持](../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)
- [README.md](../README.md) — repo 正本 · legacy 関係
