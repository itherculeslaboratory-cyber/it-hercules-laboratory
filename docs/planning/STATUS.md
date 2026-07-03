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

## 直近完了（2026-06-26 〜 07-03）

| 項目 | 内容 |
|------|------|
| **観測画像表示** | コミット `dafdd53` — `AuthenticatedImage.tsx` · `api.fetchBlob` · `IHL_AUTH_REQUIRED=1` 本番で blob 認証付き表示 |
| **API ルーティング** | Pages `/api/*` rewrite → VPS · 直叩き修正（`664d8f2` 系列） |
| **HTTPS / nginx** | `api.it-hercules.uk` · certbot · `deploy/nginx/ihl-api.conf` |
| **CORS** | `test_cors.py` 追加 · 本番オリジン整合 |
| **計画ハブ** | `docs/planning/` 新設（本ファイル含む） |

---

## 止まっているところ

| 問題 | 詳細 |
|------|------|
| **ログイン / 新規登録導線なし** | `/login` · `/register` は実装済みだが、`AppShell` に Link なし。未認証ユーザーが自力で認証画面に辿り着けない |
| **観測検索スコープ未定** | API は actor で絞らないが、フロントが `u_demo` 固定でデータ分断。プロダクト方針（mine / public / all）未確定 |
| **magic link メール** | 本番 SMTP 未配線（人間ゲート） |
| **PT ショップ UI polish** | 意図的延期（[`implementation-deferrals.md`](../implementation-deferrals.md) `P2-NEXT-DEFER-IHL-BRAND-SHOP-UI`） |

---

## 次の 3 タスク

1. **AppShell 認証導線** — 未認証時 `ログイン` · `新規登録` Link · 認証済み時セッション表示 + ログアウト（[`backlog/2026-06-27-tomorrow.md`](./backlog/2026-06-27-tomorrow.md) §1）
2. **観測検索スコープ方針確定** — mine / public / all の人間判断 → `u_demo` → session `actor_id` 連携（同 §2）
3. **本番 env 確認** — `IHL_WEB_AUTH_BYPASS` · `IHL_AUTH_REQUIRED` の意図確認

---

## 人間ゲート（AI 完走不可）

| ゲート | 内容 | 参照 |
|--------|------|------|
| **GMO 本番入金** | 実入金・本番証跡 | civ-os `P0-NEXT-GMO-LIVE-EXEC` |
| **magic link SMTP** | VPS または外部 SMTP の鍵・送信ドメイン設定 | [`ver3-deploy-runbook.md`](../ver3-deploy-runbook.md) |
| **certbot / nginx 上書き** | 既存 `ihl-api.conf` を certbot が置換する際の手動確認 | [`vps-api-deploy.md`](../vps-api-deploy.md) |
| **検索スコープ方針** | mine / public / all のプロダクト判断 | [`backlog/2026-06-27-tomorrow.md`](./backlog/2026-06-27-tomorrow.md) |
| **ver4 インフラ移行** | Workers 主 API への切替（未着手） | [`ver4-infra-agreement.md`](../ver4-infra-agreement.md) |

---

## 設計 · キューへのリンク

| 用途 | パス |
|------|------|
| ver1〜4+ 計画 | [`versions/README.md`](./versions/README.md) → [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](../../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) |
| V-model · POST-OSS | [`phases/README.md`](./phases/README.md) → [`05-運用/queues/`](../../05-運用/queues/) |
| OSS ギャップ表 | [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](../../02-設計/_横断/00-OSS機能ギャップ表-v1.md) |
| AI 厚い引き継ぎ | [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) |
| 意図的延期 | [`implementation-deferrals.md`](../implementation-deferrals.md) |

---

*運用現実は本ファイル + `ver3-deploy-runbook`。V-model 詳細は `00-AI-HANDOFF-BRIEF` を正とする。*
