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
| **計画ハブ** | `docs/planning/` 新設（`44304f3`） |
| **Claude / OSS 監査** | `CLAUDE.md` · `DESIGN-IMPL-AUDIT.md` · `OSS-READINESS.md` · drift-inventory |
| **AppShell 認証導線** | 未認証: ログイン/新規登録 Link · 認証済み: actor 表示 + ログアウト · `useAuthSession` |
| **actor_id 連携** | 観測入力/confirm · 個体 · 設定デバイス — `u_demo` → session `actor_id`（未ログイン時 dev フォールバック） |
| **観測画像表示** | `dafdd53` — `AuthenticatedImage.tsx` · blob 認証付き表示 |
| **API / CORS / nginx** | `api.it-hercules.uk` 直叩き · `test_cors.py` |

---

## 止まっているところ

| 問題 | 詳細 |
|------|------|
| **観測検索スコープ API** | フロント検索は全件マージのまま · `scope: mine/public/all` は **未実装**（プロダクト方針は人間ゲート） |
| **parity C4 README** | ~~12 mismatch~~ → **PASS**（claims パス修正済み） |
| **magic link メール** | 本番 SMTP 未配線（人間ゲート） |
| **PT ショップ UI polish** | 意図的延期 |

---

## 次の 3 タスク

1. **本番 env 確認** — `IHL_WEB_AUTH_BYPASS` · `IHL_AUTH_REQUIRED` の意図確認（人間）
2. **検索スコープ方針確定** — mine/public/all 判断後 · API + UI チップ
3. **`test_csv_import.py` 修復** — SwitchBot CSV fixture 2 件

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
