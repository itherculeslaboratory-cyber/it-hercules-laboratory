# ver3 本番デプロイ — あなたがやること（非エンジニア向け）

> **誰向け**: インフラに詳しくないオーナー・運用担当  
> **技術の正本**: [ver3-deploy-runbook.md](./ver3-deploy-runbook.md)  
> **エージェントはさくらのコントロールパネルにログインできません**。VPS の中身は **あなた** がパネルまたは SSH で確認します。

---

## 理想の構成（1図・3行で）

```text
[ブラウザ] ──HTTPS──► it-hercules.uk（Cloudflare Pages · 画面だけ）
                           │ /api/* は裏で転送
                           ▼
              api.it-hercules.uk（さくら VPS 512MB · API だけ）
                           │
                           ▼
              Cloudflare R2（データの倉庫 · it-hercules-laboratory-prod）
```

1. **画面（Next.js）** は Cloudflare Pages が配信する。VPS には載せない。  
2. **API（FastAPI）** だけがさくら VPS（512MB）で動く。今の Express（Node）から差し替える。  
3. **写真・観測データ** は VPS のディスクではなく **R2** に置く。DINOv2 や SwitchBot の常時取得も VPS ではやらない。

---

## 全体の順番（誰が・どこで）

| # | 内容 | 誰が | どこで |
|---|------|------|--------|
| 1 | 今の VPS・Cloudflare・API の状態を見る | **あなた** | さくらパネル · CF ダッシュボード · 手元の curl |
| 2 | R2 本番バケットと API トークンを作る | **あなた** | [dash.cloudflare.com](https://dash.cloudflare.com) |
| 3 | コードを GitHub 新 repo に載せる | **開発者**（あなたは repo 作成・権限付与） | GitHub |
| 4 | VPS の API を FastAPI（Docker）に差し替え | **開発者**（秘密の env は **あなた** がパネル/SSH で入れる） | さくら VPS |
| 5 | Pages に Web をデプロイ | **あなた**（CF 画面）+ **開発者**（ビルド設定の確認） | Cloudflare Pages |
| 6 | DNS を切り替える | **あなた** | Cloudflare DNS |
| 7 | ログイン用メール（magic link）を本番で動かす | **あなた**（SMTP 設定を Express から引き継ぎ） | VPS の env |

---

### Phase 0: 現状確認（今日できる）

**目的**: 「今何が動いているか」をメモする。後で切り替えミスを防ぐ。

#### さくら VPS — コントロールパネル

1. ブラウザで開く: **https://secure.sakura.ad.jp/vps/servers/4402799/info**  
   （さくらにログイン → VPS 一覧 → 該当サーバの「情報」でも同じ画面）
2. 次をメモ（値は **チャットに貼らない**。手元のメモ帳でよい）:

| 見る項目 | パネル上の場所（目安） | メモする内容 |
|----------|------------------------|--------------|
| **グローバル IPv4** | サーバ情報 · IP アドレス | `api.it-hercules.uk` の A レコードと一致するか |
| **OS** | サーバ情報 | Rocky Linux 9/10 想定 |
| **メモリ** | プラン | **512MB** であること |
| **ディスク** | ストレージ | 空き容量（ログで埋まっていないか） |
| **電源** | ステータス | **起動中** |

#### 確認済み（2026-06-26 · オーナー申告 + エージェント `curl`）

| 項目 | 値 |
|------|-----|
| **サーバー名** | `civilization-api` |
| **ホスト名** | `ik1-408-36034.vs.sakura.ne.jp` |
| **グローバル IPv4** | **`153.127.20.38`** — Cloudflare DNS の `api` A レコードと一致するか最終確認 |
| **プラン** | 512MB / 25GB SSD / 1 vCPU（ver3 hybrid 設計と一致） |
| **パネル** | [サーバー情報 4402799](https://secure.sakura.ad.jp/vps/servers/4402799/info) |

3. **中で何が動いているか**（パネルだけでは細かく見えないとき）:

| 方法 | 誰が | 手順の概要 |
|------|------|------------|
| **SSH** | 開発者 or あなた（鍵がある人） | パネルの「コンソール」または SSH クライアントでログイン → `pm2 list` や `docker ps` でプロセス確認 |
| **パケットフィルタ** | あなた | パネル「パケットフィルタ」— **80/443** が開いているか（Web 用）。API は nginx 経由で 443 が開いていればよい |

**512MB の注意**: 今は **Node（Express）+ pm2** で動いている可能性が高い。ver3 では **Docker の api 1 本だけ**に絞る。

#### Cloudflare — ダッシュボード

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) にログイン  
2. 左から確認:

| 見るもの | 確認内容 |
|----------|----------|
| **DNS** → ゾーン **`it-hercules.uk`** | ゾーンがあるか · MX（メール）は触らない |
| **Workers & Pages** → **Pages** | 既存プロジェクト名（旧 civ-os 用など） |
| **R2** | バケット一覧 — **`it-hercules-laboratory-prod` があるか**（無ければ Phase 1 で作る） |

#### R2 バケット一覧 — 確認済み（2026-06-26 · CF ダッシュボード）

| バケット名 | 状態 | ver3 での扱い |
|------------|------|----------------|
| `civilization-images` | 空 | 触らない（旧 civ-os 用） |
| `civilization-videos` | 空 | 触らない（旧 civ-os 用） |
| **`civilization-world`** | **3.79k オブジェクト · 27.19 MB** | **旧 Express 本番データ** — **切り替え完了まで触らない・削除しない** |
| **`it-hercules-laboratory-dev`** | **1 オブジェクト · 41 B** | **開発用** — そのまま残す（本番と分離） |
| **`it-hercules-laboratory-prod`** | **作成済み（空）** | **IHL 本番のデータ置き場** — Phase 1 完了（2026-06-26） |

**Account ID**（`R2_ENDPOINT` 用 · 公開してよい識別子）: **`a49c9c8e4765257a0b07a7ef82eba550`**  
→ エンドポイント例: `https://a49c9c8e4765257a0b07a7ef82eba550.r2.cloudflarestorage.com`

**要点**: 今動いている Express は **`civilization-world`** を参照している可能性が高い。IHL 本番は **別バケット `it-hercules-laboratory-prod`** に置く。旧データの移行・`civilization-world` の整理は **API 差し替え（Phase 3）が成功してから**でよい。

#### 今の API が Express か FastAPI か

手元の PC（PowerShell でも可）で:

```powershell
curl.exe -sS "https://api.it-hercules.uk/health"
```

| 返り方の目安 | 意味 |
|--------------|------|
| `{"status":"ok","service":"ihl-api",...}` のような JSON | **すでに IHL FastAPI**（差し替え済みに近い） |
| 別の JSON や `ok` だけ | おそらく **旧 Express（文明 OS backend）** — Phase 3 で差し替え対象 |

**• 2026-06-26 確認**: `curl.exe -sS https://api.it-hercules.uk/health` → HTTP **200**、`{"ok":true,"service":"Civilization OS Backend API"}` → **現行は Express（文明 OS backend）**。Phase 3 の FastAPI 差し替え対象。

| 接続できない · 証明書エラー | DNS または VPS / nginx を Phase 0 で要調査 |

---

### Phase 1: Cloudflare R2（データ置き場）

**誰が**: あなた（Cloudflare ダッシュボード）  
**どこで**: [dash.cloudflare.com](https://dash.cloudflare.com) → **R2**  
**2026-06-26 時点**: dev バケットはある · **本番バケット `it-hercules-laboratory-prod` 作成済み** → 下記 **手順 2（R2 API トークン）** が次。

#### 1. 本番バケット作成 — **完了（2026-06-26）**

- [x] バケット名 **`it-hercules-laboratory-prod`** が R2 一覧に表示されている（中身は空で正しい）

#### 2. API トークン（R2 用キー）作成 — **いまやること（任意だが Phase 3 前に推奨）**

1. **R2** → **アカウントの API トークンを管理**（または **Manage R2 API Tokens**）
2. **Create API token** — 権限は **このバケットへの Object Read & Write**
3. 作成直後に表示される次を **あなたの秘密メモ** に保存（**チャット・Git・スクリーンショット公開に貼らない**）:

| メモする名前 | 用途 |
|--------------|------|
| **Access Key ID** | VPS の env `R2_ACCESS_KEY_ID` |
| **Secret Access Key** | VPS の env `R2_SECRET_ACCESS_KEY`（**再表示不可**） |
| **Account ID** | `R2_ENDPOINT` の URL に使う — 確認済み: **`a49c9c8e4765257a0b07a7ef82eba550`** → `https://a49c9c8e4765257a0b07a7ef82eba550.r2.cloudflarestorage.com` |

dev 用バケット **`it-hercules-laboratory-dev`** はそのまま残す（本番と分離）。**`civilization-world` は切り替え完了まで触らない。**

---

### Phase 2: GitHub 新 repo

**誰が**: 開発者が push · あなたは org/repo の存在と権限を確認  
**どこで**: [github.com/itherculeslaboratory-cyber/it-hercules-laboratory](https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory)

1. リポジトリが存在し、**IHL のコード**（`apps/web` · `apps/api` · `libs/` など）が入っていること  
2. 旧 **`civilization-os`** は参照・salvage 用 — **ver3 のデプロイ元は新 repo のみ**  
3. あなたがやること: 開発者に **Collaborator 追加** または deploy 用の **GitHub ↔ Cloudflare 連携** を承認する

---

### Phase 3: さくら VPS（API 差し替え）

**誰が**: 開発者が手順実行 · **秘密（R2・SMTP・JWT）はあなたが env に入れる**  
**どこで**: VPS（SSH）· 既存 nginx

#### 最小変更のイメージ

| 今（想定） | ver3 後 |
|------------|---------|
| Node Express · **:3001** · pm2 | **Docker `api` のみ** · **:8000** · uvicorn |
| nginx → `127.0.0.1:3001` | nginx → **`127.0.0.1:8000`** |
| データがメモリ/R2 混在の可能性 | **`R2_*` 本番バケットのみ** · `IHL_R2_LOCAL_ROOT` は**設定しない** |

#### 開発者がやること（概要）

1. 新 repo を VPS に clone / pull  
2. `docker compose build api` → **`api` サービスだけ**起動（`--reload` なし）  
3. nginx の `proxy_pass` を **3001 → 8000** に変更して reload  
4. 旧 pm2 の Express を止める（**二重起動しない**）

#### VPS に入れる env（名前だけ — 値はあなたのメモから）

`.env.platform` を **Git にコミットしない**。VPS 上のファイルまたは docker compose の env で設定:

- `R2_ENDPOINT` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` · `R2_BUCKET=it-hercules-laboratory-prod`
- `IHL_AUTH_REQUIRED=1`（本番は観測 API にログイン必須）
- `IHL_CORS_ORIGINS=https://it-hercules.uk`
- **`IHL_DEV_EXPOSE_MAGIC_TOKEN` は本番では付けない**
- **`IHL_R2_LOCAL_ROOT` は付けない**（ローカル保存に戻さない）

#### 触らないもの（VPS）

| 載せない · やらない | 理由 |
|---------------------|------|
| **Next.js（:3000）** | Pages が担当 |
| **DINOv2 / 重い ML** | 512MB で動かない |
| **SwitchBot のサーバ側 poll** | 設計上禁止 — ユーザー PC の collector のみ |
| **Web + API 同居の docker compose --profile web** | メモリ不足 |

詳細コマンド: civ-os 側の参考 runbook [sakura-vps-rocky512-civilization-api-ja.md](../../../docs/runbooks/sakura-vps-rocky512-civilization-api-ja.md)（ポート・nginx の考え方は同型。**中身は FastAPI に読み替え**）。

確認:

```powershell
curl.exe -sS "https://api.it-hercules.uk/health"
```

`service":"ihl-api"` が出れば API 差し替え成功の目安。

---

### Phase 4: Cloudflare Pages（画面）

**誰が**: あなた（CF 画面）· 開発者（ビルド設定の正しさ）  
**どこで**: Cloudflare **Workers & Pages**

旧 civ-os（Vite `frontend`）用 Pages がある場合、**IHL 用に新プロジェクト**を作るか、既存を **差し替え**（方針は開発者と合意）。

| 設定項目 | 入れる値（IHL） |
|----------|-----------------|
| **リポジトリ** | `it-hercules-laboratory` |
| **Production branch** | `main` または `master`（repo の既定に合わせる） |
| **Root directory** | `apps/web` |
| **Framework preset** | **Next.js**（または Custom — 下表どおり） |
| **Build command** | `npm ci && npm run pages:build` |
| **Build output directory** | **`.vercel/output/static`**（**必須** — `.next` や空欄にすると 25 MiB 超の webpack cache で失敗） |
| **環境変数（Production）** | **`IHL_API_URL`** = `https://api.it-hercules.uk` · **`NODE_VERSION`** = `20` |

> **よくある失敗**: Build output を `.next` にすると `.next/cache/webpack/.../0.pack`（100 MiB 超）がアップロード対象になり `Pages only supports files up to 25 MiB` で落ちる。next-on-pages の正しい出力は **`.vercel/output/static`** のみ。

`IHL_API_URL` が無いと、画面は `/api/*` を **間違った先**に転送する。

旧手順（Vite 用）の考え方: [cloudflare-pages-it-hercules-copypaste-ja.md](../../../docs/runbooks/cloudflare-pages-it-hercules-copypaste-ja.md) — **Root は `frontend` ではなく `apps/web`** に読み替える。

---

### Phase 5: DNS 切替

**誰が**: あなた  
**どこで**: Cloudflare → **DNS** → ゾーン **`it-hercules.uk`**

| ホスト名 | 向き先 | 備考 |
|----------|--------|------|
| **`it-hercules.uk`**（ルート） | **Pages**（CNAME または Pages が案内するレコード） | 旧プロトタイプから **IHL 画面**へ |
| **`www`** | 同上（使う場合） | |
| **`api`** | **VPS のグローバル IPv4**（A レコード） | パネル Phase 0 でメモした IP |
| **MX / メール用 TXT** | **変更しない** | メール受信を壊さない |

**プロキシ（オレンジ雲）**: `api` も `it-hercules.uk` も **ON 推奨**（HTTPS 終端・DDoS 緩和）。VPS 直前の証明書は CF または Let's Encrypt の既存構成に合わせる。

切替後の確認:

```powershell
curl.exe -sI "https://it-hercules.uk/" | findstr HTTP
curl.exe -sS "https://api.it-hercules.uk/health"
```

ブラウザで `https://it-hercules.uk` を開き、開発者ツールの **Network** で API が **`api.it-hercules.uk`** に飛んでいるか見る。

---

### Phase 6: メール magic link（IHL）

**誰が**: あなた（SMTP 資格情報の引き継ぎ）· 開発者（env 名の配線確認）  
**どこで**: VPS の API 環境変数

今 **`api.it-hercules.uk` で Express が動いている**なら、そこに既にある **SMTP 設定を FastAPI 側に移す**。

| 旧 Express（文明 OS `backend/.env`） | IHL 本番（**同一変数名で引き継ぎ可**） |
|--------------------------------------|-------------------------------------|
| `SMTP_HOST` · `SMTP_PORT` · `SMTP_USER` · `SMTP_PASS` | **同じ名前**（`libs/ihl/identity/magic_link_mail.py`） |
| `MAIL_FROM` | 送信元表示名付きメールアドレス |
| `PUBLIC_APP_URL` | **`https://it-hercules.uk`**（メール内リンクのベース · 末尾 `/` なし） |
| — | 任意: `IHL_MAGIC_LINK_BASE_URL` · `MAGIC_LINK_MAIL_SUBJECT` |

**やること**:

1. 今の VPS またはバックアップから **SMTP の設定項目名だけ**をリスト化（**パスワードは再入力**でよい）  
2. FastAPI 起動後、ログで **SMTP 有効**相当のメッセージがあるか開発者に確認  
3. 本番サイトからログイン送信 → **メールが届く**ことをあなたが確認（Tier D の一部）

dev 用の「画面にトークンが出る」機能は **本番では OFF**（`IHL_DEV_EXPOSE_MAGIC_TOKEN` 未設定）。

---

## あなたが今週やること（チェックボックス）

- [x] Phase 0: [さくら VPS 情報](https://secure.sakura.ad.jp/vps/servers/4402799/info) で IP · 512MB · ディスク空きをメモした（**153.127.20.38** · civilization-api · 512M/25GB · 2026-06-26）  
- [x] Phase 0: Cloudflare で R2 バケット一覧を確認した（2026-06-26 — dev あり · **prod 作成済み** · `civilization-world` は旧 Express 用 3.79k 件）  
- [ ] Phase 0: Cloudflare で `it-hercules.uk` ゾーン · Pages を見た（DNS / Pages は未チェックなら残す）  
- [x] Phase 0: `curl https://api.it-hercules.uk/health` の結果をメモした — **Express**（`Civilization OS Backend API` · 200 · 2026-06-26）  
- [x] Phase 1: R2 バケット `it-hercules-laboratory-prod` を作成した（2026-06-26）  
- [ ] Phase 1: R2 の Access Key / Secret / Account ID を **安全な場所**に保存した（チャットに貼っていない）  
- [ ] Phase 2: GitHub `it-hercules-laboratory` にコードがあることを確認した  
- [ ] Phase 3: 開発者に VPS 差し替えを依頼し、**秘密は自分で env に入れた**（または入れる予定日を決めた）  
- [ ] Phase 4: Pages プロジェクトを作成し、`IHL_API_URL=https://api.it-hercules.uk` を設定した  
- [ ] Phase 5: DNS（ルート → Pages、`api` → VPS IP）を切り替えた  
- [ ] Phase 6: magic link メールが本番で届くことを 1 回試した  

---

## エージェント / 開発者がやること

| 項目 | 内容 |
|------|------|
| コード | 新 repo への mirror / push · CI（pytest · Playwright） |
| VPS | Docker `api` デプロイ · nginx 3001→8000 · pm2 Express 停止手順書 |
| Pages | Next.js の Pages 向けビルド出力確定 · `wrangler.toml` 等 |
| 秘密 | **値は書かない** — env テンプレ [`.env.platform.example`](../.env.platform.example) のキー名だけ整備 |
| テスト | `https://api.it-hercules.uk/health` · 観測検索 · 未認証 401 · R2 に blob 存在 |
| やらない | さくらパネル操作 · CF 本番トークン発行 · DNS 本番切替 · SMTP パスワードのチャット共有 |

技術 runbook: [ver3-deploy-runbook.md](./ver3-deploy-runbook.md)

---

## よくある誤解

### 「VPS いじらなくていいの？」→ **半分**

| いじらない | いじる |
|------------|--------|
| Next.js を VPS に載せる | **API だけ** Express → FastAPI に差し替え |
| DINOv2 を VPS で動かす | nginx の向き先 **3001 → 8000** |
| SwitchBot をサーバで poll する | Docker で **api 1 コンテナ** · 本番 R2 env |
| ディスクに観測データを溜める | SMTP / JWT / R2 キーを VPS env に設定 |

**画面は Cloudflare、API だけ VPS、データは R2** — この 3 分割が ver3 の固定です。

### 「Cloudflare だけで全部できる？」

Pages は **静的＋Next の配信**向け。FastAPI をそのまま Workers に載せ替える案は **ver3 では不採用**。API は VPS に残す。

### 「今の `api.it-hercules.uk` はそのまま使える？」

**ドメインはそのまま**。中身を Express から **IHL FastAPI** に換える。DNS の `api` レコードは **同じ VPS IP** のままが多い。

### 「メール設定は Pages に書く？」

**いいえ**。magic link を送るのは **API（VPS）**。Pages の環境変数は **`IHL_API_URL` 程度**でよい。

---

## 参照リンク

| ドキュメント | 用途 |
|--------------|------|
| [ver3-deploy-runbook.md](./ver3-deploy-runbook.md) | 技術者向け正本 |
| [sakura-vps-rocky512-civilization-api-ja.md](../../../docs/runbooks/sakura-vps-rocky512-civilization-api-ja.md) | 512MB VPS · nginx · スワップ（Express 時代の手順 · ポート考え方の参考） |
| [cloudflare-pages-it-hercules-copypaste-ja.md](../../../docs/runbooks/cloudflare-pages-it-hercules-copypaste-ja.md) | Pages · DNS · `VITE_API_URL` の考え方（IHL では `IHL_API_URL` + `apps/web`） |
| [dev-runbook.md](./dev-runbook.md) | ローカル ver2 hybrid（本番との対比） |
