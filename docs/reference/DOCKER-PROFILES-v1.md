# IHL Docker Profiles v1

> **ステータス**: **正本**（2026-07-05 · M-011 執筆完了）  
> **読者**: contributor · DET/RUN 執筆 · ローカル dev  
> **上位**: [`05-運用/queues/00-マスター実行順-v1.md`](../../05-運用/queues/00-マスター実行順-v1.md) §4.1 · [ADR-H-30](../../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)  
> **深度ガイド**: [`V-MODEL-LAYERS-v1.md`](./V-MODEL-LAYERS-v1.md) §2.11  
> **正本 compose**: [`docker-compose.yml`](../../docker-compose.yml)

---

## 0. 目的

IHL の Docker Compose は **開発・検証・ユーザー PC 上の collector** 向け。本番 VPS は **`api` のみ**（512MB · ML なし · SwitchBot secret 禁止）。

本書は profile ごとの **能力 · 禁止 · 実行場所** を固定する。REQ に compose 手順を書かない（→ **INF/RUN** 層 · 本書）。

---

## 1. 2 ゾーン（混同禁止）

| ゾーン | 役割 | SwitchBot secret | 重い計算 |
|--------|------|------------------|----------|
| **ユーザー PC** | dev · collector · embedding パイプライン | **可**（`.env.local` のみ · git 禁止） | **可**（DINOv2 等は `[ml]` 追加予定） |
| **IHL 本番 VPS** | `api` コンテナのみ | **禁止** | **禁止** |

```text
ユーザー PC                          IHL 本番 VPS
┌─────────────────────────┐         ┌──────────────────┐
│ .env.local (SwitchBot)  │         │ api のみ         │
│ docker collector ───────┼─ingest─►│ secret なし      │
│ pipeline / [ml] embed   │         │ ML なし          │
│ dev-up / compose api    │         └──────────────────┘
│ Web UIbuilder = 簡易    │
│ GitHub = 機能開発       │
└─────────────────────────┘
```

---

## 2. Profile 能力表

| profile | サービス | ポート | 主用途 | 実行場所 | secret 注意 |
|---------|----------|--------|--------|----------|-------------|
| *(default)* | `api` | :8000 | FastAPI · schema マウント · hot reload | dev PC · **本番 VPS** | `.env.platform` に SwitchBot **載せない** |
| `web` | `web` | :3000 | Next.js dev | **dev PC のみ** | VPS 512MB 同居禁止 |
| `full` | `api` + `web` + `collector` + `search` | 上記 | ローカルフルスタック | dev PC | collector は PC の `.env.local` |
| `collector` | `collector` | — | SwitchBot LAN poll → `POST /api/env/ingest` | **ユーザー PC のみ** | token+secret は **PC のみ** · IHL 製品サーバ構成要素ではない |
| `search` | `search` | :8501 | Streamlit 観測検索 dev | dev PC | 本番 UI ではない |
| `test` | `test` | — | pytest 再現 | CI / dev PC | ブラウザ E2E ではない |

**起動例**（[`docker-compose.yml`](../../docker-compose.yml) ヘッダより）:

```bash
docker compose up api search                    # API + Streamlit
docker compose --profile web up                 # + Next.js
docker compose --profile collector up           # SwitchBot poll（PC のみ）
docker compose --profile test run --rm test     # pytest
```

---

## 3. 禁止事項（STRONG · ADR-H-30）

| 禁止 | 理由 |
|------|------|
| 本番 VPS / `api` コンテナに `SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` | 漏洩時に全デバイス操作可能 · ユーザー方針 STRONG |
| `.env.platform` · GitHub Actions / 本番 CI Secrets への SwitchBot 鍵 | インフラ漏洩面 |
| IHL VPS 上での SwitchBot **サーバ poll** | ADR-H-29 却下 · ADR-H-30 §2.2 |
| ブラウザのみで SwitchBot API 直叩き | secret 露出 · CORS 不可 |
| `web` profile を本番 VPS で常時同居 | 512MB 制約 · Pages が Web 正本 |
| compose 手順を REQ 本文に記載 | 層分離 — **INF/RUN** · 本書へ |

**許可**: `.env.local.example` に変数名テンプレ · ユーザー PC の `.env.local`（コミット禁止）· `collector/` 参考実装のユニットテスト（モックのみ）。

---

## 4. SwitchBot 取り込み経路 A / B / C

| 経路 | Docker | secret | 正本 |
|------|--------|--------|------|
| **A 手動 Export → Import** | **不要** | **不要** | ADR-H-30 §2.1 A · UI/CSV upload · **v1 正本** |
| **B 観測時手入力** | 不要 | 不要 | ADR-H-30 §2.1 B · `manual_entry` |
| **C 自動 poll → ingest** | **ユーザー PC で `collector` profile 必須** | PC の `.env.local` のみ | ADR-H-30 §2.1 C · [`collector/`](../../collector/) |

**経路 C の流れ**

1. ユーザー PC で `docker compose --profile collector up`
2. `collector/switchbot-local-collector.mjs` が LAN 上 SwitchBot API を poll（secret は PC のみ）
3. **測定値のみ** Ed25519 署名付きで `POST /api/env/ingest`（IHL API は公開鍵のみ保持）
4. Tier B 系列として参照 · gap は UI 表示（補間は imputed · 別 event）

> **却下**: IHL 本番 `api` が secret を読んで poll する構成（ADR-H-29 サーバ poll 却下）。

---

## 5. env ファイル優先（dev）

各サービスは次を **optional** で読込（image に COPY しない）:

| ファイル | 用途 | SwitchBot |
|----------|------|-----------|
| `.env` | 共通 dev | 載せない（推奨） |
| `.env.platform` | プラットフォーム共通 | **禁止** |
| `.env.local` | **ユーザー PC ローカルのみ** | collector 用 **ここだけ** |

---

## 6. 設計書への書き方

| トピック | 書く層 | 書かない層 |
|----------|--------|------------|
| profile 選択 · 起動手順 | **INF/RUN**（本書 · runbook） | REQ |
| ingest 契約 · placement 制約 | DET #13 §3 | REQ |
| SwitchBot 方針 · 却下理由 | ADR-H-30 | DET 本文の重複定義 |

---

## 7. 関連

| 文書 | 役割 |
|------|------|
| [`V-MODEL-LAYERS-v1.md`](./V-MODEL-LAYERS-v1.md) §2.11 | INF/RUN 執筆深度 |
| [`00-設計書憲法-v1.md`](../../05-運用/queues/00-設計書憲法-v1.md) §1 INF/RUN | 成果物 ID |
| [`docs/vps-api-deploy.md`](../vps-api-deploy.md) | 本番 VPS api のみ |
| [`.cursor/rules/no-switchbot-secret-in-ihl.mdc`](../../.cursor/rules/no-switchbot-secret-in-ihl.mdc) | Cursor 禁止ルール |

---

## 8. 改訂履歴

| 日付 | 版 | 内容 |
|------|-----|------|
| 2026-07-05 | v1 | M-011 初版 — profile 表 · 2 ゾーン · SwitchBot A/B/C · 禁止 |

---

*contributor: 本番デプロイは `api` のみ · SwitchBot 自動化は自分の PC で collector*
