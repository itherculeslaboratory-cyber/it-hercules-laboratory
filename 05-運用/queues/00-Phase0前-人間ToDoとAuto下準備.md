# 00 — Phase 0 前：人間 ToDo と Auto 下準備

> **用途**: 高性能 AI（設計フェーズ）着手前に、**人間が決めること**と **Auto（低コスト AI）で済ませる下準備**を分離する。  
> **非正本**: 確定判断は人間レビュー後 IHL repo `docs/adr/` へ昇格。  
> **作成日**: 2026-06-07  
> **参照**: [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) · [`00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md`](../05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md) · [`00-設計監査-統合サマリー.md`](./00-設計監査-統合サマリー.md) · `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/詳細設計書`

---

## A. 人間が Phase 0 前に決めること（必須 / 任意）

| 判断ID | 内容 | 選択肢 | 現状 | ブロッカー度 |
|--------|------|--------|------|--------------|
| **H-01** | **16 UIbuilder**: §④ Phase8 万能 Builder vs §12.7 FR-16-REFRAME（配置+デザイン+紐づけのみ） | A) Phase8 正本維持 · B) REFRAME 採用 · C) Phase8-B 分岐 ADR | **☑ 確定 B（2026-06-07）** — [ADR-H-01](./ADR-H-01-uibuilder-reframe-adopted.md) | **解決** — FR-16-REFRAME を要件正本。Phase 0 R2 spike は非依存 |
| **H-02** | **10 マチアプ**: MatchApp ↔ ValueCheck 統合方針 | A) ValueCheck 正本 · B) 併存+統一 UX · C) tag 経路統合 | **☑ 確定 B+統一 UX（2026-06-07）** — [ADR-H-02](./ADR-H-02-matchapp-pairwise-preference.md)（pairwise 優先・`preference_event`） | **解決** — 10 詳細設計の前提確定 |
| **H-03** | **D-04** R2 バケット | A) IHL 専用バケット新設 · B) legacy 共用 | **☑ 確定 A（2026-06-07）** — `it-hercules-laboratory-dev` — [ADR-H-03](./ADR-H-03-r2-bucket-dedicated.md)（作成済み） | **解決** — Phase 0 接続先確定 |
| **H-04** | **D-01** latest manifest 更新方式 | A) 実体コピー（方式A · 詳細設計書推奨）· B) pointer JSON（方式B · HANDOFF 推奨） | **未決** — 文書間揺れ | **P1** — manifest_builder 詳細設計前。Phase 0 spike（raw put のみ）は非依存 |
| **H-05** | **D-02** 類似スコア rerank 重み | A) 0.50 emb + 0.20 color + 0.20 size + 0.10 lineage（詳細設計書 v0.2）· B) 0.50/0.30/0.20（要件定義1）· C) 0.7 cosine + 0.3 size（AI 指示書） | **☑ 確定 A（2026-06-07）** — [ADR-H-12](./ADR-H-12-D02-類似検索重み.md)（0.5/0.2/0.2/0.1 · 日本語説明） | **解決** — 類似検索詳細設計の重み前提確定 |
| **H-06** | **D-07** 個体 ID 既存データ移行 | A) civ-os lineage JSON から one-time export · B) 新規 ULID のみ（移行なし） | **要人間確認** | **P1** — ID マッピング ADR（sessionId ↔ capture_id）とセット |
| **H-07** | **D-06** OSS ライセンス | MIT / Apache-2.0 / その他 | **未決** | **P2** — repo 公開前 ADR |
| **H-08** | **D-05** repo 公開タイミング | public 即 / private 猶予後 public | **方針=public 前提** · 時期未 ADR | **P2** |
| **H-09** | **D-03** embedding CI backend | dummy（CI）+ dinov2（本番） | AI 指示書に記載 · **未人間確定** | **P2** — CI 設計前 |
| **H-10** | **D-08** UI 長期 | Streamlit Phase 1 → Phase 2 IHL 内 Web UI | たたき台=Streamlit のみ | **P2** — Phase 1 実装には非ブロック |
| **H-11** | **U-GMO-03** 8% matched 時 **issueCoin 要否** | 要 / 不要 / legacy 踏襲 | **未確定（会計）** | **P1** — 23 正式 schema 確定前。Phase 0 非依存 |
| **H-12** | **U-GMO-04** GMO API **本番署名**・Tier D 鍵 | 人間が本番契約・鍵投入 | **人間ゲート**（`P0-NEXT-GMO-LIVE-EXEC`） | **実装/本番のみ** — 設計 doc 作業は可 |
| **H-13** | **合算振込**（1 入金 → 複数 trade_ref 按分） | 按分算法を詳細設計で確定 / v1 スコープ外 | **TBD** — `23-GMO` §2.5.5 · `06` §11.7.5 | **P1** — 06/23 遷移設計。部分入金（1 期待入金内）は **解決済** |
| **H-14** | **免罪符 edge case**（U-KRM-02）永久 BAN 後の count 回復・再ログイン | あり / なし / 免罪符のみ等 | **未確定** — `08-カルマ` §12 U-KRM-02 | **P2** — 08/20/22 UI 詳細前 |
| **H-15** | **R2 接続情報**（Phase 0 spike） | env: endpoint / access key / secret / bucket | **☑ 検証済（2026-06-07）** — probe `ihl/_phase0_probe/2026-06-07-probe.txt`（PUT/HEAD/LIST/GET OK） | **解決** — dev バケット `it-hercules-laboratory-dev` 実接続確認 |
| **H-ECON** | **IHL 経済 schema** | A) civ-os `economy/*` 構造コピー · B) IHL 独立 schema | **☑ 確定 B（2026-06-07）** — [ADR-H-06](./ADR-H-06-IHL経済-独立schema.md) | **解決** — karma/platinum/market R2 正本は IHL ツリー |
| **H-BBS** | **製品 BBS IA** | 4 入口 vs Research Board 分離 | **☑ 確定 4 入口 + 論文内 case（2026-06-07）** — [ADR-H-07](./ADR-H-07-掲示板-入口4つ-論文内研究.md) | **解決** — Research Board 独立板 **不採用** |
| **H-08** | **プロフィール指標** | 統合 vs 3 ドメイン分離 | **☑ 確定 3 ドメイン（2026-06-07）** — [ADR-H-08](./ADR-H-08-指標とドメイン仕分け.md)（カルマ/貢献度＋研究スコア内訳/評価 · 統合禁止） | **解決** — 研究スコアは貢献度の内訳 |
| **H-09** | **研究 velocity** | 論文タブ＋case のみ vs 主導線追加 | **☑ 確定 主導線（2026-06-07）** — [ADR-H-09](./ADR-H-09-研究フロー-低コスト設計.md)（観測→仮説→試す→記録→引用 · Dashboard/KG 後回し） | **解決** — case 維持＋運ぶ/残す/回す/引く |
| **H-10** | **BBS 投稿 Truth** | schema 未定 vs append-only 契約 | **☑ 確定（2026-06-07）** — [ADR-H-10](./ADR-H-10-BBS-データ契約.md)（board_kind/paper_case · ThreadEvent/PostEvent） | **解決** — Content/Citation 連携明文化 |
| **H-11** | **血統 Cross** | sire/dam 直結 vs CrossParent | **☑ 確定（2026-06-07）** — [ADR-H-11](./ADR-H-11-血統-Cross-設計.md)（CrossParent/Offspring/Lineage=Snapshot · モック済） | **解決** — 丁寧設計・3 画面 |
| **H-16** | **初回広報投稿先**（観測 promo） | YouTube / X / note / 内部 | **人間決定** — `05-観測.md` §⑨ | **任意** — 製品設計非ブロック |

**ブロッカー度凡例**: **P0 Phase 0** = R2 spike 着手前必須 · **P0** = 該当機能の高性能 AI 詳細設計前必須 · **P1** = 詳細設計中に ADR で可 · **P2** = 実装/公開前 · **任意** = 後追い可

---

## B. 人間判断 — 済/未チェックリスト

| # | 項目 | YES | NO | 備考 |
|---|------|:---:|:---:|------|
| 1 | 単一 IHL 正本・C-Sync 不採用（HANDOFF §2.1） | ☑ | ☐ | 2026-06-07 ユーザー確定 |
| 2 | Phase 1 UI = Streamlit（たたき台合意） | ☑ | ☐ | HANDOFF §7 |
| 3 | 取引成立 = 配送完了 **かつ** 評価確定（06 §11.0.1） | ☑ | ☐ | C1 確定事項 |
| 4 | 振込コード = `deriveTransferCode(userId)`（23 §2.2） | ☑ | ☐ | U-GMO-01 解決 |
| 5 | 複数 pending = 日時 FIFO（U-GMO-06） | ☑ | ☐ | 取引サフィックス却下 |
| 6 | 部分入金/過入金/返金不可（23 §3.1） | ☑ | ☐ | U-GMO-02 解決 |
| 7 | **H-01** 16 REFRAME vs Phase8 採用 | ☑ | ☐ | **B 採用 2026-06-07** — ADR-H-01 |
| 8 | **H-02** MatchApp ↔ ValueCheck 統合 | ☑ | ☐ | **B+pairwise 2026-06-07** — ADR-H-02 |
| 9 | **H-03** D-04 専用 R2 バケット | ☑ | ☐ | **A `it-hercules-laboratory-dev` 2026-06-07** |
| 10 | **H-04** D-01 latest 方式 | ☐ | ☑ | 未 |
| 11 | **H-05** D-02 rerank 重み | ☑ | ☐ | **2026-06-07** → ADR-H-12 |
| 12 | **H-06** D-07 個体 ID 移行 | ☐ | ☑ | 未 |
| 13 | **H-11** U-GMO-03 issueCoin | ☐ | ☑ | 未 |
| 14 | **H-13** 合算振込按分 | ☐ | ☑ | 未 |
| 15 | **H-14** BAN 後免罪符 edge | ☐ | ☑ | 未 |
| 16 | **H-15** R2 実接続 env 準備 | ☑ | ☐ | **2026-06-07** — `ihl/_phase0_probe/2026-06-07-probe.txt` 検証 OK |
| 17 | **H-ECON** IHL 経済独立 schema | ☑ | ☐ | **B 2026-06-07** — ADR-H-06 |
| 18 | **H-BBS** 掲示板 4 入口 + 論文内研究 | ☑ | ☐ | **2026-06-07** — ADR-H-07 |
| 19 | 設計ゲート 4 点 — いずれか 1 機能でも人間確定 | ☐ | ☑ | 0/7（05/06/07/10/14/16/23） |
| 20 | 2026.06,06 schema を 05 本文へ昇格 | ☐ | ☑ | **本セッション Auto 部分実施** → `05-観測.md` §⑪ |

---

## C. Auto 下準備（高性能 AI 前に済ませるべき簡単作業）

### 05 観測

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| `searchable_capture_set` 等 schema 列を本文 appendix へ転記 | **済**（§⑪） | `詳細設計書` L9–29 | ☑ | 低 |
| 辞書 enum 一覧転記 | **済**（§⑪.2） | `詳細設計書` L31 | ☑ | 低 |
| query whitelist / rerank 式の cross-ref | **済** — OBS-IMG-05 + [ADR-H-12](./ADR-H-12-D02-類似検索重み.md) | `詳細設計書` L69 | ☑ | 低 |
| run/snapshot 状態遷移図 | **未** | 詳細設計書 snapshot 規則 | △（高性能 AI） | 中 |
| IHL Streamlit UI ワイヤー | **未** | 要件定義1 Part 6 · 詳細設計書 simple_search_ui | △ | 高 |

### 06 マーケット

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| `trade-events` / `listing-state` イベント列 stub | **未** — 2026.06,06 に明示列なし | civ-os legacy + 06 §11 | ✗  invent 禁止 | — |
| Listing/Auction 正式遷移図 | **未** | 06 FR-MKT-02 | △ | 高 |
| 取引 UI ワイヤー | **未** | — | △ | 高 |

### 07 掲示板

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| スレ/投稿/指摘イベント schema stub | **未** — 2026.06,06 該当なし | 11 §3/§6 参照のみ | △（11 連携後） | 中 |
| **製品 BBS IA（4 入口）** | **済** — ADR-H-07（2026-06-07） | H-BBS 人間確定 | ☑ | — |
| 投稿 rescue UX ワイヤー | **未** | FR-BBS-07 | △ | 中 |

### 10 マチアプ

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| `tag_event` / `tag_aggregate` schema stub 転記 | **済**（§⑩ appendix） | `詳細設計書` L27–28 | ☑ | 低 |
| MatchApp ↔ capture データ契約 | **済（草案 v1）** — `preference_event` schema | [10-詳細設計-v1](./10-マチアプ-詳細設計-v1.md) | ☑ | 詳細設計で確定 |
| 評価 UI ワイヤー | **済（草案 v1）** — pairwise 2 画像 [左][右][×] | [10-UI設計-v1](./10-マチアプ-UI設計-v1.md) | ☑ | 中 |

### 14 貢献度

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| `NodeGraphEntry` schema stub | **未** — 2026.06,06 該当なし | legacy `economy/graph/` | ✗ invent 禁止 | — |
| IHL 経済圏再設計方針 1 ページ | **済** — ADR-H-06（2026-06-07 · H-ECON=B） | PlatinumCoinRules §5 · 08/22/06 | ☑ | — |

### 16 UIbuilder

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| §④ vs REFRAME 採用判断 | **済** — **B 確定** | ADR-H-01 · `16-UIbuilder.md` §14 | ☑ | — |
| catalog 紐づけ契約 stub | **済（草案 v1）** — catalog/ScreenDef binding | [16-詳細設計-v1](./16-UIbuilder-詳細設計-v1.md) | ☑ | 中 |
| Builder IDE ワイヤー | **済（草案 v1）** — 配置/デザイン中心 | [16-UI設計-v1](./16-UIbuilder-UI設計-v1.md) | ☑ | 高 |

### 23 GMO

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| `ExpectedPaymentRecord` → OpenAPI/YAML 形式化 | **未** | 23 §2 既存フィールド表 | △ | 中 |
| pending→matched 状態遷移図 | **未** | 23 §2.5.3 擬似コード | △ | 低 |
| 振込案内 UI ワイヤー | **未** | FR-GMO UI | △ | 中 |

### 横断

| 作業 | 状態 | 参照元 | Auto可? | 工数 |
|------|------|--------|:-------:|------|
| D-01〜D-08 一覧の各機能への cross-ref | **部分** — 05 §⑨ · HANDOFF §8 | HANDOFF §8 | ☑ | 低 |
| 2026.06,06 未昇格コンテンツ inventory | **済**（§F） | 引き継ぎ §6 · 監査 C/D | ☑ | 低 |
| glossary / event 名リスト索引 | **部分** — 本ファイル + 05 §⑪ | 詳細設計書 | ☑ | 低 |
| README / 要件索引への本ファイルリンク | **済** | — | ☑ | 低 |

---

## D. データ型・観測項目の整理状況

> **比較正本**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/詳細設計書`（圧縮 v0.21 + 追補 v0.2） vs [`05-観測.md`](./05-観測.md)

| schema / 辞書 | 詳細設計書 | 05-観測.md（昇格前） | 05 §⑪（本セッション） | 不足・備考 |
|---------------|:----------:|:-------------------:|:---------------------:|------------|
| **capture** | ☑ 全列 | △ 概念のみ（§4.4） | ☑ 表転記 | — |
| **individual** | ☑ | △ | ☑ | — |
| **searchable_capture_set** | ☑ 検索中核・50+ 列 | ✗ 外部依存 | ☑ | **P0 ギャップ解消** |
| **individual_master** | ☑ | ✗ | ☑ | — |
| **embedding_manifest** | ☑ | △ OBS-IMG | ☑ | — |
| **embedding_locator** | ☑ | △ | ☑ | — |
| **thumbnail_manifest** | ☑ | ✗ | ☑ | — |
| **qc_result** | ☑ | △ OBS-IMG/QC | ☑ | — |
| **color_feature** | ☑ | △ | ☑ | — |
| **shape_feature** | ☑ | △ | ☑ | — |
| **measurement**（縦持ち） | ☑ | ✗ | ☑ | — |
| **lineage** | ☑ | △ taxonomy | ☑ | — |
| **life_event** | ☑ | ✗ | ☑ | — |
| **environment_timeseries** | ☑ | △ §4.3 1 行 | ☑ | civ-os 固体環境との export 契約は未 |
| **tag_event**（JSONL） | ☑ | ✗（10 へ） | cross-ref → `10-マチアプ.md` §⑩ | — |
| **tag_aggregate** | ☑ | ✗ | cross-ref → 10 §⑩ | — |
| **usage_event**（JSONL） | ☑ | ✗ | ☑ | — |
| **output_manifest** | ☑ | △ OBS-R2-04 | ☑ | — |
| **run_info** / **errors** | ☑ | △ | ☑ | — |
| **snapshot_manifest** | ☑ | △ D-01 | ☑ | 方式 A/B は H-04 待ち |
| **id_map** / **build_info** | ☑ Phase2 | ✗ | ☑（Phase 2 注記） | FAISS 導入時 |
| **辞書 enum**（sex/stage/value_origin 等） | ☑ | △ OBS-TAX 散在 | ☑ §⑪.2 | — |
| **検索 rerank 式** | ☑ 0.50/0.20/0.20/0.10 | ☑ D-02 確定（暫定 v0） | [ADR-H-12](./ADR-H-12-D02-類似検索重み.md) | **H-05 ☑** |
| **simple_search_ui 画面構成** | ☑ filter→grid→detail→similar→tag | ✗ UI 未 | ✗ | 高性能 AI UI 設計（D2） |
| **component 入出力契約** | ☑ 追補 v0.2 詳細 | △ component 分解表 | ✗ | IHL `05-運用/queues/components/` 未作成 |

**行数サマリー**: 詳細設計書 **22 schema/辞書グループ** — 05 本文昇格前 **2 完了 / 8 部分 / 12 未** → 本セッション Auto 後 **18 表転記済 / 4 UI・component 詳細は未**（invent なし）。

---

## E. Phase 0 Go/No-Go ゲート

### Phase 0 の定義（再掲）

[`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) **§11**: R2 実接続 · raw 1 画像 put · list/get · **同一キー再 put 拒否** · delete 不使用 · README 再現手順。

**Phase 0 ≠ 高性能 AI 設計フェーズ全体**。Phase 0 は **R2 spike のみ**（schema YAML 化・Streamlit UI は Step 5 以降）。

### 判定: **Go（H-01/H-02/H-03/H-15 確定）— Phase 0 R2 spike 着手可**

| 観点 | 判定 | 条件 |
|------|------|------|
| **Phase 0 R2 spike 着手** | **Go** | **H-03 ☑ · H-15 ☑**（2026-06-07 — バケット `it-hercules-laboratory-dev`、probe `ihl/_phase0_probe/2026-06-07-probe.txt`）。D-01/D-02/16/10 はスパイク非依存 |
| **高性能 AI 設計 Step A（要件決着）** | **A1/A2 解決 — Partial Go** | **H-01 ☑ · H-02 ☑**（2026-06-07）。16/10 **要件層**は進め可。設計ゲート 4 点は別 |
| **Phase 1 着手（OSS 選定・repo 構成）** | **着手済（docs）** | [ADR-Phase1-OSS選定表](./ADR-Phase1-OSS選定表.md) · [ADR-Phase1-IHL-repoフォルダ構成](./ADR-Phase1-IHL-repoフォルダ構成.md)。16/10 詳細・遷移・UI を **草案 v1** 化（人間確定待ち） |
| **高性能 AI 設計 Step B（05 schema 詳細）** | **Partial Go** | 05 §⑪ 昇格後、**YAML 化・validator** は高性能 AI 可。**H-04/H-06** は ADR 並行可だが確定前に実装しない（**H-05 ☑ · D-02 2026-06-07** → ADR-H-12） |
| **実装 Go（コード）** | **No-Go** | 設計ゲート 4 点 0/7 人間確定 · `design-before-implementation-gate.mdc` 有効 |

### Phase 0 前に **必ず** 人間が答えるもの（最小セット）

1. ~~**H-03**~~ — **確定** `it-hercules-laboratory-dev`（2026-06-07 · 作成済み）
2. ~~**H-15**~~ **☑ 2026-06-07** — R2 dev 接続検証済（probe `ihl/_phase0_probe/2026-06-07-probe.txt`）

### 高性能 AI 着手前に **強く推奨**（ブロッキングに近い）

3. ~~**H-01**~~ — **確定 B（2026-06-07）** — ADR-H-01
4. ~~**H-02**~~ — **確定 B+pairwise（2026-06-07）** — ADR-H-02
5. **H-04** — D-01（05 詳細設計の前提）· ~~**H-05**~~ **☑ D-02**（2026-06-07 · ADR-H-12）

### Auto で済ませてよい（本セッション実施分）

- 05 / 10 の schema stub 転記（詳細設計書から **引用のみ**）
- 2026.06,06 未昇格 inventory（§F）
- cross-ref · README リンク

---

## F. 2026.06,06 コンテンツ — IHL 未昇格 inventory

| 2026.06,06 ソース | 内容 | IHL 昇格先 | 状態 |
|-------------------|------|------------|------|
| `要件定義1` Part 1 §4–10 | 永続/真実源泉/検索順/Phase 1 | 05 §④ · HANDOFF | **部分** |
| `要件定義1` R2 ディレクトリ §2–13 | raw/normalized/derived/... | 05 · `05-運用/queues/r2-layout.md` **未作成** | **未** |
| `要件定義1` ファイル契約 | input/output manifest · run_info · errors | 05 OBS-R2-04 · 14 同型 | **部分** |
| `詳細設計書` schema 群 | 全 Parquet 列 | **05 §⑪** | **済（表）** · YAML **未** |
| `詳細設計書` 辞書 enum | 列挙正本 | **05 §⑪.2** · 10 tag | **済（表）** |
| `詳細設計書` tag_event/aggregate | append-only タグ | **10 §⑩** | **済（stub）** |
| `詳細設計書` 検索 rerank | 重み式 · individual 集約 | 05 OBS-IMG · **ADR-H-12** | **済（v0 暫定）** |
| `要件定義1` Part 6 / 詳細設計書 UI | Streamlit 5 pane | 05 UI 設計 | **未** |
| `要件定義1` §9 provenance | run_id/model/input_hash | 05 OBS-REP-IHL | **部分** |
| `要件定義1` Part 2–7 本文 | 「これから」明記 | — | **詳細設計書が代替圧縮** |
| `詳細設計書` component 詳細 v0.2 | ingest〜usage logger CLI | `05-運用/queues/components/` | **未** |
| `詳細設計書` テスト方針 · Makefile · 受入 | Phase 1 完了条件 | `docs/test/strategy.md` | **未** |
| — | 06/07/14/16/23 ドメイン | civ-os legacy + 各 IHL § | **2026.06,06 該当なし**（引き継ぎ §6） |

---

## G. データ・判断の充足度（要約）

| 質問 | 回答 |
|------|------|
| **下準備 doc は揃ったか？** | **はい** — 本ファイル + 05 §⑪ + 10 §⑩ + README リンク |
| **高性能 AI が invent なしで詳細設計に入れるか？** | **05 のみ Partial** — schema **表**は昇格済。YAML/validator/component 契約は Step 5–6。他 6 機能は要件 YES・詳細未 |
| **人間判断は足りるか？** | **Yes（Phase 0 ゲート + 経済/BBS）** — H-01/H-02/H-03/H-15/H-ECON/H-BBS **解決済み（2026-06-07）** |
| **Auto で Phase 0 まで完走できるか？** | **Partial** — H-15 検証まで人間/実行環境。**Yes** — Phase 0 spike 実装・`r2_probe` 仕様書と schema 表昇格は Auto/低コスト AI 可 |

---

*たたき台 · 非正本 · Phase 0 前チェックリスト · 実装禁止ゲート有効*
