# GitHub 新 repo への push 手順（Strategy B → 正本 repo）

> **確定 remote**: `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git`  
> **現状（2026-06-26）**: コードは `civilization-os/指示/it-hercules-laboratory/` にネスト。ローカル git の `origin` は **legacy `civillization-os`**。GitHub 上の `it-hercules-laboratory` は **空 repo**（ブランチ未作成の可能性あり）。

---

## 状況の整理

| 項目 | 状態 |
|------|------|
| **作業ツリー** | `D:\Programs\civilization-os\指示\it-hercules-laboratory\`（独立 `.git` あり） |
| **別 clone** | `D:\Programs\it-hercules-laboratory` — **未作成** |
| **推奨** | 初回は **filter-repo または新 clone + copy** でルートを IHL 単体にして push |

---

## 方法 A — 推奨: 新ディレクトリへ export して push

開発マシン（PowerShell 例）:

```powershell
# 1) 作業用 clone（空 repo に初回 push）
git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git D:\Programs\it-hercules-laboratory
cd D:\Programs\it-hercules-laboratory

# 2) ネスト作業ツリーの内容をコピー（.git は除く）
$src = "D:\Programs\civilization-os\指示\it-hercules-laboratory"
robocopy $src . /E /XD .git node_modules .next .pytest_cache test-results __pycache__ /XF .env .env.local .env.platform

# 3) 初回コミット & push
git add -A
git status
git commit -m "IHL ver3: initial mirror from civilization-os nested tree"
git branch -M main
git push -u origin main
```

**除外するもの**: `.env*`（秘密）· `node_modules` · `.next` · キャッシュ類。

---

## 方法 B — ネスト repo から remote 追加

既存 `指示/it-hercules-laboratory/.git` を使う場合:

```powershell
cd "D:\Programs\civilization-os\指示\it-hercules-laboratory"
git remote add ihl https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git
# または SSH: git@github.com:itherculeslaboratory-cyber/it-hercules-laboratory.git
git push -u ihl master:main
```

**注意**: `origin` は legacy civ-os のまま残せる。Pages / VPS は **`it-hercules-laboratory` の `main`** を参照。

---

## 方法 C — git filter-repo（履歴を IHL サブパスだけに）

civilization-os モノレポ全体の履歴から `指示/it-hercules-laboratory/` だけを抽出する場合（上級）:

```bash
# git-filter-repo 要インストール
git clone --mirror https://github.com/itherculeslaboratory-cyber/civillization-os.git ihl-export
cd ihl-export
git filter-repo --subdirectory-filter 指示/it-hercules-laboratory
git remote add origin https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git
git push -u origin main
```

パス名のエンコーディングは環境により `指示/it-hercules-laboratory` の表記を要確認。

---

## 認証（人間ゲート）

| 手段 | 用途 |
|------|------|
| **SSH key** | `git@github.com:itherculeslaboratory-cyber/...` |
| **HTTPS + PAT** | `gh auth login` または Git Credential Manager |
| **Deploy key** | VPS から read-only clone |

本環境のエージェントセッションでは **`gh` 未インストール** · push 資格情報なし → **ユーザーまたは開発者が上記を実行**。

---

## push 後

1. Cloudflare Pages — リポジトリ `it-hercules-laboratory` · root `apps/web`
2. VPS — `git clone` 先を新 repo に切替（[vps-api-deploy.md](./vps-api-deploy.md)）
3. civ-os CI（`ihl-*.yml`）は移行完了まで併存可 · 将来 IHL repo 内 `.github/workflows/` へ

---

## README デプロイ一行

正本 repo の README に追記済み: ver3 は [docs/vps-api-deploy.md](./vps-api-deploy.md) · [ver3-deploy-runbook.md](./ver3-deploy-runbook.md)。
