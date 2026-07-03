# IHL 運用ステータス（引き継ぎ入口）

> **更新**: 2026-07-03  
> **正本 repo**: [itherculeslaboratory-cyber/it-hercules-laboratory](https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory)  
> **計画ハブ**: [`docs/planning/README.md`](./README.md)

---

## マイルストーン

| 項目 | 状態 |
|------|------|
| **ver1** 観測入力 | ✅ COMPLETE（2026-06-26） |
| **ver2** 検索 + 表示（`.dev`） | ✅ COMPLETE（2026-06-26） |
| **ver3** 初回 Web 本番リリース | **🟢 本番稼働中** |
| **ver4+** 段階機能拡張 | バックログ整理済み · インフラ未着手 |

### ver3 本番（現行）

| 役割 | URL |
|------|-----|
| **Web**（Cloudflare Pages · Next.js） | https://it-hercules.uk |
| **API**（Sakura VPS · FastAPI · nginx） | https://api.it-hercules.uk |

構成は **ver3 暫定妥協**（API 全量 VPS）。ver4 目標は Workers 主 API + VPS 薄常駐（[`ver4-infra-agreement.md`](../ver4-infra-agreement.md)）。

---

## プロダクト方針（確定 · 2026-07-03）

| 項目 | 決定 |
|------|------|
| **観測検索スコープ** | **Scope A（コミュニティ）** — ログイン済みユーザーは **全観測カタログ**を検索・閲覧。`owner_user_id` / セッション actor による検索絞り込み **なし** |
| **書き込み・個人設定** | `useActorId()` / セッション `actor_id` で commit · 命名 · 個体 · デバイス等は **本人スコープ** |
| **本番ログイン必須** | **はい** — API: `IHL_AUTH_REQUIRED=1` · Web: `IHL_WEB_AUTH_BYPASS` **未設定**（middleware 認証 ON） |

### 本番環境変数チェックリスト（人間 · VPS / Pages）

| 層 | 変数 | 本番値 |
|----|------|--------|
| **VPS API** | `IHL_AUTH_REQUIRED` | **`1`**（未設定なら観測 API が無認証可になる） |
| **VPS API** | `IHL_AUTH_BYPASS` | **未設定** |
| **VPS API** | `IHL_CORS_ORIGINS` | `https://it-hercules.uk` |
| **Pages Web** | `IHL_WEB_AUTH_BYPASS` | **未設定**（`1` だと middleware が全ルートを無認証通過） |
| **Pages Web** | `IHL_API_URL` | `https://api.it-hercules.uk` |

詳細: [`ver3-deploy-runbook.md`](../ver3-deploy-runbook.md) §環境変数 · [`vps-api-deploy.md`](../vps-api-deploy.md) §2

---

## 直近完了（2026-06-26 〜 07-03）

| 項目 | 内容 |
|------|------|
| **計画ハブ** | `docs/planning/` 新設（`44304f3`） |
| **Claude / OSS 監査** | `CLAUDE.md` · `DESIGN-IMPL-AUDIT.md` · `OSS-READINESS.md` · drift-inventory |
| **AppShell 認証導線** | 未認証: ログイン/新規登録 Link · 認証済み: actor 表示 + ログアウト · `useAuthSession` |
| **actor_id 連携** | 観測入力/confirm · 個体 · 設定デバイス — `u_demo` → session `actor_id`（未ログイン時 dev フォールバック） |
| **観測画像表示** | `dafdd53` — `AuthenticatedImage.tsx` · blob 認証付き表示 |
| **API / CORS / nginx** | `api.it-hercules.uk` 直叩き · `test_cors.py` |
| **検索スコープ A** | 人間ゲート解消 · API/UI はカタログ横断（`test_observation_search_scope_a_returns_all_owners`） |

---

## 止まっているところ

| 問題 | 詳細 |
|------|------|
| **parity C4 README** | ~~12 mismatch~~ → **PASS**（claims パス修正済み） |
| **magic link メール** | 本番 SMTP 未配線（人間ゲート） |
| **PT ショップ UI polish** | 意図的延期 |
| **mine/public UI チップ** | Scope A 確定済み · 将来 `visibility` 列追加時に再検討 |

---

## 次の 3 タスク

1. **VPS `.env` 実地確認** — `IHL_AUTH_REQUIRED=1` がサーバに入っているか（未設定なら追加して `docker compose` 再起動）
2. **`test_csv_import.py` 修復** — SwitchBot CSV fixture 2 件
3. **Pages 再デプロイ** — `main` push で CF Pages 自動反映

---

## 人間ゲート（AI 完走不可）

| ゲート | 内容 | 参照 |
|--------|------|------|
| **GMO 本番入金** | 実入金・本番証跡 | civ-os `P0-NEXT-GMO-LIVE-EXEC` |
| **magic link SMTP** | VPS または外部 SMTP の鍵・送信ドメイン設定 | [`ver3-deploy-runbook.md`](../ver3-deploy-runbook.md) |
| **certbot / nginx 上書き** | 既存 `ihl-api.conf` を certbot が置換する際の手動確認 | [`vps-api-deploy.md`](../vps-api-deploy.md) |
| **ver4 インフラ移行** | Workers 主 API への切替（未着手） | [`ver4-infra-agreement.md`](../ver4-infra-agreement.md) |

~~検索スコープ方針~~ → **Scope A 確定（2026-07-03）** · [`backlog/2026-06-27-tomorrow.md`](./backlog/2026-06-27-tomorrow.md)

---

## 設計 · 監査へのリンク

| 用途 | パス |
|------|------|
| 設計↔実装監査 | [`docs/DESIGN-IMPL-AUDIT.md`](../DESIGN-IMPL-AUDIT.md) |
| OSS readiness | [`docs/OSS-READINESS.md`](../OSS-READINESS.md) |
| nest/clean ドリフト | [`migrations/drift-inventory.md`](./migrations/drift-inventory.md) |
| ver1〜4+ 計画 | [`versions/README.md`](./versions/README.md) |
| V-model · POST-OSS | [`phases/README.md`](./phases/README.md) |

---

*運用現実は本ファイル + `ver3-deploy-runbook`。V-model 詳細は `00-AI-HANDOFF-BRIEF` を正とする。*
