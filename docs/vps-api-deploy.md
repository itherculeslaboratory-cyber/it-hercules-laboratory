# VPS API デプロイ — IHL FastAPI（ver3 · api.it-hercules.uk）

> **対象**: さくら VPS `civilization-api` · **153.127.20.38** · 512MB · Rocky Linux  
> **スコープ**: **API のみ**（`:8000`）— Next.js は Cloudflare Pages  
> **非エンジニア向け**: [ver3-あなたがやること.md](./ver3-あなたがやること.md)  
> **Express 時代の参考**: [`sakura-vps-rocky512-civilization-api-ja.md`](../../../docs/runbooks/sakura-vps-rocky512-civilization-api-ja.md)（ポート **3001→8000** に読み替え）

---

## ヘルスチェック

| 項目 | 値 |
|------|-----|
| **パス** | `GET /health` |
| **ローカル** | `curl -sS http://127.0.0.1:8000/health` |
| **公開** | `curl -sS https://api.it-hercules.uk/health` |
| **成功例** | `{"status":"ok","service":"ihl-api","version":"0.3.0"}` |
| **旧 Express** | `{"ok":true,"service":"Civilization OS Backend API"}` — 差し替え前 |

---

## 前提

- Docker Engine + Docker Compose v2 が VPS に入っていること
- GitHub から `it-hercules-laboratory` を clone できること（deploy key または PAT）
- `.env.platform` に **R2 本番キー**と **SMTP** を手元で用意（**Git にコミットしない**）
- 旧 Express（pm2 · `:3001`）は **FastAPI 起動確認後**に停止（二重起動禁止）

---

## 1. コード取得

```bash
sudo mkdir -p /opt/it-hercules-laboratory
sudo chown "$USER":"$USER" /opt/it-hercules-laboratory
cd /opt/it-hercules-laboratory
git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git .
```

（初回 push 前は開発者が tarball / rsync で渡す場合あり — [github-mirror-push.md](./github-mirror-push.md)）

---

## 2. 環境変数（`.env.platform`）

```bash
cp .env.platform.example .env.platform
chmod 600 .env.platform
nano .env.platform
```

**必須（本番 API）**

| 変数 | 例 / 説明 |
|------|-----------|
| `R2_ENDPOINT` | `https://a49c9c8e4765257a0b07a7ef82eba550.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Phase 1 で発行した Access Key |
| `R2_SECRET_ACCESS_KEY` | Secret（再表示不可） |
| `R2_BUCKET` | `it-hercules-laboratory-prod` |
| `IHL_AUTH_REQUIRED` | `1` |
| `IHL_CORS_ORIGINS` | `https://it-hercules.uk` |

**magic link メール（Express から引き継ぎ — 変数名は同一）**

| 変数 | 説明 |
|------|------|
| `SMTP_HOST` | 未設定ならメール送信なし（dev 相当） |
| `SMTP_PORT` | 既定 `587` |
| `SMTP_SECURE` | `true` または port `465` で SSL |
| `SMTP_USER` | SMTP ログイン |
| `SMTP_PASS` | SMTP パスワード（アプリパスワード等） |
| `MAIL_FROM` | 送信元表示 |
| `PUBLIC_APP_URL` | `https://it-hercules.uk`（メール内リンクのベース · 末尾 `/` なし） |
| `IHL_MAGIC_LINK_BASE_URL` | 任意 · 未設定時は `PUBLIC_APP_URL` を使用 |
| `MAGIC_LINK_MAIL_SUBJECT` | 任意 |

**本番で付けないもの**: `IHL_DEV_EXPOSE_MAGIC_TOKEN` · `IHL_R2_LOCAL_ROOT` · `IHL_AUTH_BYPASS`

---

## 3. Docker 起動（API のみ）

```bash
cd /opt/it-hercules-laboratory
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api
docker compose -f docker-compose.prod.yml logs -f api
```

起動ログに `Magic link メール: SMTP 有効` が出れば SMTP 読み込み OK。

```bash
curl -sS http://127.0.0.1:8000/health
```

---

## 4. nginx（3001 → 8000）

**観測 commit と CORS**: `POST /api/solid-observation/commit` は `photo_data_url`（base64）を含むため JSON が **1MB 超**になりやすい。nginx 既定 `client_max_body_size 1m` のままだと **413** が FastAPI を経由せず返り、ブラウザは **CORS エラー**（`No Access-Control-Allow-Origin`）に見える。テンプレ保存（`/api/v1/observation/templates`）は小さい JSON のため同症状が出にくい。

**観測写真表示（`IHL_AUTH_REQUIRED=1`）**: 詳細 JSON は `fetch` + `X-IHL-Session` で取得できるが、`<img src="https://api.it-hercules.uk/.../image">` は **カスタムヘッダーを送れない**ため **401 → 壊れた画像アイコン**。フロントは `AuthenticatedImage`（blob fetch）を使う。未認証 curl で image が 401 になるのは正常。

[`deploy/nginx/ihl-api.conf`](../deploy/nginx/ihl-api.conf) は **`client_max_body_size 25m`** と nginx 生成エラー向け CORS を含む。更新後:

```bash
sudo cp deploy/nginx/ihl-api.conf /etc/nginx/conf.d/ihl-api.conf
sudo nginx -t && sudo systemctl reload nginx
```

検証（1.5MB 超の POST が 413 ではなく FastAPI 422/401 になること · CORS ヘッダー付き）:

```bash
curl -sS -D - -o /dev/null -X POST "https://api.it-hercules.uk/api/solid-observation/commit" \
  -H "Origin: https://it-hercules.uk" -H "Content-Type: application/json" \
  --data-binary @<(python3 -c "import json; print(json.dumps({'species':'x','rows':[{'item':'a','value':'1'}],'photo_data_url':'data:image/png;base64,'+'A'*1500000}))")
# 期待: 401 または 422 + access-control-allow-origin: https://it-hercules.uk（413 ではない）
```

既存 `civ-api.conf` 等がある場合は `proxy_pass` のみ変更:

```diff
-        proxy_pass http://127.0.0.1:3001;
+        proxy_pass http://127.0.0.1:8000;
```

新規または参考: [`deploy/nginx/ihl-api.conf`](../deploy/nginx/ihl-api.conf)

```bash
sudo cp deploy/nginx/ihl-api.conf /etc/nginx/conf.d/ihl-api.conf
# 既存 server_name ブロックと重複しないよう調整
sudo nginx -t && sudo systemctl reload nginx
curl -sS https://api.it-hercules.uk/health
```

`service":"ihl-api"` が返れば差し替え成功の目安。

---

## 5. 旧 Express 停止

```bash
pm2 list
pm2 stop civ-api    # 名前は環境により civ-api 等
pm2 save
```

**注意**: `civilization-world` R2 バケットは旧 Express 用。IHL 本番は `it-hercules-laboratory-prod` のみ。

---

## 6. スモーク（Phase 3 完了チェック）

```bash
curl -sS https://api.it-hercules.uk/health
curl -sS -o /dev/null -w "%{http_code}\n" https://api.it-hercules.uk/api/v1/observation/search
# IHL_AUTH_REQUIRED=1 なら未認証 401 が期待値
```

---

## 関連

- [ver3-deploy-runbook.md](./ver3-deploy-runbook.md)
- [github-mirror-push.md](./github-mirror-push.md)
- [`.env.platform.example`](../.env.platform.example)
