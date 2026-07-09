# IHL `.dev` 開発 Runbook（ver2 hybrid）

> **正本**: [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §2.3 · REQ **OBS-RX-DEV-01**  
> **手動検証**: [`ver2-verification-checklist.md`](./ver2-verification-checklist.md)

## `.dev` とは

| 項目 | 定義 |
|------|------|
| 名称 | **ローカル hybrid**（チーム共通の ver2 検証環境） |
| API | FastAPI **`:8000`**（既定: Docker `api` サービス） |
| Web | Next.js **`:3000`**（既定: ホスト `npm run dev` · hot reload） |
| データ | **`.ihl-local-r2`**（ローカル R2 相当）+ Truth イベント |
| 対象外 | 本番ドメイン · staging URL · Tier D 全 path 手打鍵 |

ver2 DONE の機械検証は **この定義のみ**を対象とする（§8.1 **C1=A**）。

---

## クイック起動

### ワンクリック（推奨）

```powershell
# civ-os ルート
.\scripts\dev-up.bat

# または IHL ルート
cd 指示\it-hercules-laboratory
.\dev-up.cmd
```

ブラウザ自動起動: `.\scripts\dev-up.ps1 -OpenBrowser`

### 手動（トラブル時）

```powershell
cd 指示\it-hercules-laboratory

# 1) API（Docker）
docker compose up api

# 2) Web（別ターミナル）
cd apps\web
npm install   # 初回のみ
npm run dev
```

### 起動確認

| # | URL | 期待 |
|---|-----|------|
| 1 | http://localhost:8000/health | `200` |
| 2 | http://localhost:3000 | ホーム表示 |
| 3 | http://localhost:3000/observation | 観測検索グリッド |

---

## ポート・環境変数

| 変数 | 既定 | 用途 |
|------|------|------|
| `IHL_API_URL` | `http://localhost:8000` | Next.js → API プロキシ（`next.config.ts` rewrites） |
| `IHL_DEV_EXPOSE_MAGIC_TOKEN` | `1`（dev のみ） | ログイン画面の dev token ボタン |
| `IHL_AUTH_REQUIRED` | 未設定（OFF） | `1` で観測 API にセッション必須（本番） |
| `IHL_AUTH_BYPASS` | 未設定 | `1` で API 認証強制を無効化 |
| `IHL_WEB_AUTH_BYPASS` | 未設定 | `1` で Next middleware 認証スキップ |
| `IHL_CORS_ORIGINS` | — | 本番 Web オリジン（カンマ区切り） |
| `IHL_R2_LOCAL_ROOT` | `.ihl-local-r2` | commit 写真 blob · parquet |
| `IHL_EVENT_ROOT` | `.ihl-local-truth` | Truth イベント JSON |

全 Docker モード: `.\scripts\dev-up.ps1 -Mode docker`（API + Web ともコンテナ）。

---

## ver2 代表 path（手動 UAT 用）

1. **検索** — http://localhost:3000/observation  
2. **詳細** — http://localhost:3000/observation/{capture_id}  
3. **manifest** — 詳細の `reanalysis-manifest` リンク、または  
   `http://localhost:8000/api/v1/observation/{capture_id}/reanalysis-manifest`

### dev で「空」が正常なケース

| UI | dev で空になりうる理由 | 期待表示 |
|----|------------------------|----------|
| **類似個体** | `embedding_locator` 未構築（#18 パイプライン未実行） | 「類似候補がありません」 |
| **写真** | commit 時に `photo_data_url` 未保存の旧データ | 「写真なし（commit時未保存）」 |
| **manifest** | capture は存在 · digest は新規 commit から | JSON 200 · 旧 capture は `clientContentDigest: null` の可能性 |

### C2 用テストデータ（20+ 行）

```powershell
cd 指示\it-hercules-laboratory
python scripts/seed-ver2-many-measurements.py
# C4 写真あり: --with-photo
```

表示名 `ver2-UAT-20rows` · 22 計測行。出力 `capture_id` を [`ver2-human-signoff.md`](./ver2-human-signoff.md) に記入。

---

## 機械検証（Tier B）

```powershell
cd 指示\it-hercules-laboratory

# API 単体（詳細 · manifest · digest）
pytest tests/unit/test_observation_detail.py -q

# Playwright Tier B（search → detail → manifest）
npm install
npx playwright install chromium
npm run test:e2e:ver2
```

Playwright は **API :8000 + Web :3000** を自動起動する（既存サーバーがあれば `reuseExistingServer`）。

---

## PostHog（dev トライアル）

ローカル開発でのユーザー行動計装のトライアル導入。**既定は完全無効（no-op）**。

| 項目 | 内容 |
|------|------|
| 有効化条件 | `apps/web/.env.local` に `NEXT_PUBLIC_POSTHOG_KEY` を設定した場合のみ |
| env 変数 | `NEXT_PUBLIC_POSTHOG_KEY`（client 用 publishable key）· `NEXT_PUBLIC_POSTHOG_HOST`（省略時 `https://us.i.posthog.com`） |
| 実装箇所 | [`src/lib/posthog-init.ts`](../apps/web/src/lib/posthog-init.ts)（初期化本体）· [`src/components/analytics/posthog-provider.tsx`](../apps/web/src/components/analytics/posthog-provider.tsx)（`app/layout.tsx` にマウントする client component） |
| person profile | `person_profiles: 'identified_only'`（匿名 profile を作らずコスト最小） |
| DNT | `respect_dnt: true` |

**無効化方法**: `apps/web/.env.local` から `NEXT_PUBLIC_POSTHOG_KEY` を削除（またはファイル自体を削除）するだけ。再起動で即座に no-op に戻る。

**no-op が保証される条件**（`initPostHog()` 内のガード。詳細はコード参照）:

1. `NEXT_PUBLIC_POSTHOG_KEY` が未設定 → **フォーク・キー無し環境では外部通信ゼロ**
2. `navigator.webdriver === true` → Playwright 等の e2e 実行時は送信しない

`apps/web/.env.local` は `.gitignore` 対象（リポジトリにキーはコミットしない）。変数名のプレースホルダは [`apps/web/.env.example`](../apps/web/.env.example) を参照。

> `phc_` キーは PostHog の「client 用 publishable key」であり秘匿情報ではないが、本 repo では env 注入方式（`.env.local` 経由）で管理し、コミット対象ファイルには書かない運用とする。

本番導入（ダッシュボード運用・イベント設計・保持期間など）は本トライアルの対象外。別途人間判断で決定する。

---

## 停止

- hybrid: `dev-up` 起動ターミナルで **Ctrl+C**（API コンテナも停止）
- 手動 Docker: `docker compose down`

---

## 参照

- [`IMPLEMENTATION.md`](../IMPLEMENTATION.md) — Phase 2 Web 概要
- [`docs/runbooks/local-dev-docker.md`](./runbooks/local-dev-docker.md) — Phase 1 Streamlit / pytest Docker
- [`05-運用/manual/IHL-画面打鍵手順書-v1.md`](../05-運用/manual/IHL-画面打鍵手順書-v1.md) — 打鍵手順
