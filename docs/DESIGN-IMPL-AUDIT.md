# IHL 設計↔実装監査

> **更新**: 2026-07-03  
> **機械ゲート**: `node scripts/ihl-design-impl-parity-check.mjs`  
> **正本 repo**: `it-hercules-laboratory-clean`

---

## 実行結果（2026-07-03）

| 検査 | 結果 | 備考 |
|------|------|------|
| `ihl-design-impl-parity-check.mjs` | **PASS**（24 features · 0 FAIL） | `design-impl-claims.json` をルート相対パスに修正（2026-07-03） |
| `pytest -q` | **329 passed · 2 failed · 1 skipped** | 失敗: `test_csv_import.py` 2 件（SwitchBot CSV fixture · 本バッチ非起因） |
| `apps/web npm test` | 本バッチ後に実行 | `useAuthSession.test.ts` 追加 |

**ブロック要因（parity）**: 解消済み（claims パス修正）。残: `test_csv_import.py` 2 件。

---

## 機能別サマリー

| 領域 | 状態 | 根拠 |
|------|------|------|
| **#00 土台** | aligned | parity PASS |
| **#01 ログイン** | **aligned**（ver3） | magic link · verify · session · middleware · **AppShell 導線追加（本バッチ）** |
| **#02 利用規約** | aligned | `/terms` · agree API |
| **#03 新規登録** | aligned | `/register` · login 逆導線追加 |
| **#05 観測 ver2** | aligned | 検索 POST · フィルタ · 空状態 |
| **#05 観測 ver3** | **partial** | 本番 blob 画像 · API 直叩き OK · **検索スコープ API 未実装**（`scope: mine/public/all`） |
| **#05 観測入力** | **partial→改善** | `u_demo` → `useActorId()` 連携（本バッチ）· バックエンド既定 `u_demo` は dev 用のまま |
| **#06–#23** | partial（OSS ギャップ） | [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](02-設計/_横断/00-OSS機能ギャップ表-v1.md) 参照 |
| **ver3 インフラ** | aligned | `api.it-hercules.uk` · CORS · nginx テンプレ |
| **ver4 インフラ** | missing | ADR-H-33 草案 · 未着手 |

---

## 既知ギャップ（本バッチ対象）

### ログイン / ナビ導線（P1）— **実装済み**

- **症状**: `/login` · `/register` 到達不能
- **対応**: `AppShell` に未認証時 Link · 認証済み actor 表示 + ログアウト · `useAuthSession` hook
- **残**: 本番 `IHL_WEB_AUTH_BYPASS` 意図確認（人間ゲート）

### 観測検索スコープ（P2）— **部分実装**

- **API**: `observation_search` はセッション actor で絞らない（カタログ横断）
- **フロント**: 検索リクエストに owner なし（意図どおり広い結果）
- **データ分断**: commit / 個体 / 命名の `u_demo` 固定 → **`useActorId()` で session 連携**（本バッチ）
- **未確定（人間）**: プロダクト方針 `mine | public | all` · parquet に `owner_user_id` / `visibility` 追加
- **既定採用（暫定）**: ログイン時は session `actor_id` で書き込み · 検索は API 既存どおり **全件マージ**（スコープ UI は後追い）

---

## 次の監査アクション

1. `test_csv_import.py` 2 件の fixture 修復
2. 検索スコープ方針確定後 · `observation_search` + UI チップ
3. GitHub Actions: pytest + web test/build

---

*伴走 Skill: `.cursor/skills/ihl-design-impl-audit`（civ-os 側）· 週次 Automation は [`05-運用/automation/IHL-伴走監査-週次.md`](05-運用/automation/IHL-伴走監査-週次.md)*
