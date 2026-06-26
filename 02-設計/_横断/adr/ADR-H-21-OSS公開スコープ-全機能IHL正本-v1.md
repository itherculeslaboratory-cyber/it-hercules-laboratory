# ADR-H-21 — OSS 公開スコープ：全機能 IHL 正本 v1

> **ステータス**: **HUMAN-CONFIRMED 2026-06-10**（ユーザー OSS 公開方針）  
> **決定日**: 2026-06-10  
> **上位**: [`ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md`](./ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md) · [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md) · [`ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md)  
> **完了定義**: [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) §0 **USER-DONE（OSS公開Ready）**

---

## 0. エグゼクティブサマリー

**OSS 公開の正本は `it-hercules-laboratory/` 単体 repo である。**  
グローバルエンジニアが **civilization-os を clone せず**、30 分以内に貢献できる自己完結型を必須とする。

本 ADR は **ADR-H-18 の `stays` 判定を OSS 公開パスにおいて廃止**し、#06・#07・#14・#16・#17 を **salvage-adapt** へ昇格させる。

```text
civilization-os  = reference only（契約抽出 · 反パターン例）— runtime dependency 禁止
it-hercules-laboratory/ = 唯一の実装・テスト・UI・ドキュメント正本
指示/it-hercules-laboratory/ = 設計正本（昇格前）— 各機能 4 点設計 + component README
```

---

## 1. 背景 — なぜ stays を廃止するか

| 問題 | 出典 | OSS 公開への影響 |
|------|------|------------------|
| **deep link のみ** で「完了」扱い | ADR-H-18 · POST-B8-05 | コントリビュータが civ-os を別途セットアップする必要 |
| **mock_store 依存** | POST-B8-03 | OSS ユーザーが本番相当 API を検証できない |
| **設計と実装の分離** | `指示/` vs `it-hercules-laboratory/` | 機能単位の改善が追えない |
| **学習コスト** | ユーザー方針 | 1 機能 = 1 component で直す文化が成立しない |

**ユーザー哲学（再掲）**:

- グローバルエンジニアが協力して改善する **OSS 文化**
- component 分割で **個人が 1 機能だけ直せる**
- 事前学習コスト最小 · **改善そのものがシステムの一部**
- 完了バーは通常の **3 段上** — キーボード打鍵は **サインオフ**でありバグ狩りではない

---

## 2. ADR-H-18 からの変更（OSS 公開パス）

### 2.1 廃止する判定（OSS 公開時）

| 旧（ADR-H-18） | 新（ADR-H-21） | 理由 |
|----------------|----------------|------|
| **stays** — civ-os deep link のみ | **salvage-adapt** — IHL で全面実装 | OSS repo 自己完結 |
| POST-B8-05 stays N/A 完了 | **superseded** — POST-OSS-* へ移行 | 「N/A」は OSS Ready と矛盾 |
| civ-os runtime 参照 | **reference only** | ビルド・実行・テストに civ-os 不要 |

### 2.2 機能別 OSS 判定（#00〜#23 · 正本）

| # | 機能 | ADR-H-18 | **ADR-H-21（OSS）** | civ-os 参照 | IHL 実装先 |
|---|------|----------|---------------------|-------------|------------|
| 00 | 土台 | salvage-adapt | **salvage-adapt** | C-USB 思想 | `02-設計/_横断/schema/` · `libs/event_store.py` |
| 01 | ログイン | salvage-adapt | **salvage-adapt** | magic link 契約 | `apps/api` auth · `apps/web` |
| 02 | 利用規約 | salvage-adapt | **salvage-adapt** | 条項 ID 形状 | `apps/web/terms` · events |
| 03 | 新規登録 | salvage-adapt | **salvage-adapt** | onboarding FSM | `apps/web/register` |
| 04 | ホーム | salvage-adapt | **salvage-adapt** | IA 知見 | `apps/web` home |
| 05 | 観測 | salvage-adapt | **salvage-adapt** | solid フロー | `components/*` · web |
| **06** | **マーケット** | **stays** | **salvage-adapt** | market API 契約 | `components/market_*` · `apps/api` · `/market/*` |
| **07** | **掲示板** | **stays** | **salvage-adapt** | board Kernel 契約 | `components/board_*` · `/board/*` |
| 08 | カルマ | salvage-adapt | **salvage-adapt** | policy resolver | `libs/economy_logic` |
| 09 | 論文 | salvage-adapt | **salvage-adapt** | PaperMatch | `apps/web/research` |
| 10 | マチアプ | salvage-adapt | **salvage-adapt** | ValueCheck | `apps/web/match` |
| 11 | 裁判 | IHL-native | **IHL-native rebuild** | judicial abandon | dispute-room |
| 12 | 設定 | salvage-adapt | **salvage-adapt** | preferences | `apps/web/settings` |
| 13 | データ取得元 | salvage-adapt | **salvage-adapt** | collector 契約 | `components/env_ingest/` |
| **14** | **貢献度** | **stays** | **salvage-adapt** | contributionEconomy | `libs/contribution` · ホーム要約 API |
| 15 | データ設計 | IHL-native | **IHL-native** | schema 列案 | `02-設計/_横断/schema/` 正本 |
| **16** | **UIbuilder** | **stays** | **salvage-adapt** | BuilderShell 契約 | `apps/web/builder` · theme pack |
| **17** | **UI選択** | **stays** | **salvage-adapt** | WorldRouting 知見 | `apps/web/routing`（一般ユーザー向け） |
| 18 | 写真解析 | salvage-adapt | **salvage-adapt** | Vision pane | `components/embedding_*` |
| 19 | コンポ掲示板 | salvage-adapt | **salvage-adapt** | file-board 思想 | GitHub BOARD 連携 |
| 20 | 投票 | IHL-native | **IHL-native rebuild** | legacy vote 捨て | `economy/vote_event` |
| 21 | 翻訳 | IHL-native | **IHL-native rebuild** | i18n 横断 | client translate |
| 22 | PT ショップ | IHL-native | **IHL-native rebuild** | indulgence | `apps/web/shop` |
| 23 | GMO 振込 | salvage-adapt | **salvage-adapt** | gmo_match connector | connector only |

### 2.3 不変の原則

| 原則 | 内容 |
|------|------|
| **C-USB component per feature** | 各機能は manifest 契約付き component（または同等 libs 境界）を持つ |
| **salvage ≠ copy-paste** | civ-os から契約・FR のみ抽出し IHL で再実装 |
| **INSERT ONLY** | R2 / event_store — UPDATE/DELETE 禁止 |
| **鍵・法務** | HUMAN-ONLY は維持（§4） |

---

## 3. ドキュメント正本の二層構造

| 層 | パス | 役割 |
|----|------|------|
| **設計正本** | `指示/it-hercules-laboratory/` | 要件定義 · 詳細設計 · 遷移 · UI · component 分解 · ADR |
| **実装正本** | `it-hercules-laboratory/` | コード · テスト · `CONTRIBUTING.md` · `docs/ARCHITECTURE.md` |
| **参照のみ** | `civilization-os/`（legacy） | salvage 元 · 契約照合 — **OSS ビルドに含めない** |

各機能は **両層に README** を置く:

- `指示/it-hercules-laboratory/02-設計/_横断/component/NN-*/README.md`（設計トレーサ）
- `it-hercules-laboratory/components/<name>/README.md` または `libs/<name>/README.md`（実装トレーサ）

---

## 4. 人手ゲート（OSS 公開後も維持）

| ID | 内容 | OSS への影響 |
|----|------|--------------|
| **HUMAN-23-GMO-LIVE** | GMO 本番入金証跡 | stub/stg は OSS 完走可 · live は Tier D |
| **HUMAN-02-LEGAL** | 最終法務条文 | **USER-WAIVED** 運用可 · 差替時のみ人間 |
| **HUMAN-COLLECTOR-KEYS** | SwitchBot · Ed25519 | 鍵なし CI 緑 · live は鍵投入後 AI 完走 |

---

## 5. 関連成果物

| パス | 用途 |
|------|------|
| [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) | §0 USER-DONE · POST-OSS-* キュー |
| [`00-OSS機能ギャップ表-v1.md`](./00-OSS機能ギャップ表-v1.md) | #00–#23 現状 vs OSS-READY |
| [`../OSS-CONTRIBUTOR-ONBOARDING-v1.md`](../OSS-CONTRIBUTOR-ONBOARDING-v1.md) | 30 分オンボーディング |
| [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) | コントリビュータ正本 |
| [`../../docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) | アーキテクチャ概要 |

---

## 6. ADR-H-18 との関係

- **ADR-H-18** は Batch 8 技術 peel の歴史的正本として **存続**（stays 判定の記録）
- **OSS 公開パス**では本 ADR（H-21）が **優先**
- **POST-B8-05**（stays N/A 正本化）は **superseded by ADR-H-21** — 完了マークは歴史記録、新規作業は POST-OSS-*

---

*HUMAN-CONFIRMED v1 · 2026-06-10 · OSS 公開スコープ正本*
