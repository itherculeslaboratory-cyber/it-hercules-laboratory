# ADR-H-18 — IHL スコープ正本：stays vs salvage-adapt vs IHL-native rebuild v1

> **ステータス**: **HUMAN-CONFIRMED 2026-06-10**（ユーザー `ADR-H-18 Go`）  
> **OSS 公開パス**: **stays 判定は [`ADR-H-21`](./ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) が優先**（#06 #07 #14 #16 #17 → salvage-adapt）  
> **決定日**: 2026-06-10  
> **確認**: ユーザーが stays / salvage-adapt / rebuild 判定表と #13 SwitchBot 矛盾解消節を承認。**実装コード着手は `HUMAN-IMPL-BATCH8-GO` が別途必要**。
> **上位**: [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md) · [`ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md) · [`00-設計監査-D-網羅性・不足.md`](../02-設計/_横断/00-設計監査-D-網羅性・不足.md)  
> **実装禁止**: 本 ADR の **人間承認（HUMAN-ADR-H-18）** 前に Batch 8 コード着手不可

---

## 0. エグゼクティブサマリー（不安解消用）

**盲移植はしません。** `civilization-os` は **参照実装（reference）** のみ。IHL では **契約を抽出し、C-USB component + FastAPI + event_store で再実装**します。

本 ADR は「どの機能をどこまで IHL で作るか」の **正本**です。過去監査で見えた **#13 SwitchBot の矛盾**も、ここで **1 行に解消**します。

---

## 1. 背景 — なぜ正本が必要か

| 問題 | 出典 | 影響 |
|------|------|------|
| **stays vs IHL rebuild** の文書間矛盾 | 監査 D · D1 | 実装 AI が civ-os にコードをコピーする誤読 |
| **#13 SwitchBot OUT vs in-scope** | 監査 D §1（OUT） vs `13-データ取得元管理.md` §⑦（in-scope） | Batch 8 の着手順がブレる |
| **マスター component 表の「stays」** | `00-マスターcomponent分解表.md` | 01〜08 が civ-os 固定に見える |

**原則（再掲）**:

```text
salvage  ≠  copy-paste
salvage  =  契約・FR・運用知見の抽出 → IHL で C-USB 準拠の新実装
stays    =  IHL では UI/API を持たず、civ-os を参照のみ（ユーザーは legacy 経由）
rebuild  =  IHL が唯一の実装先（legacy API/画面は abandon）
```

---

## 2. 判定カテゴリ定義

| カテゴリ | 意味 | civ-os の扱い | IHL の扱い |
|----------|------|---------------|------------|
| **stays（参照のみ）** | IHL 製品スコープ外。legacy で継続 or 凍結 | 正本実装 | リンク・deep link のみ。コード移植なし |
| **salvage-adapt** | ドメイン知見・契約は共有。**実装は IHL で全面書き直し** | reference implementation | `components/` + `libs/` + FastAPI + Next |
| **IHL-native rebuild** | legacy に相当実装が無い、または **意図的 abandon** | 参照禁止 or 反パターン例のみ | 唯一の実装先 |

---

## 3. 機能別決定表（#00〜#23）

| # | 機能 | 判定 | civ-os 参照（契約抽出） | IHL 実装先 | 人間ゲート |
|---|------|------|-------------------------|------------|------------|
| 00 | 土台 | **salvage-adapt** | ProjectRules · C-USB 思想 · INSERT ONLY | `02-設計/_横断/schema/` · `libs/event_store.py` | schema-pack 人間確定済 |
| 01 | ログイン | **salvage-adapt** | magic link · JWT claims · agree_terms | `apps/api` auth · `apps/web` | 🔒 本番メール・JWT ローテ |
| 02 | 利用規約 | **salvage-adapt** | 条項 ID · 同意イベント形状 | `apps/web` /terms · event | 🔒 **法務条文確定** |
| 03 | 新規登録 | **salvage-adapt** | onboarding 状態機械 | `apps/web/register` | — |
| 04 | ホーム | **salvage-adapt** | 3〜5 チャンク IA · CTA | `apps/web` home | — |
| 05 | 観測 | **salvage-adapt** | solid フロー知見 · env 接続 | `components/*` pipeline · web | OBS-TPL 人間レビュー推奨 |
| 06 | マーケット | **stays**（Phase 2 以降 salvage 候補） | market API · GMO 連携 | mock のみ → 後バッチ | 🔒 GMO live |
| 07 | 掲示板 | **stays**（Phase 2） | board Kernel | mock のみ | — |
| 08 | カルマ | **salvage-adapt** | policy resolver · fib | `libs/economy_logic` 拡張 | 二層モデル実装整合 |
| 09 | 論文 | **salvage-adapt** | PaperMatch 条件 | `apps/web` + events | research/ ADR |
| 10 | マチアプ | **salvage-adapt** | ValueCheck · tag rerank | `apps/web/vote` 等 | — |
| 11 | 裁判 | **IHL-native rebuild** | judicial* **abandon** | dispute-room · R2 events | **U-MKT-DSP 人間確定済** |
| 12 | 設定 | **salvage-adapt** | preferences PATCH 群 | `apps/web/settings` | 🔒 取引前 PII · 秘密鍵 |
| **13** | **データ取得元** | **salvage-adapt** | collector · placement · ingest 契約 | **`components/env_ingest/`** 等 | 🔒 collector 鍵・実機 |
| 14 | 貢献度 | **stays**（要約のみ salvage） | contributionEconomy | ホーム要約イベント | — |
| 15 | データ設計 | **IHL-native**（横断） | schema 列案 | `02-設計/_横断/schema/` 正本 | schema-pack |
| 16 | UIbuilder | **stays** | BuilderShell | Phase 2 以降 | — |
| 17 | UI選択 | **stays** | WorldRouting dev のみ | スコープ外明記 | — |
| 18 | 写真解析 | **salvage-adapt** | Vision 結果 pane | `components/embedding_*` | — |
| 19 | コンポ掲示板 | **salvage-adapt** | file-board 思想 | GitHub BOARD 連携 | — |
| 20 | 投票 | **IHL-native rebuild** | legacy vote 捨て | `economy/vote_event` | — |
| 21 | 翻訳 | **IHL-native rebuild** | i18n 横断 | client translate | — |
| 22 | PT ショップ | **IHL-native rebuild** | indulgence | `apps/web` shop mock→実装 | — |
| 23 | GMO 振込 | **salvage-adapt**（connector） | gmo_match | connector only | 🔒 **本番証跡** |

---

## 4. 監査 D 矛盾の解消 — #13 SwitchBot

### 4.1 矛盾の内容

| ソース | 記述 |
|--------|------|
| **監査 D §1** | `SwitchBot/Placement` → **OUT — IHL Phase 1 外（正しい）** |
| **`13-データ取得元管理.md` §⑦** | **in-scope**（collector / R2 契約） |
| **`00-マスターcomponent分解表.md` #13** | **in-scope** · transform = collector ingest |
| **`measurement_method.yaml`** | `iot_switchbot` · `requires_device: true` |

### 4.2 解消決定（本 ADR 正本）

| 論点 | 決定 |
|------|------|
| **IHL に SwitchBot があるか** | **ある** — 判定 **salvage-adapt**（#13） |
| **監査 D の OUT の意味** | 「civ-os Express ルートを **Phase 1 Streamlit/IHL にそのまま複製しない**」という **実装手法の禁止**。機能スコープ外ではない |
| **Phase 1 外だったもの** | civ-os monolith への **新規 ENV エピック追加**（凍結 repo）— IHL では **新 repo に再実装** |
| **観測 (#05) との境界** | #05 は **measurement 行の UI/commit**。#13 は **機器・Placement・telemetry 時系列・collector** |
| **秘密値** | **collector/.env のみ**。R2・フロント・IHL API env に TOKEN/SECRET を置かない（civ-os `solid-switchbot-operating-checklist.md` §2–3 と同原則） |

**結論**: #13 は **in-scope · salvage-adapt**。OUT と書かれていたのは **copy-paste 先が civ-os ではない** という意味に読み替える。

---

## 5. civ-os 参照マップ（#13 重点）— 何を読み、何を捨てるか

| civ-os 資産 | 抽出する契約 | 捨てるもの |
|-------------|--------------|------------|
| `collector/switchbot-local-collector.mjs` | 5min 周期 · Ed25519 署名 · `env_collector_ingest_v1` · queue.jsonl | Node 実装そのもの · civ-os URL 固定 |
| `backend/.../envCollectorIngest.ts` | 公開鍵検証 · サニタイズ列 | Express ルータ · Zod スキーマの TS 固有 |
| `backend/.../envPlacement.ts` | Placement/QR CRUD 形状 | civ-os userId 投影の詳細 |
| `backend/scripts/switchbot-env-poller.ts` | ポール間隔・バックオフログ | **毎ポール無条件 INSERT**（IHL では差分戦略へ — ADR-H-19） |
| `solid-switchbot-operating-checklist.md` | 秘密分離 · 最小保存列 | civ-os 固有 env 変数名の丸コピ |

---

## 6. 人間ゲートマーカー

| ID | 内容 | Batch 8 との関係 |
|----|------|------------------|
| **HUMAN-ADR-H-18** | 本 ADR の決定表承認 | **✓ CONFIRMED 2026-06-10** — `HUMAN-IMPL-BATCH8-GO` は別ゲート |
| **HUMAN-IMPL-BATCH8-GO** | Batch 8 実装着手（チャーター §4） | ADR-H-18 + DoD マトリクス + 監査ゲート後 |
| **HUMAN-COLLECTOR-KEYS** | SwitchBot token/secret · Ed25519 鍵の実機投入 | Tier D · runbook のみ AI |
| **HUMAN-02-LEGAL** | 利用規約最終文 | 02 実装のブロック |
| **HUMAN-23-GMO-LIVE** | GMO 本番 | 23 のブロック |

**AI が `[x]` にしてよいもの**: `DELEGATED-IMPL-DESIGN-GO`（実装**設計** doc の機械チェック）— **コード PR は不可**。

---

## 7. 関連 ADR / 設計

| パス | 用途 |
|------|------|
| [`00-Batch8-実装設計-スコープ-v1.md`](./00-Batch8-実装設計-スコープ-v1.md) | レイヤー · mock peel 順 |
| [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) | #13 深掘り |
| [`ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) | ポーリング戦略 |
| [`00-機能別実装DoD-マトリクス-v1.md`](./00-機能別実装DoD-マトリクス-v1.md) | FR × route/API/persistence/test |

---

*HUMAN-CONFIRMED v1 · 2026-06-10 · Batch 8 設計確定 · 実装コードは `HUMAN-IMPL-BATCH8-GO` 後*
