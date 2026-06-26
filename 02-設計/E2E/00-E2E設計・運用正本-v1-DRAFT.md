# 00 — IHL E2E 設計・運用正本 v1

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **関連**: `21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` §7 · `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`  
> **実装**: 5 点ゲートが人間確定するまで禁止  
> **Changelog**: 2026-06-18 — §3 入力正本（`01-要件/0X`）・05/06 パターン・追加仕様反映手順を追記

---

## §1 — 目的・位置づけ

本文書は IT Hercules Laboratory（IHL）の **E2E テスト設計の正本**として機能する。  
各機能（FeatureNode）の E2E 仕様書（`NN-機能名-E2E-v1-DRAFT.md`）はすべて本文書の規約に従う。

### E2E の役割

| 役割 | 内容 |
|------|------|
| **受け入れ基準** | 実装前に「何が通れば完成か」を定義する（テスト先書き原則）|
| **REQ トレーサビリティ** | 要件 ID → シナリオ ID の対応を RTM で管理する |
| **CI ゲート** | Playwright が緑にならないと Wave 完了とみなさない |
| **人間ゲートの前提** | Tier D（手動打鍵）の前に Tier B E2E が全通過していること |

---

## §2 — ティア体系

| Tier | 名称 | 担当 | 実行タイミング |
|------|------|------|--------------|
| **A** | route-matrix（全画面 200 OK + CTA 表示） | 自動 | 全 PR |
| **B** | 機能別 E2E（入力→実行→保存・主要分岐） | 自動 | Wave 完了 + 全 PR |
| **C** | アクセシビリティ（axe-core · Tab 到達） | 半自動 | Wave 完了 |
| **D** | 全 path 手動打鍵（迷わない・戻れる・回復） | **人間のみ** | リリース前 |

**Tier B が本文書の主対象**。Tier A は route-matrix スクリプトで別管理。

### HQ-07 — Tier B 実装優先度（**✅ 確定 · 2026-06-18**）

| 順位 | 機能 | Playwright project（予定）| 根拠 |
|------|------|--------------------------|------|
| 1 | **観測 (#05)** | `obs-e2e` | 旗艦 5 ステップ · 13 シナリオ設計済み · W3 完了ゲート |
| 2 | **マーケット (#06)** | `mkt-e2e` | 17 シナリオ · 収益・取引 Stage フロー |
| 3 | **カルマ (#08)** | `kma-e2e` | 横断信頼スコア · マーケット/掲示板の前提 |
| 4 | **ホーム (#04) + 掲示板 (#07)** | `home-e2e` · `bbs-e2e` | 司令塔 + コミュニティ導線 · Discourse ブリッジ確定後に bbs 追加 |

**Tier A（route-matrix）** は全機能より先に全 PR で走る。**Tier B** は上表順で Wave 完了ごとに CI project を追加する。PT マーケット (#22) は W7 経済 wave 後に Tier B 追加検討。

---

## §3 — REQ → E2E 導出プロセス

### 入力正本

| 種別 | 正本パス | 備考 |
|------|---------|------|
| **機能要件** | **`01-要件/0X-*.md`**（`NN-*.md`）| **STUB E2E 拡張の一次入力**。`機能一覧/要件定義/0X` は移行済み・参照禁止 |
| **横断 UI/E2E** | `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` | `#21` のみ旧フォルダ残留 |
| **詳細・遷移・UI** | `02-設計/features/NN-*/` | シナリオ手順・画面状態の補足（REQ が主）|

### 導出フロー（05/06 確立パターン）

```
01-要件/NN-機能名.md（FR-*, NFR-*）  ← 正本。機能一覧/要件定義/0X は使わない
    ↓ 参照（任意）
02-設計/features/NN-*/（詳細設計-v2 · 遷移設計-v1 · ui/）
    ↓ REQ ごとに
02-設計/E2E/NN-*-E2E-v1-DRAFT.md — シナリオ表（§4 形式）: Happy Path + 分岐 + Negative
    ↓
RTM 表（REQ ID × Scenario ID）
    ↓ Phase 7 実装後
Playwright .spec.ts（data-testid ベース）
    ↓
CI ゲート（npx playwright test）
```

**参照実装**: [`05-観測-E2E-v1-DRAFT.md`](./05-観測-E2E-v1-DRAFT.md)（REQ=`01-要件/05-観測.md`）· [`06-マーケット-E2E-v1-DRAFT.md`](./06-マーケット-E2E-v1-DRAFT.md)（REQ=`01-要件/06-マーケット.md`）。  
**STUB 拡張対象**: `04`/`07`/`08`/`22` 等 — 同手順で `01-要件/NN-*.md` から埋める。

**Rule**: REQ に記述された全ての受入基準は、対応するシナリオ ID を持たなければならない。  
**Rule**: 未対応 REQ は RTM に `—（TODO）` で明記し、次 Wave 前に解消する。  
**Rule**: ユーザー「追加仕様」は [`01-要件/README.md`](../../01-要件/README.md) の **追加仕様反映手順** で REQ に反映してから E2E を更新する。

---

## §4 — シナリオ標準フォーマット

```
### SC-NN-XXX-NN: シナリオ名

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-XXX-NN, UI-REBUILD-OBS-NN |
| **Tier** | B |
| **前提条件** | ログイン済み・種族コンテキスト設定済み 等 |
| **手順** |
| | 1. /observation/context を開く |
| | 2. 分類ツリーで「*Dynastes hercules hercules* (DHH)」を選択 |
| | 3. ... |
| **Assertion** |
| | - data-testid="obs-bulk-fetch" が visible かつ enabled |
| | - StatusStrip に「フェッチ完了」が表示 |
| | - R2 INSERT の POST が 201 |
| **Negative Branch** | API 500 → ErrorBoundary 表示・再試行ボタン visible |
| **data-testid** | obs-ctx-confirm, obs-bulk-fetch, obs-photo-capture 等 |
| **CI job** | `npx playwright test --project=obs-e2e` |
```

---

## §5 — data-testid 命名規則

### 形式

```
{feature}-{scope}-{element}[-{variant}]
```

| セグメント | 規則 | 例 |
|-----------|------|-----|
| `{feature}` | 機能 ID（2 文字）| `obs`, `mkt`, `bbs`, `kma`, `pt` |
| `{scope}` | 画面/フロー名 | `ctx`, `input`, `confirm`, `browse`, `detail` |
| `{element}` | 操作対象 | `btn`, `input`, `card`, `form`, `strip` |
| `{variant}` | バリアント（任意）| `bulk-fetch`, `photo-capture`, `auction` |

### 機能別 Prefix 一覧

| Prefix | 機能 | 例 |
|--------|------|-----|
| `obs-` | 観測（#05）| `obs-ctx-confirm`, `obs-bulk-fetch`, `obs-photo-capture` |
| `mkt-` | マーケット（#06）| `mkt-browse-tab-auction`, `mkt-bid-submit`, `mkt-listing-create` |
| `bbs-` | 掲示板（#07）| `bbs-thread-post-btn`, `bbs-comment-input` |
| `kma-` | カルマ（#08）| `kma-score-display`, `kma-history-list` |
| `pt-` | PT マーケット（#22）| `pt-balance-display`, `pt-send-btn` |
| `home-` | ホーム（#04）| `home-obs-cta`, `home-market-cta` |
| `auth-` | 認証（#01/#03）| `auth-login-btn`, `auth-logout-btn` |

### 固定 testid（UIリビルド要件 §7.4 より）

| testid | 場所 | 用途 |
|--------|------|------|
| `obs-bulk-fetch` | 観測入力（05i）| [一括取得] ボタン |
| `obs-photo-capture` | 観測入力（05i）| [写真撮影] ボタン |
| `obs-register-submit` | 観測確認（05confirm）| [登録] ボタン |
| `mkt-listing-channel-[type]` | マーケット出品 | チャネル選択（fixed/auction/lottery/priority/template）|

---

## §6 — CI 統合

### npm スクリプト（予定）

```json
{
  "test:e2e": "playwright test",
  "test:e2e:obs": "playwright test --project=obs-e2e",
  "test:e2e:mkt": "playwright test --project=mkt-e2e",
  "test:e2e:route-matrix": "playwright test --project=route-matrix",
  "test:e2e:smoke": "playwright test --grep @smoke"
}
```

### Playwright projects 設計（予定）

| project | 対象 | 実行条件 |
|---------|------|---------|
| `route-matrix` | 全画面 200 OK（Tier A）| 全 PR |
| `obs-e2e` | 観測 E2E（Tier B）| Wave W3 完了後 |
| `mkt-e2e` | マーケット E2E（Tier B）| Wave W6 完了後 |
| `kma-e2e` | カルマ E2E（Tier B）| Wave W6 完了後（HQ-07 第3優先）|
| `home-e2e` | ホーム E2E（Tier B）| Wave W2 完了後（HQ-07 第4優先）|
| `bbs-e2e` | 掲示板 E2E（Tier B）| Wave W5 完了後（HQ-07 第4優先）|

### ゲート条件（Wave 完了定義）

```
[ ] tsc --noEmit エラー 0
[ ] vitest run PASS
[ ] Playwright route-matrix PASS
[ ] Playwright 該当機能 E2E PASS（最低 Happy Path + 主要 Negative）
[ ] Tier D（MANUAL-KB）は人間のみ — AI は [x] にしない
```

---

## §7 — 機能別 E2E 文書インデックス

| ドキュメント | 機能 | ステータス |
|-------------|------|-----------|
| [`03-認証-E2E-v1-DRAFT.md`](./03-認証-E2E-v1-DRAFT.md) | 認証（#01/#03）| DRAFT — Skeleton（W1） |
| [`05-観測-E2E-v1-DRAFT.md`](./05-観測-E2E-v1-DRAFT.md) | 観測（#05）| DRAFT — 詳細記述済み（13 件） |
| [`06-マーケット-E2E-v1-DRAFT.md`](./06-マーケット-E2E-v1-DRAFT.md) | マーケット（#06）| DRAFT — 詳細記述済み（17 件） |
| [`04-ホーム-E2E-v1-DRAFT.md`](./04-ホーム-E2E-v1-DRAFT.md) | ホーム（#04）| DRAFT — 詳細記述済み（5 件） |
| [`07-掲示板-E2E-v1-DRAFT.md`](./07-掲示板-E2E-v1-DRAFT.md) | 掲示板（#07）| DRAFT — 詳細記述済み（10 件 · 2026-06-18） |
| [`KN-知の広場-E2E-v1-DRAFT.md`](./KN-知の広場-E2E-v1-DRAFT.md) | 知の広場 Hub（#07·09·24）| DRAFT — 詳細記述済み（18 件 · 2026-06-18） |
| [`24-記事・ブログ-E2E-v1-DRAFT.md`](./24-記事・ブログ-E2E-v1-DRAFT.md) | 記事・ブログ（#24）| DRAFT — 詳細記述済み（10 件 · 2026-06-18） |
| [`08-カルマ-E2E-v1-DRAFT.md`](./08-カルマ-E2E-v1-DRAFT.md) | カルマ（#08）| STUB — TODO expand |
| [`22-プラチナコイン-E2E-v1-DRAFT.md`](./22-プラチナコイン-E2E-v1-DRAFT.md) | PT マーケット（#22）| STUB — TODO expand |

---

## §8 — テストデータ・フィクスチャ規則

| 規則 | 内容 |
|------|------|
| **seed ユーザー** | `test-user-obs@ihl.local`（観測テスト用）· `test-user-mkt@ihl.local`（マーケット用）|
| **R2 mock** | E2E では R2 INSERT を MSW または Playwright mock で interceptしてテスト用バケットに書く |
| **GMO 本番鍵** | E2E では必ず mock。本番鍵は CI 環境変数・人間ゲート |
| **観測テンプレ** | E2E 用「E2E-Standard-Male-Template」を seed データに含める |
| **マーケット出品** | E2E 用 chunk_id `test-chunk-e2e-001`（固定価格・オークション各 1 件）を seed に用意 |

---

## §9 — RTM（要件 × シナリオ）管理規則

各機能の E2E 文書内に RTM 表を置く。フォーマット：

| REQ ID | REQ 内容（要約）| Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-XXX-01 | ○○を○○できる | SC-05-SOL-01 | TODO |

**ステータス**:
- `TODO` — シナリオ設計未着手
- `DESIGNED` — 設計文書に記述済み
- `IMPLEMENTED` — `.spec.ts` 実装済み
- `GREEN` — CI 緑
- `N/A` — UI テスト対象外（backend 単体テストで担保）

---

## §10 — 未確定・人間確認事項

### 親要件（21）HQ トラッカー連携

> 正本: [`21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md`](../../機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md) §10

| 番号 | ステータス | 確定内容 / 未確定事項 |
|------|-----------|---------------------|
| HQ-01 | **確定** | Next.js 15 + shadcn/ui |
| HQ-02 | **確定** | Option A — api layer + observation/lineage hooks 移植 · `civUi.css` + 旧 UI JSX 廃棄 |
| HQ-03 | **確定** | **DHH = *Dynastes hercules hercules***（E2E seed・分類ツリーは本学名を正とする）|
| HQ-04 | **確定** | [一括取得] と [写真撮影] は両方 primary |
| HQ-05 | **確定** | **W3 にテンプレ統合** — W3=05ctx/05a/05b/05i/obs.confirm/05tl/05td/05t。旧 W4 観測テンプレ Wave 廃止 |
| HQ-06 | **確定** | **ThemePack-light + ThemePack-dark** 2 パック。pack 別 CSS 変数。ユーザー切替 or `prefers-color-scheme`。UI Builder 両 pack 編集 or 単一 pack セレクタ。`preferences.md` §B（lineage dark）と §A（コア light 維持可）を 2 パックで両立 |
| HQ-07 | **確定** | Tier B 優先度: **①観測 ②マーケット ③カルマ ④ホーム・掲示板**（Wave 完了順と CI project 追加順に整合）|
| HQ-08 | **確定 — ギャップあり** | 観測 5 ステップ × デュアルプライマリの mock **未充足**（P0 不足 6 枚）。[`mock-gap-RTM-観測-v1-DRAFT.md`](../_ui-global/mock-gap-RTM-観測-v1-DRAFT.md) |
| HQ-09 | **確定** | 親要件（21）v1.0 は **Phase 1 完了後**に格上げ。本文書（E2E 正本）は Phase 7 設計完了後に v1.0 想定 |

> **E2E への影響（HQ-06）**: Phase 7 で light/dark 切替後の route-matrix・主要画面スナップショット比較を Tier B/C に追加検討（詳細は Phase 3 ThemePack 仕様確定後）。

### E2E 固有（HQ-E2E-*）

| 番号 | 確認事項 | 推奨タイミング |
|------|---------|--------------|
| HQ-E2E-01 | Playwright base URL（localhost:3000 固定か、CI 環境変数か）| Phase 7 設計前 |
| HQ-E2E-02 | R2 テスト用バケット名（`it-hercules-laboratory-e2e` か）| Phase 0 完了後 |
| HQ-E2E-03 | E2E シードデータの投入方法（migration スクリプト vs Playwright global setup）| Phase 7 |
| HQ-E2E-04 | GMO webhook E2E mock の方式（MSW / wiremock / Playwright mock）| Phase 7（#23 担当）|

---

*DRAFT · 人間レビュー後に「v1.0 確定」に格上げ · 実装禁止ゲート有効 · 2026-06-18 · **HQ-01〜09 すべて確定***
