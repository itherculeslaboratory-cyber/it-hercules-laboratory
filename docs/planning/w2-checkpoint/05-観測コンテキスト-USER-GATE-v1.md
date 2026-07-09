# 05 観測コンテキスト — USER GATE v1

> **日付**: 2026-07-06  
> **walkId**: `05ctx` · `05a` · 横断 `05tl` / タグ / UI テンプレ  
> **種別**: **ユーザー確定ゲート** — IMPL Go 2026-07-06  
> **実装**: `ObsContextPickerW2.tsx` · `obs-subscription-lab.ts` · `ObsSearchW2` 購読連携  
> **親 note**: [`05-観測-LAB-DESIGN-NOTE-v1.md`](./05-観測-LAB-DESIGN-NOTE-v1.md) · [`05-検索-LAB-DESIGN-NOTE-v1.md`](./05-検索-LAB-DESIGN-NOTE-v1.md)  
> **Oracle プロセス**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)  
> **採点**: ユーザー **100/100 確定**（2026-07-06）— [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) `v3-post-Akinator-tree` · [`W2-SUCCESS-PATTERNS-v1.md`](./W2-SUCCESS-PATTERNS-v1.md) §1

---

## 0. 実装ステータス（2026-07-06 IMPL Go · **user accepted 100/100**）

### 0.0 ユーザー採点（2026-07-06）

| 項目 | 値 |
|------|-----|
| **TOTAL** | **100 / 100** |
| **walkId** | `/s/05ctx` |
| **セッション** | v3 post-Akinator-tree（CAL-05-CTX-04） |
| **prior** | 0/100（CAL-05-CTX-03）— chrome · YouTube コピー · フラットツリー |

**What worked（ユーザー確定 · 再現パターン）**:

- **段階 UI 削除** — 卵/幼虫/蛹/成虫は 05ctx スコープ外（05i で確定）
- **IHL 用語** — 「観測対象の登録」「登録済み対象」；YouTube/チャンネル登録は比喩のみで UI 禁止
- **質問で絞る** — Akinator 式逐次 Q&A · 残り N 候補 · やり直し（[`05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1`](./05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1.md) 準拠）
- **分類ツリー** — 展開/折りたたみ · パンくず · ツリー内検索（GBIF/iNaturalist パターン）
- **chrome 修正** — lab シェル整合 · 検証前 dev server 再起動推奨
- **0pt feedback ループ** — verbatim → CAL 行 → research doc → fix（[`W2-SUCCESS-PATTERNS-v1`](./W2-SUCCESS-PATTERNS-v1.md) §1）

| 項目 | 状態 | 実装参照 |
|------|------|----------|
| G1 購読モデル（亜種/種 · 複数） | ✅ | `obs-subscription-lab.ts` · `ihl.observation.subscriptions.v1` |
| G2 05a = 購読リストのみ | ✅ | `ObsSearchW2` `obs-subscription-target` select |
| G3 last_picked 永続 | ✅ | `ihl.observation.last_target.v1` |
| G4 3 タブ（学名/質問/ツリー） | ✅ | `ObsContextPickerW2.tsx` |
| G5 横断 WorkflowContext | ✅ | `templateDomain` · context v1 localStorage |
| G6 ドメイン別タグ | ✅ | `tagFacetHint` · candidate tags（昆虫/魚/器物） |
| 05ctx 〔適用〕→ 05a | ✅ | `data-testid=obs-context-apply` |
| registry 分離 | ✅ | `ObsContextPickerW2` · `ObsRegistrationW2` から分離 |

**検証 URL（lab）**:

- `/s/05ctx` — 3 タブ · 購読追加/削除 · 〔適用〕
- `/s/05a` — 登録済み対象 select · 対象チップ → 05ctx
- `/s/05a?subscription_id=…` — 05ctx 適用後プリフィル

**localStorage キー**:

| キー | 用途 |
|------|------|
| `ihl.observation.subscriptions.v1` | 購読リスト（配列） |
| `ihl.observation.last_target.v1` | 05a 最後に選んだ subscriptionId |
| `ihl.observation.context.v1` | WorkflowContext（localStorage 正本） |

---

## 1. ユーザー verbatim / 決定表

| # | 領域 | ユーザー意図（要約） | ゲート決定 | 優先度 |
|---|------|----------------------|------------|--------|
| G1 | **購読モデル** | YouTube チャンネル登録のような感覚 — 興味ある対象を先に登録しておく | **購読（subscription）** を導入。最小単位は **亜種**。**種レベル**でも購読可。**複数購読**可。検索前にユーザーが関心対象を絞り、大規模データを **パーティション** する | MUST（lab v1 設計） |
| G2 | **05a 検索** | 検索は購読済みリストから選ぶ | 05a の対象フィルタは **購読リストのみ** から **1 件** 選択（**種** or **亜種** レベル） | MUST |
| G3 | **05a 永続化** | 前回選んだ対象を覚えておく | **最後に選択した購読対象** をセッション跨ぎで **remember**（localStorage / profile 方針は §7 Q2） | MUST |
| G4 | **05ctx ナビ 3 タブ** | 3 経路すべて使いたい | lab v1 で **3 タブすべて実装**: ① **学名検索** ② **質問で絞る** ③ **分類ツリー** | MUST（lab v1） |
| G5 | **横断スコープ** | 対象選択は検索だけじゃない | 05ctx の選択は **観測テンプレ（05tl 等）** · **UI 画面テンプレ** · **タグ** もスコープする。**WorkflowContext は観測 UX 全体の前提** | MUST（設計境界） |
| G6 | **タグのドメイン差** | 魚と昆虫で欲しいタグが違う | 構造化タグは **ドメイン依存**（例: 昆虫 `order:Coleoptera` vs 魚 `family:…`）。05ctx 選択の `path[]` / `domain` から派生 | MUST |

### 1.1 verbatim 抜粋（2026-07-06 · 親エージェント転記）

> **購読**: YouTube チャンネル登録のイメージ。最小単位は亜種。種レベルでも追加可。複数購読可。ユーザーが検索前に興味対象を絞る — 大規模時のデータパーティション。

> **05a**: 購読リストからのみフィルタ。種 or 亜種で 1 件選ぶ。最後に選んだ対象をセッション跨ぎで記憶。

> **05ctx ナビ**: lab で 3 タブすべて — 学名検索 / 質問で絞る / 分類ツリー。

> **横断**: 05ctx の選択は観測テンプレ・UI 画面テンプレ・タグもフィルタ。WorkflowContext は検索だけでなく観測 UX 全体をスコープする。タグはドメインで意味が変わる（魚 vs 昆虫）。

---

## 2. 購読モデル（prose 図）

**メタファ**: ユーザーは IHL に対し「観測したいチャンネル」（= 観測対象）を **事前登録** する。未登録の全生物・全器物を毎回ツリーから探すのではなく、**自分の関心パーティション** だけを日常操作の対象にする。

```text
[ユーザー関心]
    │
    ├─ 購読 A: Dynastes hercules hercules（亜種）     ← 最小推奨単位
    ├─ 購読 B: Dynastes hercules（種 · 亜種未区別可）  ← 種レベルも可
    ├─ 購読 C: 金魚（種）
    └─ 購読 D: 特定の皿カテゴリ（器物 · item 葉）
         │
         ▼
[WorkflowContext.active_target]  ← 05ctx〔適用〕で「今の作業対象」に昇格
         │
         ├─→ 05a 検索      … 購読リストから 1 件ピック → グリッド絞り込み
         ├─→ 05i 入力      … 対象チップ・タグ・段階プリフィル
         ├─→ 05tl テンプレ … target_scope 合致テンプレ優先
         ├─→ UI 画面テンプレ … ドメイン/対象スコープ合致
         └─→ タグ辞書       … domain に応じた構造化タグ facet
```

**スケール上の意図**: 全件ツリー・全件検索は **購読管理（05ctx / 設定）** と **作業コンテキスト（WorkflowContext）** に分離する。日常の 05a/05i は **購読済みパーティション内** で完結し、新規対象の追加は明示的な購読フローに限定する。

**既存 oracle との差分**: ADR-H-15/16 は `WorkflowContext`（単一作業前提）と `ObservationTarget` 選択を定義するが、**複数購読リスト** は本 user gate で **新規概念** として追加。正本昇格は §7 Q1 待ち。

---

## 3. 05ctx vs 05a — 責務分離

| 観点 | **05ctx**（観測対象ナビゲータ + コンテキスト） | **05a**（観測検索） |
|------|-----------------------------------------------|---------------------|
| **主タスク** | 何を観測するか **選ぶ・購読する・作業前提を決める** | 既存観測データを **読む・絞る・詳細へ** |
| **対象の出所** | 3 タブナビ（学名検索 / 質問で絞る / 分類ツリー）+ ドメイン選択 | **購読リストのみ**（G2） |
| **選択粒度** | 亜種まで（生物）· 種+亜種未区別 · 非生物はドメイン別葉 | 購読済みから **種 or 亜種 1 件** |
| **出力** | `WorkflowContext` 更新 · 構造化タグ生成 · 横断スコープ | capture グリッド · metadata/好みフィルタ |
| **永続** | context `ihl.observation.context.v1` · **購読リスト**（新規キー要設計） | **最後に選んだ購読対象**（G3） |
| **ナビゲータ** | **3 タブすべて lab 実装**（G4） | 対象チップタップ → 05ctx 再入 |
| **スコープ** | 観測 UX **全体**（G5） | 観測データ検索 **のみ** |

**混同禁止（維持）**:

- 05ctx の〔適用〕は **プリフィル** — taxonomy 確定は 05i でユーザー（OBS-CTX-02 · OBS-SOL-04）。
- 05a は **READ** 専用 — 新規観測登録の主導線ではない（TRN v2）。
- **購読の追加・削除** は 05ctx（または将来 12 設定）側。**05a から全件ツリーを開かない**（G2）。

---

## 4. 3 ナビゲータタブ — lab v1 最小スコープ

| タブ | lab v1 | 最低限の振る舞い | Oracle 出典 |
|------|--------|------------------|-------------|
| **① 学名検索** | **MUST 実装** | 学名/和名テキスト検索 → 候補行（文字のみ）→ 仮選択 → ステップ③ | ADR-H-16 §4 · `ui/コンテキスト.md` §2 |
| **② 質問で絞る** | **MUST 実装** | Akinator 式の段階質問（綱→目→… / 非生物は用途・素材等）→ 候補絞り込み。**確定しない** | ADR-H-16 §4 · **user gate が Phase 2 延期を上書き** |
| **③ 分類ツリー** | **MUST 実装** | 折りたたみツリー（文字インデント）· 生物は亜種葉まで | ADR-H-16 §4 · mock `ihl-05-obs-context-picker.png` |

### 4.1 lab v1 共通 MUST

| # | 要件 |
|---|------|
| N1 | **文字のみ** — サムネ・標本画像なし（OBS-TGT-02） |
| N2 | ステッパ ①ドメイン ②絞り込み ③確認 — 3 ステップ以内（`ui/コンテキスト.md` §2） |
| N3 | 生物: 亜種未到達時は 〔亜種未区別（種まで）〕必須 · 未到達かつ未区別なし → 〔適用〕無効（OBS-TGT-04） |
| N4 | 主 CTA **〔適用〕1 つのみ**（OBS-CTX-03） |
| N5 | empty / loading / error（OBS-NF-04） |
| N6 | 5 ドメインチップ（OBS-TGT-01） |

### 4.2 lab v1 SHOULD（購読連携）

| # | 要件 |
|---|------|
| S1 | ステップ③に **「購読に追加」** トグル or 副 CTA（購読リストへ追加） |
| S2 | 購読済み一覧へのショートカット（05a へ渡す前の確認） |
| S3 | タグプレビュー（path 由来 · OBS-TGT-06） |

### 4.3 既知の oracle 差分

| 項目 | 旧 oracle | 本 user gate |
|------|-----------|--------------|
| 質問で絞る | `ui/コンテキスト.md` §2「Phase 2」 | **lab v1 で MUST** |
| 05a 対象出所 | WorkflowContext クエリプリフィル（全候補想定） | **購読リストのみ** |
| 購読リスト | 未定義 | **新規 — G1** |

---

## 5. 横断スコープ — テンプレ・タグ・ドメイン

**WorkflowContext は「検索のフィルタ」ではない。** ユーザーが 05ctx で〔適用〕した対象は、観測ドメイン内の **読み書き UX 全体** のデフォルトスコープになる。

### 5.1 伝播先（G5 確定）

| 伝播先 | walkId / 領域 | スコープの効き方 | 設計参照 |
|--------|---------------|------------------|----------|
| 観測入力 | `05i` | 対象チップ · 段階 DD · タグプリフィル | OBS-CTX-01 · ADR-H-15 §5 |
| 観測検索 | `05a` | 購読リストから 1 件 → metadata facet + 好み rerank の前提 | 本 gate G2–G3 · [`05-検索-LAB-DESIGN-NOTE-v1.md`](./05-検索-LAB-DESIGN-NOTE-v1.md) |
| 計測テンプレ | `05tl` | `target_scope` 合致テンプレ優先表示 | OBS-TGT-07 · ADR-H-16 §1 |
| **UI 画面テンプレ** | Builder / 16 系 | ドメイン・対象スコープ合致テンプレを上位 | **新規 GAP** — 要件昇格待ち |
| **構造化タグ** | 05* 横断 | `path[]` + `domain` から facet · 入力候補 | OBS-TGT-06 · ADR-H-16 §5 |

### 5.2 タグのドメイン依存（G6）

| domain | タグ例（構造化） | 備考 |
|--------|------------------|------|
| `biological`（昆虫） | `order:Coleoptera` `family:Scarabaeidae` `subspecies:…` | 分類ランクに追従 |
| `biological`（魚） | `class:Actinopterygii` `family:Cyprinidae` `species:…` | **昆虫と同じ UI でも facet 辞書が異なる** |
| `artifact` | `category:container` `item:plate` | 器物カテゴリ木 |
| `digital` | `platform:…` `genre:…` `work:…` | 作品スコープ |
| `environment` | `place:…` `zone:…` | Phase 3 接続 |
| `custom` | ユーザー定義 `custom:…` | 自由タグは補助 |

**ルール**: タグ facet の **表示・候補・フィルタキー** は `WorkflowContext.target.domain` で切り替える。05ctx ステップ③のタグプレビューは、このドメイン別セットの **ライブプレビュー** とする。

### 5.3 横断データフロー（prose）

```text
05ctx〔適用〕
  → WorkflowContext { target, stage_name, tags[] }
       ├─ 05tl:  WHERE target_scope PREFIX match path[]
       ├─ 05a:   subscribed_target_id = last_picked ∩ active
       ├─ 05i:   header chips + tag suggestions
       ├─ UI tmpl: scope_id match domain + path prefix
       └─ global: 文脈バー対象チップ（ADR-H-14 × H-15）
```

---

## 6. OBS-CTX-01 · ADR-H-15 · ADR-H-16 との関係

### 6.1 OBS-CTX-01（伝播 FR）

| 項目 | 既存 | 本 user gate の拡張 |
|------|------|---------------------|
| 伝播先 | 05i / 05a / 05tl | **+ UI 画面テンプレ** · **タグ facet**（G5） |
| 伝播手段 | クエリ + localStorage | 維持 · **+ 購読リスト** · **+ last_picked** |
| 性質 | プリフィルのみ | **維持** — 確定は 05i（OBS-CTX-02） |

正本: [`obs-ctx-01.md`](../../02-設計/features/05-観測/slices/fr/obs-ctx-01.md) · [`ADR-H-15`](../../02-設計/_横断/adr/ADR-H-15-観測コンテキスト.md) §2/§5

### 6.2 ADR-H-15（WorkflowContext · propagation）

| 項目 | 整合 |
|------|------|
| `ihl.observation.context.v1` | **維持** — `target` + `stage_name` + 任意 `phase` |
| `ObservationTarget` 参照 | **維持** — 購読エントリも同型を参照 |
| 文脈バー統合 | **維持** — 対象チップ → 05ctx |
| **新規** | `subscriptions[]`（複数）と `active_target` の分離は **ADR 追記候補**（§7 Q1） |

### 6.3 ADR-H-16（対象ナビゲータ · what to select）

| 項目 | 整合 |
|------|------|
| 5 ドメイン | **維持** |
| 亜種必須 / 亜種未区別 | **維持** |
| 3 経路 | **user gate で lab v1 全タブ MUST**（Phase 2 延期を上書き） |
| 構造化タグ | **維持** · G6 でドメイン差を明示強化 |
| 文字のみ | **維持** |

### 6.4 責務の再確認

```text
ADR-H-16  … 何を選ぶか（ナビゲータ UI · ObservationTarget）
ADR-H-15  … 選んだものをどう伝播するか（WorkflowContext）
本 user gate … 複数購読 + 05a は購読のみ + 横断スコープ拡張
OBS-CTX-01 … 上記の観測画面への伝播 FR（スコープ拡張は要件追記候補）
```

---

## 7. 次回ユーザーレビュー用 Open items

| # | 質問 | デフォルト（silent 時） | ブロック |
|---|------|-------------------------|----------|
| Q1 | **購読リスト**の正本キー・スキーマ（`ihl.observation.subscriptions.v1`?）と profile 同期 | localStorage のみ · 配列 of `ObservationTarget` 軽量参照 | ADR-H-15 追記 · DET § |
| Q2 | **last_picked** の永続先 — localStorage のみ vs profile 同期 | localStorage（05a 専用 `last_subscribed_target_id`） | G3 IMPL |
| Q3 | 購読 **種 vs 亜種** が混在するとき 05a の既定表示 | リスト順先頭 · last_picked 優先 | UX 仕様 |
| Q4 | **質問で絞る** の lab 深度 — 昆虫のみフル vs 全ドメイン stub | 生物フル · 他ドメインは 3 問 stub | G4 工数 |
| Q5 | **UI 画面テンプレ** スコープの正本 walkId / FR ID | Builder 16 系 xref · 新 FR 候補 | G5 要件昇格 |
| Q6 | 購読 **上限数** · 並び替え · 削除 UI の場所（05ctx vs 12 設定） | 上限なし · 05ctx 内一覧 + 設定リンク | スケール |
| Q7 | 未購読対象の観測データが 05a に **一切出ない** でよいか | **はい** — 購読パーティション外は非表示。追加は 05ctx 経由 | G2 確認 |
| Q8 | 既存 `05-検索-LAB-DESIGN-NOTE` §3.3（全候補プリフィル）との置換 | **本 gate が勝つ** — §13 参照 | 05a design note 更新済み |

---

## 8. 関連ドキュメント索引

| 文書 | 関係 |
|------|------|
| [`05-観測-LAB-DESIGN-NOTE-v1.md`](./05-観測-LAB-DESIGN-NOTE-v1.md) | 05ctx/05i/05confirm lab oracle — §2.1 を本 gate で拡張 |
| [`05-検索-LAB-DESIGN-NOTE-v1.md`](./05-検索-LAB-DESIGN-NOTE-v1.md) | 05a — §0/§13 から本 gate へリンク |
| [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md) | 購読・3 タブ・横断は **次版 checklist 追記候補** |
| [`ui/コンテキスト.md`](../../02-設計/features/05-観測/ui/コンテキスト.md) | 05ctx UI 正本 — 質問タブ Phase を user gate が上書き |
| [`ADR-H-15`](../../02-設計/_横断/adr/ADR-H-15-観測コンテキスト.md) | WorkflowContext 伝播 |
| [`ADR-H-16`](../../02-設計/_横断/adr/ADR-H-16-観測対象ナビゲータ.md) | 3 経路ナビゲータ |

---

*v1 · 2026-07-06 user gate 記録 · **IMPL Go 2026-07-06** · **user 100/100 2026-07-06** · CAL-05-CTX-01 → CAL-05-CTX-04*
