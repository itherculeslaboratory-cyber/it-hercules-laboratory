# 27 ランニングコスト透明性 — 機能要件定義（v1-DRAFT）

> **ステータス**: DRAFT — 人間レビュー待ち。設計ゲート未通過。  
> **Changelog**:  
> - 2026-06-18 — 初版作成（ユーザー項目 9: Sakura VPS + R2 コスト表示）  
> - 2026-06-18 — **ユーザー確定**: 全ログインユーザー閲覧可 · D-MVP-06 §AI仮定 確定  
> **用途**: 人間レビュー・設計 AI 引き継ぎ用。  
> **非正本**: 採用・実装判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/` を優先。

---

> **IHL 読み替え**: 本文の実装は **IHL rebuild**（civilization-os は legacy 参照）。  
> 正本: `01-要件/README.md` · `_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §27  
> 依存: `00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §9 D-MVP-06（**§AI仮定 確定**）

---

## §0 ユーザー確定（2026-06-18）

| 確定項目 | 内容 |
|---------|------|
| **閲覧権限** | **全ログインユーザー**がコストダッシュボードを閲覧できる |
| **前提** | IHL アプリ全体が **login-gated** のため、未認証ユーザーは到達不可（追加の public ページ分離は不要） |
| **データ取得** | Sakura VPS **月次手動入力** + Cloudflare R2 usage **API 自動取得**（D-MVP-06 確定） |

---

## ① 機能概要

ランニングコスト透明性機能は、**Sakura VPS（サーバー費用）** と **Cloudflare R2（ストレージ費用）** の現在の費用を**ダッシュボードで可視化**する機能である。

**目的**: 運営者（プロジェクトオーナー）が月次コストを把握し、プラットフォームの持続可能性を管理できるようにする。加えて、**全認証ユーザー**に運営コストの透明性を示す（login-gated アプリ内）。

---

## ② ユーザーができること

| ロール | できること |
|--------|-----------|
| **全認証ユーザー** | `/costs`（または `/about/costs`）で月次コストサマリー（Sakura VPS + R2 合計）を閲覧できる |
| **admin（運営者）** | Sakura VPS 費用・R2 使用量の**入力・更新**（手動入力 + API リフレッシュ）ができる |
| **admin（運営者）** | コストデータの取得バッチを手動トリガーできる |

---

## ③ スコープ境界

### スコープ内（v1）

- Sakura VPS 費用の**手動入力**（月額固定料金を設定ファイル or 管理画面で更新）— **§AI仮定 確定**（D-MVP-06）
- Cloudflare R2 使用量の**API 取得**（`GET /api/costs/r2-usage`）— **§AI仮定 確定**
- 月次コストサマリーの**ダッシュボード表示**（`/costs` — **全認証ユーザー閲覧**）
- コスト履歴の **R2 append-only 保存**（`world/admin/costs/{month}.json`）
- 管理画面（`/admin/costs`）— admin のみ入力・更新

### スコープ外（v1 → Phase 2）

| 項目 | 扱い |
|------|------|
| Sakura VPS コントロールパネル API からの**自動取得** | Phase 2（API 仕様確認後 ADR）|
| 他クラウド（AWS・GCP）コスト統合 | Phase 3 |
| コストアラート（閾値超過通知） | Phase 2 |
| 予算管理・コスト予測 | Phase 3 |
| Cloudflare Workers / Pages / D1 費用 | Phase 2 |

---

## ④ 機能要件（FR-COST-*）

### 4.1 Sakura VPS 費用

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-COST-01 | Sakura VPS の月額費用を管理画面（`/admin/costs/edit`）から手動入力できる | 入力後に R2 `world/admin/costs/{YYYY-MM}.json` に INSERT される | 費用項目: `vps_monthly_jpy`（円） |
| FR-COST-02 | Sakura VPS の費用は**設定ファイル**（`config/running-costs.json`）でデフォルト値を持ち、管理画面入力が優先される | 設定ファイルに `vps_monthly_jpy` がある | §AI仮定: デフォルト月額 ¥4,000（2026年 Sakura VPS 標準プラン参考） |
| FR-COST-03 | 将来の Sakura VPS API 統合に備え、費用オブジェクトに `source`（`manual` / `api`）フィールドを持つ | JSON に `source: "manual"` が含まれる | Phase 2 で `api` に切り替え可能な設計 |

### 4.2 Cloudflare R2 使用量

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-COST-04 | Cloudflare R2 の使用量（ストレージ GB・Class A オペレーション数・Class B オペレーション数）を Cloudflare API から取得できる | `GET /api/costs/r2-usage` が使用量 JSON を返す | Cloudflare API token の認証スコープ: `Zone:Read`（§AI仮定） |
| FR-COST-05 | R2 使用量から月次費用を**自動計算**する（§AI仮定: Cloudflare R2 料金表に基づく換算式） | 計算結果が `r2_monthly_estimate_usd` として保存される | |
| FR-COST-06 | R2 使用量の取得は**バッチ**（1日1回）または管理画面からの手動リフレッシュで実行する | バッチ完了後に R2 コスト JSON が更新される | |
| FR-COST-07 | Cloudflare API キー未設定の場合、R2 使用量は「手動入力」モードで代替できる | 手動入力フォームで `r2_storage_gb` を入力可能 | |

### 4.3 ダッシュボード（全認証ユーザー閲覧）

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-COST-08 | `/costs` ダッシュボードに月次コストサマリー（Sakura VPS + R2 合計）を**全認証ユーザー**が閲覧できる | ログイン後に月次合計 JPY が表示される（USD→JPY 換算は固定レートまたは外部 API） |  USD→JPY: 固定レート `150` JPY/USD（§AI仮定。変更可） |
| FR-COST-09 | 月次コスト推移グラフ（直近 12 ヶ月）を表示する | グラフが表示される。空状態（データなし）は「データ未入力」と表示 | グラフライブラリ: Recharts（§AI仮定・IHL rebuild で採用候補） |
| FR-COST-10 | コスト履歴は R2 `world/admin/costs/{YYYY-MM}.json` に **INSERT ONLY** で保存する | 既存月データを上書きせず、新バージョンとして追記する | |
| FR-COST-11 | 空状態・ローディング・エラーをユーザー向け文言で表示する（DoD U-*） | 「費用データ未入力です。管理画面から入力してください」等 | |

### 4.4 管理画面（admin のみ）

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-COST-12 | `/admin/costs` で admin が Sakura VPS 手動入力・R2 リフレッシュ・バッチ手動実行ができる | admin role のみアクセス可 | |
| FR-COST-13 | `/admin/costs/edit` に「このプロジェクトの運営費用について」の説明文編集フィールドを置く | 説明文が `/costs` に表示される | 説明文は設定ファイルで管理 |

---

## ⑤ 非機能要件

| ID | 要件 |
|----|------|
| NFR-COST-01 | R2 INSERT ONLY（月次コスト JSON の UPDATE/DELETE 禁止） |
| NFR-COST-02 | Cloudflare API キー・Sakura VPS 認証情報はリポジトリに含めない（`.env` 管理） |
| NFR-COST-03 | **閲覧**: 全認証ユーザー（`/costs`）。**編集**: admin ロールのみ（`/admin/costs`）。アプリ全体 login-gated のため未認証は到達不可 |
| NFR-COST-04 | 外部 API（Cloudflare）呼び出し失敗時は前回取得値をキャッシュとして表示し、エラー文言を添える |

---

## ⑥ MiniKernel / C-USB 上の位置づけ

```text
World
 └── FeatureNode: admin（新規）
      ├── Component: CostDashboard（View 層）
      ├── Component: CostDataFetcher（Process 層 · Cloudflare API + 手動入力）
      └── Connector: Cloudflare API（X 層）, Sakura VPS（将来 X 層）

ITO:
  IN（Cloudflare API 使用量 JSON + 手動入力 JPY）
    → Transform（費用計算・USD→JPY 換算）
    → OUT（R2 world/admin/costs/{YYYY-MM}.json + ダッシュボード表示）
```

---

## ⑦ データ契約概要（§AI仮定）

```json
// world/admin/costs/2026-06.json（バージョン追記型）
{
  "month": "2026-06",
  "vps_monthly_jpy": 4000,
  "vps_source": "manual",
  "r2_storage_gb": 12.5,
  "r2_class_a_ops": 150000,
  "r2_class_b_ops": 2500000,
  "r2_monthly_estimate_usd": 0.38,
  "r2_source": "cloudflare_api",
  "usd_to_jpy_rate": 150,
  "total_monthly_jpy": 4057,
  "is_public": false,
  "version": 1,
  "updated_at": "2026-06-18T12:00:00Z",
  "run_id": "run_cost_20260618",
  "schema_version": "1.0"
}
```

### Cloudflare R2 料金換算式（§AI仮定 · 2026年 Cloudflare 公式価格表参考）

| 項目 | 料金 | 備考 |
|------|------|------|
| ストレージ | $0.015 / GB・月 | 最初 10GB 無料 |
| Class A オペレーション | $4.50 / 100万回 | PUT, POST, LIST |
| Class B オペレーション | $0.36 / 100万回 | GET, HEAD |

```
r2_monthly_estimate_usd =
  max(0, storage_gb - 10) * 0.015
  + (class_a_ops / 1_000_000) * 4.50
  + (class_b_ops / 1_000_000) * 0.36
```

> **注意**: 料金は変更される可能性があります。実装時に最新の Cloudflare 料金表を確認してください。

---

## ⑧ IHL repo との関係

| 区分 | 内容 |
|------|------|
| **IHL new** | `apps/api/routes/costs.py`・`apps/web/admin/CostDashboard.tsx`・`apps/api/jobs/r2_usage_fetch.py` |
| **shared** | `world/admin/` R2 キー空間（admin 系共通） |
| **civilization-os** | legacy はコスト管理機能なし。IHL 側で新設 |

---

## ⑨ 未確定・ギャップ

| ID | 論点 | AI仮定値 / 確定値 | 確認要否 |
|----|------|---------|---------|
| D-COST-01 | Sakura VPS コントロールパネル API の存在確認 | **v1 は月次手動入力**（§AI仮定 確定 · D-MVP-06）。API 自動化は Phase 2 | **クローズ** |
| D-COST-02 | Cloudflare R2 Usage API のエンドポイント・認証スコープ | `Zone:Read` スコープ（§AI仮定） | **ブロッカー外**（ドキュメント確認） |
| D-COST-03 | USD→JPY 換算レート | 固定 150 JPY/USD（§AI仮定） | **ブロッカー外**（変更可） |
| D-COST-04 | コスト閲覧の対象: 全ユーザー公開 vs ログイン必須 | **確定 (2026-06-18)**: ログイン済み全ユーザー閲覧可。アプリ全体がログインゲートのため login = 事実上の全参加者。未ログイン公開 `/transparency/costs` は **Phase 2 検討** | **確定** |

> **ブロッカーなし** — D-COST-01 は D-MVP-06 確定により手動入力で v1 確定。D-COST-04 はユーザー確定済み。

---

## ⑩ 設計ゲートステータス

| # | 成果物 | ステータス |
|---|--------|------------|
| 1 | 要件定義 | **DRAFT（本ファイル）** |
| 2 | 詳細設計 | 未着手 |
| 3 | 遷移設計 | 未着手 |
| 4 | UI 設計 | 未着手（Recharts グラフ・管理画面レイアウト） |
| 5 | テスト設計 | 未着手 |

---

## ⑪ 設計 AI 参照順

1. 本ファイル（コスト透明性方針）
2. `26-サンドボックス環境-v1-DRAFT.md` — Sakura VPS 同居可能スペック確認と連動
3. `00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §9 D-MVP-06（§AI仮定 確定）
4. Cloudflare R2 公式ドキュメント（料金表・API）
5. `_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §27

---

*DRAFT・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
