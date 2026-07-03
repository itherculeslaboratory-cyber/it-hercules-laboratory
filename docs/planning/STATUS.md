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

| **DOC-REMED** 文書リメディエーション | **🟢 Wave 1 完了（2026-07-03）** — #01–#05・#12 の REQ-slim/TD/RTM/GATE 完了 · 全 GATE（rtm・parity・layering）PASS · GATE ツール 3 バグ修正（TC/req-ID 抽出 · 横断 ID 免除）· 次段 Wave 2 精緻化 |
| **DOC-REMED-MAD** 狂気モード基盤 | **🟢 MAD-COMPLETE（2026-07-03）** — 全 **24** 機能 GOLDEN · 累計 **816** MICRO slices · 横断レジストリ実データ化 · #02 は **HUMAN-02-LEGAL** 条文不変更 · [`MAD-COMPLETE-REPORT.md`](./MAD-COMPLETE-REPORT.md) |
| **DOC-REMED-QUANTUM** 量子粒設計 | **🟢 QUANTUM-COMPLETE（2026-07-03）** — **1813** GPU shards · 53 mock PNG · ver4 INFRA 設計 · UI 部品 263 · 人間 GO · **UI Parts Lab** [`apps/ui-parts-lab/`](../../apps/ui-parts-lab/) port **3100** |

詳細: [`docs/planning/audits/DOC-AUDIT-INDEX.md`](./audits/DOC-AUDIT-INDEX.md) · 黄金: [`docs/planning/golden/GOLDEN-05-MANIFEST.md`](./golden/GOLDEN-05-MANIFEST.md) · Skill: `.cursor/skills/ihl-doc-remediation/SKILL.md` · 合図: `IHL-DOC-AUDIT` / `IHL-DOC-REMED` / `IHL-DOC-REMED MAD` / **`IHL-DOC-QUANTUM`**

---

| 項目 | 決定 |
|------|------|
| **観測検索スコープ** | **Scope A（コミュニティ）** — ログイン済みユーザーは **全観測カタログ**を検索・閲覧。`owner_user_id` / セッション actor による検索絞り込み **なし** |
| **書き込み・個人設定** | `useActorId()` / セッション `actor_id` で commit · 命名 · 個体 · デバイス等は **本人スコープ** |
| **本番ログイン必須** | **はい（WRITE のみ）** — API: `IHL_AUTH_REQUIRED=1` で commit/upload 等 · **観測 search/list/detail/image は Scope A により未ログイン可** · Web middleware も観測 READ ルートを公開 |

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
| **観測画像表示** | `dafdd53` — `AuthenticatedImage.tsx` · blob 認証付き表示（**性能改善は backlog 化** → [`backlog/image-perf-and-cost.md`](./backlog/image-perf-and-cost.md)） |
| **ログイン導線** | AppShell ログイン/登録/ログアウト — **本番確認 OK（2026-07-03）** |
| **未ログイン観測検索 401** | **修正済み** — router 全体 `enforce_auth_when_required` が READ をブロックしていた · WRITE のみ認証 |
| **API / CORS / nginx** | `api.it-hercules.uk` 直叩き · `test_cors.py` |
| **検索スコープ A** | 人間ゲート解消 · API/UI はカタログ横断（`test_observation_search_scope_a_returns_all_owners`） |

---

## 止まっているところ

| 問題 | 詳細 |
|------|------|
| ~~未ログイン観測検索 401~~ | **修正済み（2026-07-03）** — [`backlog/2026-06-27-tomorrow.md`](./backlog/2026-06-27-tomorrow.md) |
| **parity C4 README** | ~~12 mismatch~~ → **PASS**（claims パス修正済み） |
| **magic link メール** | 設計 GO（2026-07-03）— 本番 SMTP 鍵投入は未実施 |
| **PT ショップ UI polish** | 意図的延期 |
| **mine/public UI チップ** | Scope A 確定済み · 将来 `visibility` 列追加時に再検討 |
| **観測画像 性能・コスト** | 表示は動作するが **遅い**（N+1 blob fetch · フルサイズ · キャッシュなし）— 改善計画: [`backlog/image-perf-and-cost.md`](./backlog/image-perf-and-cost.md) |

---

## 次の 3 タスク

1. **観測画像 性能 Phase 0** — Scope A 公開 READ を活かしネイティブ `<img>` へ（計画: [`backlog/image-perf-and-cost.md`](./backlog/image-perf-and-cost.md)）
2. **`test_csv_import.py` 修復** — SwitchBot CSV fixture 2 件
3. **VPS / Pages 再デプロイ** — `main` push 後 docker compose + CF Pages（観測 READ 認証免除反映）

---

## 人間ゲート（AI 完走不可）

| ゲート | 内容 | 参照 |
|--------|------|------|
| **GMO 本番入金** | 実入金・本番証跡 | civ-os `P0-NEXT-GMO-LIVE-EXEC` |
| ~~**mock 最終目視**~~ | UX ウォークスルー | **GO 2026-07-03** — [`HUMAN-GATE-GO-2026-07-03.md`](./HUMAN-GATE-GO-2026-07-03.md) |
| ~~**#02 法務（設計進行）**~~ | 条文正本は人間 · 設計→IMPL は GO | 同上 |
| ~~**ver4 設計→IMPL**~~ | Workers 主 API 実装波着手可 · **本番 cutover 未** | [`ver4-infra-agreement.md`](../ver4-infra-agreement.md) |
| ~~**SMTP 設計→IMPL**~~ | magic link 実装波着手可 · **本番鍵未** | [`ver3-deploy-runbook.md`](../ver3-deploy-runbook.md) |
| **magic link SMTP 本番** | VPS または外部 SMTP の鍵・送信ドメイン設定 | 同上 |
| **certbot / nginx 上書き** | 既存 `ihl-api.conf` を certbot が置換する際の手動確認 | [`vps-api-deploy.md`](../vps-api-deploy.md) |
| **ver4 本番 cutover** | DNS · ロールバック実行 | [`VER4-VPS-MINIMAL-SPEC.md`](./quantum/VER4-VPS-MINIMAL-SPEC.md) |

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
