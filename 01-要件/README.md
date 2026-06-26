# 01-要件 — 凍結 FR 正本（#00–#23）

> **ステータス**: **正本**（Phase 2 移行完了 · 2026-06-10）  
> **構成設計**: [`05-運用/queues/00-フォルダ構成-v1.md`](../05-運用/queues/00-フォルダ構成-v1.md)  
> **Changelog**:  
> - 2026-06-18 — Phase 1 入力正本・追加仕様反映手順を追記  
> - 2026-06-18 — 用語 glossary（Phase / ver1 / Wave）  
> - 2026-06-18 — **確定記録**: `#24`〜`#27` DRAFT ファイル一覧追加・ユーザー確定項目（MVP v1 観測 First・Sandbox Realm・コスト全ログイン閲覧）を反映

---

## 用語（1 行 glossary）

| 用語 | 意味 |
|------|------|
| **Phase 0〜7** | UI 再構築の**工程**（HOW）。Phase 7 完了 = 対象スコープが shippable。正本: [`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](../02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) |
| **ver1（MVP v1）** | 初回**出荷スコープ**（WHAT）。観測 MVP（データ·写真·詳細·親個体·QR）。#06/#10/#11 は OUT。正本: [`00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](./00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.5 |
| **ver1 shippable** | ver1 スコープに Phase 0〜7 + DoD/E2E/Tier D（in-scope）を満たした状態 — **全 27 機能完成ではない** |
| **Wave（W0〜）** | Phase 6 内の実装バッチ順 — ver1 外 Wave が表にあっても ver1 判定外 |
| **FR-EXT mini Phase** | post-ver1 機能追加用の縮小 5 点ゲート — **Phase 0〜7 とは別番号** |

---

## 正本の位置づけ

| 種別 | 正本パス | 旧パス（参照禁止）|
|------|---------|------------------|
| **機能要件 FR/NFR（#00–#23）** | **本フォルダ** `01-要件/0X-*.md` | ~~`機能一覧/要件定義/0X-*.md`~~（移行済み）|
| **横断 UI/E2E（#21）** | [`機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md`](../機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md) | `#21` のみ旧フォルダに残留 |
| **詳細・遷移・UI 草案** | [`02-設計/features/NN-*/`](../02-設計/features/README.md) | `詳細設計-v2.md` · `遷移設計-v1.md` · `ui/` |
| **E2E 仕様** | [`02-設計/E2E/`](../02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md) | `01-要件/NN-*.md` から導出（`05`/`06`=詳細済み、他=STUB→拡張）|

**Phase 1（UI 再構築）での使い方**: `01-要件/0X-*.md` が **STUB E2E 拡張の一次入力**。`#05` 観測 · `#06` マーケットと同型で、各 FR の受入基準 → `02-設計/E2E/NN-*-E2E-v1-DRAFT.md` のシナリオへ展開する。ウォーターフォール計画: [`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](../02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) Phase 1。

---

## このフォルダに置くもの

| 種別 | 例 |
|------|-----|
| 凍結要件（FR のみ） | `00-土台-MiniKernel-C-USB-コンポーネント.md` · `01-ログイン.md` … `23-GMO銀行振込判定.md` |
| 新規 DRAFT 要件（#24〜） | `24-記事・ブログ-v1-DRAFT.md` · `25-AI要約-GitHub掲示板-v1-DRAFT.md` · `26-サンドボックス環境-v1-DRAFT.md` · `27-ランニングコスト透明性-v1-DRAFT.md` |
| 横断方針 | [`00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](./00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) — MVP v1 スコープ（確定）・拡張安全枠・コンテンツ三体ナビ |
| 横断索引 | [`_横断/FEATURE-REQUIREMENTS-INVENTORY.md`](./_横断/FEATURE-REQUIREMENTS-INVENTORY.md) |

### 新規 DRAFT 要件ステータス（#24〜#27）

| # | ファイル | 設計 | ユーザー確定 |
|---|---------|------|------------|
| 24 | [`24-記事・ブログ-v1-DRAFT.md`](./24-記事・ブログ-v1-DRAFT.md) | DRAFT | 論文 #09 との共通スキーマ方針 確定 |
| 25 | [`25-AI要約-GitHub掲示板-v1-DRAFT.md`](./25-AI要約・GitHub掲示板-v1-DRAFT.md) | DRAFT | 掲示板要約バッチ + GitHub 改善板 2 系統 確定 |
| 26 | [`26-サンドボックス環境-v1-DRAFT.md`](./26-サンドボックス環境-v1-DRAFT.md) | DRAFT | **Personal Sandbox Realm 設計 確定** · 全認証ユーザー · 改善テンプレート Promote pipeline |
| 27 | [`27-ランニングコスト透明性-v1-DRAFT.md`](./27-ランニングコスト透明性-v1-DRAFT.md) | DRAFT | **ログイン済み全ユーザー閲覧可 確定** |

**置かないもの**: 詳細設計 · 遷移 · UI · ADR · 監査 · Batch 計画 → [`02-設計/`](../02-設計/features/README.md) または [`05-運用/`](../05-運用/queues/)

---

## Phase 1 ワークフロー（REQ → 設計 → E2E）

```
1. 01-要件/0X-*.md を読む（FR/NFR · 受入基準）
        ↓
2. 02-設計/features/NN-*/ を参照（詳細・遷移・UI 草案があればギャップ照合）
        ↓
3. Phase 1 RTM: mock（ihl-*.png）× 01-要件 FR ID
        ↓
4. 02-設計/E2E/NN-*-E2E-v1-DRAFT.md を更新（05/06 パターン）
        ↓
5. 04-トレーサ/features/NN-*/RTM-v1.csv を同期
        ↓
6. HQ-09: Phase 1 完了後に人間レビュー → v1.0 格上げ
```

---

## 追加仕様反映手順

ユーザーがチャットまたは markdown で提示する **追加仕様** を本フォルダへ反映する手順。

| 手順 | 担当 | 内容 |
|------|------|------|
| **1. 受領** | ユーザー | 追加仕様をチャットまたは markdown で提示（対象機能・意図が分かる粒度）|
| **2. マッピング** | AI | 対象 `01-要件/NN-*.md` と既存 FR ID（`FR-*` / `NFR-*` / `OBS-*` 等）を特定。新規なら次番 ID を採番 |
| **3. REQ 更新** | AI | 該当 `01-要件/NN-*.md` に追記・改訂（凍結後は **CR 経由** — [`00-Vモデル実行計画-v1.md`](../05-運用/queues/00-Vモデル実行計画-v1.md) §1）|
| **4. RTM 同期** | AI | `04-トレーサ/features/NN-*/RTM-v1.csv`（または `05-運用/queues/features/NN-RTM-v1.csv`）に `req_id` 行を追加 |
| **5. E2E 連鎖** | AI | 受入基準に UI 到達がある場合、リンク先 `02-設計/E2E/NN-*-E2E-v1-DRAFT.md` の STUB を拡張（`05`/`06` 同型）|
| **6. Changelog** | AI | 更新した doc ヘッダに `Changelog: YYYY-MM-DD — 追加仕様: <要約 1 行>` を追記 |
| **7. 人間レビュー** | 人間 | **HQ-09** — Phase 1 完了前は DRAFT のまま。v1.0 格上げは人間確認後 |

> **次アクション**: 追加仕様の本文をチャットに貼るか、リポジトリ内 markdown パスを指定する。

---

## 変更手順（凍結後）

要件変更は **Change Request（CR）** のみ。V-model 凍結後の直接編集は禁止（[`00-Vモデル実行計画-v1.md`](../05-運用/queues/00-Vモデル実行計画-v1.md) §1）。

## レガシー索引

旧 `機能一覧/要件定義/0X` からのリダイレクト: [`_legacy-index/機能一覧-要件定義-README.md`](../_legacy-index/機能一覧-要件定義-README.md) · [`機能一覧/要件定義/README.md`](../機能一覧/要件定義/README.md)
