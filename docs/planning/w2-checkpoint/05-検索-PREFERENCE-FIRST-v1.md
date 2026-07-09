# 05 検索 — PREFERENCE-FIRST v1

> **日付**: 2026-07-06  
> **walkId**: `05a` · 連携 `10`（好み学習）  
> **トリガー**: ユーザー mental model — 検索は **好み学習ベクトル起点** · 近接順ランク · パラメータ調整後に再検索  
> **親 note**: [`05-検索-LAB-DESIGN-NOTE-v1.md`](./05-検索-LAB-DESIGN-NOTE-v1.md)  
> **Oracle プロセス**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)  
> **スコープ**: 設計分析のみ · **IMPL 禁止**

---

## 0. 結論（エグゼクティブ）

ユーザーの preference-first メンタルモデルは **方向性として正しい** が、現行 05a oracle は **metadata フィルタ優先** で、好みベクトル連携は **#10 側にスケッチのみ・05a には未記載**。

| 論点 | 結論 |
|------|------|
| 好み学習は詰まっているか？ | **半分確定・半分 GAP** — 実装待ちで止まっているわけではない |
| preference-first フロー | **#10 doc と整合** — 05a oracle には **未反映** |
| 05a UI 導出 | 既定 **好み近い順** · profile 1 行帯 · cold start → `/s/10` |
| 05a ラボ先行可否 | **mock profile で Go 可** — `/s/10` 完全実装は不要 |
| 親 note 更新 | **好み連携が silent** — §3.6 追記 · 二系統 rerank 分離 |

---

## 1. 好み学習設計は「詰まっている」か？

**結論: 半分確定・半分 GAP。実装待ちで止まっているわけではなく、05 検索への接続仕様が未昇格。**

### 1.1 CONFIRMED（設計・人間確定済み）

| 領域 | Oracle 出典 | 内容 |
|------|-------------|------|
| データ正本 | [`ADR-H-02`](../../02-設計/_横断/adr/ADR-H-02-matchapp-pairwise-preference.md)（2026-06-07 採用） | `preference_event` 単一ストリーム · pairwise 本線 · `/match` = 好み導線 |
| 要件 | [`01-要件/10-マチアプ.md`](../../01-要件/10-マチアプ.md) | FR-MCH-PAIR-* · FR-MCH-REC-*（おすすめ一覧・コサイン類似 stub） |
| 集計パイプライン（スケッチ） | [`10-マチアプ-詳細設計-v1.md`](../../02-設計/features/10-マチアプ/10-マチアプ-詳細設計-v1.md) §4 | `preference_event` → `preference_profile` → **検索 rerank boost 供給** |
| 遷移 | [`10-マチアプ-遷移設計-v1.md`](../../02-設計/features/10-マチアプ/遷移設計-v1.md) | entry → ①おすすめ → ②pairwise → 収束 → **「検索に反映」** |
| UI | [`10-マチアプ/ui/UI設計-v1.md`](../../02-設計/features/10-マチアプ/ui/UI設計-v1.md) | pairwise · 収束サマリ · **プレビュー帯**（観測グリッド並びイメージ） |
| API コア | [`10-マチアプ/詳細設計-v3.md`](../../02-設計/features/10-マチアプ/詳細設計-v3.md) §7.1 | `GET /match/pair` · `POST /match/vote` → `preference_event` INSERT は **緑** |

### 1.2 GAP（未確定 · xref）

| 領域 | Oracle 出典 | 内容 |
|------|-------------|------|
| 検索ブースト接続 | [`10-マチアプ/詳細設計-v3.md`](../../02-設計/features/10-マチアプ/詳細設計-v3.md) P2 | `valueCheckSearchBoost` は **xref** — 05 検索基盤未接続 |
| boost 重み | [`10-マチアプ-詳細設計-v1.md`](../../02-設計/features/10-マチアプ/10-マチアプ-詳細設計-v1.md) §4 | 重みは **H-05 待ち**（※ [`ADR-H-12`](../../02-設計/_横断/adr/ADR-H-12-D02-類似検索重み.md) は **類似 rerank** の D-02 のみ解決。好み boost 重みは別） |
| ベクトル次元 | `FR-MCH-REC-05`（[`01-要件/10-マチアプ.md`](../../01-要件/10-マチアプ.md)） | contribution vectors + コサイン類似は **§AI 仮定 stub** |
| DET/UI ゲート | 各 v1 草案 | 「人間確定待ち」「実装禁止ゲート有効」 |
| 05 類似 rerank 本番 | F05-03=B（[`00-M-082前-人間判断-回答-v1.md`](../../05-運用/queues/00-M-082前-人間判断-回答-v1.md)） | OBS-IMG-04/05 は **v2 stub のみ** |

### 1.3 lab-only（W2 現状）

| walkId | 状態 |
|--------|------|
| **`/s/10`** | `screens.json` + mock PNG のみ。**W2 override なし**。hotspot「プレビュー帯」は定義あるが未実装 |
| **`/s/05a`** | catalog `ObsSearchGrid.tsx` 流用。**W2 override なし**（`GAP-TD-05-003`）。主 CTA「類似を検索」は copy-spec と矛盾 |

**ユーザー直感「設計 doc に既にあるはず」→ 半分正しい。** #10 の pairwise · profile · 「検索に反映」は doc 化済み。**05a が好み順で並ぶこと**は 05 の TRN/UI/copy-spec には **まだ書かれていない**。

---

## 2. 好み優先検索フロー（散文シーケンス）

設計 doc を統合した **意図フロー**（現行 05a oracle との差分は §5 参照）:

```text
[1] ユーザーが HOME 左ナビ「好み学習」→ /s/10 (/match)
      ↓
[2] ① おすすめ一覧（FR-MCH-REC-02）
      · preference_event 累積 → preference_profile（価値観ベクトル/特徴重み）
      · 個体とのコサイン近接度でランク（cold start は人気・新着フォールバック）
      ↓
[3a] 「好みをもっと精緻化する」→ ② pairwise ループ
      · 各 choice → preference_event append-only
      · aggregator が profile を再生成（上書き禁止・ビュー再生成）
      ↓
[3b] 収束サマリ（N=10 ラウンド or 収束判定）
      · 傾向表示（大型・黒系 等）
      · 〔検索に反映〕→ 05a へ遷移（profile を検索コンテキストに載せる）
      ↓
[4] /s/05a 観測検索 — 初回 mount
      · WorkflowContext プリフィル（species/stage 等）— OBS-CTX-01
      · **好み profile があれば**: デフォルト sort = 好み近い順（ユーザー期待）
      · **なければ**: 新着 or 無順（API 既定）+ 「好みを教える」導線
      ↓
[5] ユーザーが metadata フィルタ調整（species · sex · stage_name · view_type）
      · 主 CTA 〔絞り込む〕/ 検索（フィルタ適用）— TRN §5
      ↓
[6] 結果グリッド再取得・再ランク
      · フィルタ後 subset に対し preference proximity で並べ替え
      · カード → 05b 詳細
      ↓
[7] 05b 詳細の「類似個体」（別系統）
      · 種子 capture から OBS-IMG-05 rerank（ADR-H-12: emb/color/size/lineage）
      · これは「好み順」とは別 — 個体間類似探索
```

### 2.1 二系統 rerank 分離（設計上すでに分かれている）

| 系統 | 定義 | Oracle |
|------|------|--------|
| **好み rerank** | ユーザーの `preference_profile` と capture 特徴の近接（#10 → 05a グリッド） | `10-マチアプ-詳細設計-v1` §4 · `FR-MCH-REC-02` |
| **類似 rerank** | 特定 capture を種子にした OBS-IMG-05（**05b 側** · F05-03 stub） | [`ADR-H-12`](../../02-設計/_横断/adr/ADR-H-12-D02-類似検索重み.md) · [`01-要件/05-観測.md`](../../01-要件/05-観測.md) §4.14 |

---

## 3. このモデルから 05a UI 要素を導出

### 3.1 05a に MUST（好み優先モデル採用時の追加）

| UI 要素 | Oracle 根拠 | 備考 |
|---------|-------------|------|
| **並び替えツールバー** | ユーザー期待 + #10「検索に反映」 | 既定 = **好み近い順**（≠ 06 の好み新着順） |
| **好みプロファイル帯**（1 行） | [`10 UI §5`](../../02-設計/features/10-マチアプ/ui/UI設計-v1.md) 収束サマリの要約 | 例:「大型・黒系を好む（収束 78%）」· タップ → `/s/10` |
| **好み一致インジケータ** | `FR-MCH-REC-06` 理由 1 行の 05a 版 | カードに「好み」chip または理由 1 行（SHOULD） |
| **cold start 導線** | `FR-MCH-REC-04` | profile 無し時「好みを教える」→ `/s/10` |
| 既存 MUST（変更なし） | [`05-検索-LAB-DESIGN-NOTE-v1`](./05-検索-LAB-DESIGN-NOTE-v1.md) §3 | フィルタ Card · 主 CTA 1 つ · grid · WorkflowContext · empty/loading/error |

### 3.2 05a に SHOULD（調整可能パラメータ）

| 要素 | 調整後の挙動 | Oracle |
|------|-------------|--------|
| species / sex / stage_name / view_type | whitelist フィルタ — **好み seed の後も変更可** | [`詳細設計-v3`](../../02-設計/features/05-観測/詳細設計-v3.md) §2.3 · [`capturesearchrequest.md`](../../02-設計/features/05-観測/slices/schema/capturesearchrequest.md) |
| キーワード（capture_id / タグ） | mock 参考 | lab toolbar |
| 並び替え副オプション | 新着順 · （将来）体長順 等 — **好み近い順が default** | 本 doc §3.3 |
| 件数 `N 件` | DET §3.3 `total` | [`詳細設計-v3`](../../02-設計/features/05-観測/詳細設計-v3.md) |

### 3.3 10 に置く（05a に載せない）

| 要素 | Oracle 根拠 |
|------|-------------|
| pairwise 2 枚 UI · 左/右/どちらも× | [`ADR-H-02`](../../02-設計/_横断/adr/ADR-H-02-matchapp-pairwise-preference.md) · [`10 UI §3`](../../02-設計/features/10-マチアプ/ui/UI設計-v1.md) |
| 収束度 · N ラウンドカウンタ | `FR-MCH-PAIR-05` · `FR-MCH-UX-07` |
| ValueCheck 詳細オーバーレイ | INV-PE-03（詳細のみ writer） |
| プレビュー帯（学習中の並びイメージ） | [`10 UI §1`](../../02-設計/features/10-マチアプ/ui/UI設計-v1.md) 副次 |
| preference_event 記録 API | [`10 DET §6`](../../02-設計/features/10-マチアプ/詳細設計-v3.md) |

### 3.4 implicit（画面に出さない）

| 要素 | 理由 |
|------|------|
| 生のベクトル値・重み係数 | NFR-MCH-01 離散モデル · ユーザー向けに数値スコア非開示が自然 |
| rerank 合成式（emb 0.5 + preference boost） | ADR-H-12 は類似用。好み boost 合成は **未 ADR 化** |
| `preference_event` JSONL | バックエンド · aggregator のみ |

### 3.5 デフォルト sort の答え

| ラベル | 定義 | 採用 |
|--------|------|------|
| **好み近い順** | `FR-MCH-REC-02` のコサイン近接ランク | **05a 既定として妥当** |
| **好み新着順** | [`06-マーケット-LAB-DESIGN-NOTE-v3`](./06-マーケット-LAB-DESIGN-NOTE-v3.md) のマーケット慣習（好み一致を先に、同順位は新着） | **時系列が重要な出品一覧向け** — 観測カタログの主 sort としては doc 未採用 |
| （現行 05a oracle） | `POST /search` に sort パラメータなし · `CaptureSearchRequest` 7 フィールドのみ | **sort 自体が無い** |

### 3.6 スコア・プロファイル表示

| 表示 | 推奨 | Oracle |
|------|------|--------|
| preference match score（数値） | **非表示**（SHOULD NOT） | `FR-MCH-REC-06` — 理由 1 行 + chip で十分 |
| active preference profile | **1 行サマリ + 収束度**（SHOULD）— ログイン時のみ | `NFR-MCH-02` |
| 未ログイン | 好み sort 無効 · 公開検索は OBS-GAP-01 維持 | [`01-要件/05-観測.md`](../../01-要件/05-観測.md) §4.18 |

---

## 4. 依存関係: 05a ラボは /s/10 完全実装なしで進めるか？

**はい、進められます。**

| 根拠 | Oracle |
|------|--------|
| lab mock 可 | [`05-検索-LAB-DESIGN-NOTE-v1`](./05-検索-LAB-DESIGN-NOTE-v1.md) §0 |
| アルゴリズム stub 明示 | `FR-MCH-REC-05` |
| サンプルデータ表示で可 | `NFR-MCH-04` |
| 検索ブーストは xref（本番接続は後追い） | [`10 DET v3`](../../02-設計/features/10-マチアプ/詳細設計-v3.md) P2 |

### 4.1 推奨 lab 契約

```text
localStorage / query: preference_profile_mock = { prefer: [...], avoid: [...], confidence: 0.78 }
05a mount 時に読み込み → mock dataset を cosine/stub で reorder
profile 無し → 新着 or 固定順 + cold start CTA → /s/10
```

| 項目 | 判定 |
|------|------|
| `/s/10` は mock PNG + hotspot で十分 | pairwise インタラクションは別 checklist |
| 05a は **profile の存在/非存在と sort 振る舞い** を先に検証可能 | — |
| **ブロックしないもの** | pairwise 10 ラウンド収束 · 本番 aggregator · boost 重み ADR |
| **ブロックするもの（05a 単体）** | なし — 既存 oracle（フィルタ · grid · 状態）を先に満たせば OK |

---

## 5. `05-検索-LAB-DESIGN-NOTE-v1` との矛盾と更新案

| # | 矛盾 | 更新方針 |
|---|------|----------|
| C1 | note は **filter-first**（TRN §5）のみ。好み sort · profile 帯 **未記載** | §3.6 **好み連携（SHOULD · user gate）** 追加 → 本 doc へ xref |
| C2 | 検索入口は HOME **secondary「検索」**（`01` design note §2.3）。ユーザーは **好み学習が起点** | 導線を二系統明記: ①好み→検索に反映 ②直接検索。どちらも 1 click |
| C3 | OBS-IMG-04/05 を note が引用するが **05b 類似** と **05a 好み sort** が混同しやすい | §1.1 に「好み rerank ≠ 類似 rerank」注記 |
| C4 | 主 CTA「類似を検索」は **05b 副導線**（note §5 Q3 既解決） | 変更不要。好み sort は **ツールバー** に置く（主 CTA と分離） |
| C5 | `CaptureSearchRequest` に sort 無し | lab では **クライアント側 reorder** と明記。API 拡張は IMPL-GAP |
| C6 | 06 ラボの「好み新着順」を 05a に流用するとユーザー期待とズレ | 05a 既定は **好み近い順** と明記（06 とは別ラベル） |

---

## 6. エグゼクティブ要約（会話用）

1. **好み学習は詰まっていない** — ADR-H-02 · 要件 · 遷移/UI 草案は揃っている。詰まっているのは **「profile → 05a グリッド sort」** の接続仕様と boost 重み。
2. **ユーザーの preference-first フローは #10 doc と整合** するが、**05a の現行 oracle には未反映**。今の 05a は metadata フィルタ + 無 sort が正本。
3. **05a に足すべきは**: 既定 **好み近い順**（好み新着順ではない）· profile 1 行帯 · 好み chip/理由 · cold start → `/s/10`。pairwise 本体は 10 に置く。
4. **05a ラボは mock profile で先行 Go 可** — `/s/10` 完全実装は不要。
5. **`05-検索-LAB-DESIGN-NOTE-v1` は好み連携が silent** — §3.6 追記済み（本 doc 正本）。類似 rerank（05b / ADR-H-12）と好み rerank（#10 profile）の二系統を分離して書くこと。

---

*v1 · design analysis only · IMPL 未着手 · 親 note §3.6 へ xref*
