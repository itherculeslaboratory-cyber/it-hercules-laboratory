# ADR-H-16 — 観測対象ナビゲータ（Observation Target Navigator）

> **ステータス**: **草案 v1 · 人間レビュー待ち**（2026-06-09 · ユーザー承認アプローチ「観測対象ナビゲータ」を設計化）
> **背景**: ユーザー指摘 — 観測は **昆虫だけではない**（生物・無機物（皿等の器物）・ゲーム等のデジタル・環境・カスタム）。観測対象を選ぶとき、(1) **生物は亜種まで**到達する（または「亜種未区別（種まで）」を明示）、(2) **絵を出さず文字だけ**で選ぶ（ピッカー・ナビゲータにサムネイルを置かない）、(3) **学名検索 / 質問で絞る（Akinator 式）/ 分類ツリー** の 3 経路、(4) 選んだ対象から **構造化タグ**を観測に紐付けて検索・整理したい。
> **役割分担（混同禁止）**: [ADR-H-15](./ADR-H-15-観測コンテキスト.md) は **「決めた対象をどう各観測画面へ伝播するか」（context propagation）**。本 ADR-H-16 は **「何を観測対象として選ぶか」（what to select · ナビゲータ）**。H-15 の `WorkflowContext.species`（文字列）を、本 ADR の **`ObservationTarget` 参照**に格上げする。
> **前提**: taxonomy / 対象の **確定は常にユーザー**（[`05-観測.md`](./05-観測.md) OBS-SOL-04 · OBS-TAX-07）。外部（GBIF / Wikidata）は **候補・テキストメタの根拠**にとどめ、**UI 用に画像取得しない**。
> **実装禁止ゲート**: 設計 4 点未確定。本書はたたき台（`.cursor/rules/design-before-implementation-gate.mdc`）。

---

## 1. 決定（要約）

観測ドメインに **`ObservationTarget`（観測対象）** という第一級エンティティを導入し、その選択 UI として **観測対象ナビゲータ**（文字のみ）を定義する。

- **多ドメイン**: 昆虫専用にしない。`domain ∈ { biological | artifact | digital | environment | custom }`。
- **生物は亜種必須**: `domain=biological` は **亜種（subspecies）レイヤーまで到達**する。到達できない場合は **明示ラベル「亜種未区別（種まで）」**（`subspecies_status=undetermined_to_species`）を必ず付ける。空欄での確定を許さない。
- **文字のみ UI**: ナビゲータ・ピッカーに **画像 / サムネイルを出さない**（学名・和名・分類パス・属性テキストのみ）。GBIF / Wikidata は **テキストメタの参照のみ**（UI 画像取得なし）。
- **3 経路の絞り込み**: ① **検索**（生物=学名/和名、非生物=キーワード）② **質問で絞る**（Akinator 式・確定しない）③ **分類ツリー / カテゴリツリー**（生物=分類階層、非生物=ドメイン別カテゴリ木）。
- **構造化タグ**: 選んだ対象の **分類パス（path[]）** から構造化タグを生成し、観測に紐付ける（検索・整理用）。
- **テンプレ scope**: 計測テンプレは `target_scope`（domain + 分類パス接頭辞）で絞り込む。**令（instar）・フェーズは 05i 入力側**（対象選択 05ctx には置かない）。

---

## 2. `ObservationTarget` データ契約（たたき台）

```jsonc
// 例: localStorage / WorkflowContext から参照（ADR-H-15 §2 拡張）
{
  "target_id": "tgt_01J...",          // ULID（確定時に発番）
  "domain": "biological",             // biological | artifact | digital | environment | custom
  "path": [                           // ルート→葉の分類パス（順序付き）
    "Animalia", "Arthropoda", "Insecta", "Coleoptera",
    "Scarabaeidae", "Dynastes", "Dynastes hercules",
    "Dynastes hercules hercules"
  ],
  "rank": "subspecies",               // 葉ノードのランク（domain 別 · §4）
  "display_ja": "ヘラクレスオオカブト（原名亜種）", // 表示名（和名・任意 alias）
  "display_alias": "Heracules hercules", // 表示 alias（OBS-TAX-06 · 確定値ではない）
  "canonical_ids": {                  // 外部 ID（候補根拠・テキストのみ）
    "gbif_taxonKey": "1234567",
    "wikidata_qid": "Q193324"
  },
  "subspecies_status": "resolved",    // biological 専用: resolved | undetermined_to_species
  "tags": [                           // path 由来の構造化タグ（§5）
    "domain:biological", "order:Coleoptera", "family:Scarabaeidae",
    "genus:Dynastes", "species:Dynastes hercules",
    "subspecies:Dynastes hercules hercules"
  ],
  "set_at": "2026-06-09T07:00:00Z",
  "source": "user_confirmed"          // user_confirmed（確定はユーザーのみ）
}
```

| フィールド | 必須 | 内容 | 備考 |
|------------|:----:|------|------|
| `target_id` | 確定時 | ULID `tgt_{ulid}` | 確定（保存）時に発番。下書き中は未発番でよい |
| `domain` | ○ | `observation_target_domain.yaml` enum | §3 |
| `path` | ○ | 分類パス配列（ルート→葉） | 空配列禁止。生物は §4 のランク列に整合 |
| `rank` | ○ | 葉ノードのランク | domain 別（生物=subspecies/species 等） |
| `display_ja` | ○ | 表示名（和名 / ローカル名） | UI 表示の主。検索・タグ化と別管理 |
| `display_alias` | 任意 | 表示 alias | OBS-TAX-06（`Heracules hercules` 等） |
| `canonical_ids` | 任意 | 外部 ID（GBIF/Wikidata 等） | **候補根拠のみ**・確定値に混ぜない（OBS-TAX-07） |
| `subspecies_status` | 生物のみ ○ | `resolved` / `undetermined_to_species` | §4.1（亜種必須ルール） |
| `tags` | ○ | path 由来の構造化タグ | §5 の生成規則 |
| `set_at` / `source` | ○ | 設定時刻・出所 | 確定は常に `user_confirmed` |

> **混同禁止**: `ObservationTarget` は **観測の対象（何を観たか）の確定値**。[ADR-H-15](./ADR-H-15-観測コンテキスト.md) の `WorkflowContext` は **作業中の前提（プリフィル）**。コンテキストは対象を **初期表示するだけ**で、観測レコードの対象は入力画面でユーザーが確定する（OBS-CTX-02 · OBS-SOL-04）。

---

## 3. ドメイン enum と判別

正本: [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/observation_target_domain.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/observation_target_domain.yaml)。

| domain | 例 | 葉ランク（rank） | 分類ツリー正本 |
|--------|-----|------------------|----------------|
| `biological` | カブトムシ・植物・菌類・魚 | **subspecies**（不可なら species + 未区別ラベル） | [`biological_rank.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/biological_rank.yaml) · GBIF/Wikidata 参照 |
| `artifact` | 皿・容器・工具（無機物・器物） | `item`（カテゴリ葉） | [`artifact_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/artifact_category_tree.yaml) |
| `digital` | ゲーム作品・ソフト | `work`（作品） | [`digital_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/digital_category_tree.yaml) |
| `environment` | 飼育ケース・棚・部屋（観測の場） | `place`（場所/区画） | Phase 3（Placement と接続 · OBS-ENV-03） |
| `custom` | 上記に当てはまらない自由対象 | `custom`（自由葉） | 自由パス（弱 enum・タグのみ） |

- **生物以外も同じ 3 経路**を持つが、検索語と分類木の正本が異なる（生物=学名/分類、器物=カテゴリ名、デジタル=ゲーム名/ジャンル）。
- `environment` は観測「対象」だけでなく観測「場」を指しうる。Phase 3 で Placement（棚・ケース）と接続する（Phase 1/2 は最小限）。

---

## 4. ドメイン別ナビゲーション（3 経路）

各ドメインに **3 タブ** を用意する（文字のみ）。

| 経路 | biological | artifact | digital | 確定するか |
|------|-----------|----------|---------|:----------:|
| ① **検索** | 学名 / 和名 検索（GBIF/Wikidata テキスト候補） | カテゴリ名・通称キーワード | 作品名・ジャンル名 | しない（候補） |
| ② **質問で絞る** | Akinator 式（綱→目→…の選択式質問） | 用途・素材・形状の選択式 | プラットフォーム・ジャンルの選択式 | しない（OBS-TAX-05） |
| ③ **分類 / カテゴリツリー** | 界→門→…→亜種（[`biological_rank.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/biological_rank.yaml)） | 容器›皿 等（[`artifact_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/artifact_category_tree.yaml)） | ゲーム›ジャンル›作品（[`digital_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/digital_category_tree.yaml)） | しない（候補提示） |

> 3 経路はいずれも **候補提示**。**確定は最終確認ステップでユーザーが行う**（OBS-SOL-04 · OBS-TAX-07）。質問経路（Akinator）は Phase 2（§7）。

### 4.1 生物：亜種必須ルール（最重要）

`domain=biological` の対象を確定するとき、次のいずれかを **必ず満たす**:

1. **亜種まで到達**: `path` の葉が subspecies ランク。`rank=subspecies` · `subspecies_status=resolved`。
2. **明示ラベル**: 亜種が分からない / 単型種で亜種が無い場合は、**「亜種未区別（種まで）」を明示**。`rank=species` · `subspecies_status=undetermined_to_species`。`display_ja` 末尾に「（亜種未区別）」を付す。

- **空欄での確定を禁止**: subspecies に到達せず、かつ未区別ラベルも付けない状態では **〔確定〕ボタンを無効**にする。
- 単型種（亜種が記載されていない種）は **`undetermined_to_species` ではなく** `resolved`（種=亜種相当）として扱える（辞書の `monotypic` フラグで判定 · 判定不能なら未区別）。
- **境界**: 亜種の同定は科学的に難しい場合があるため、未区別ラベルは **正当な選択肢**であり、後から観測を重ねて亜種を確定し直せる（append-only・新 `ObservationTarget`）。

### 4.2 非生物：葉カテゴリ必須

`artifact` / `digital` / `custom` も **葉ノードまで**（または「分類未確定」明示）を求めるが、生物のような階数固定はしない。`custom` は自由パスで葉=`custom`。

---

## 5. タグ生成規則（path → structured tags）

確定した `ObservationTarget.path` から **構造化タグ**を生成し、観測（capture/observation · IHL tag_event）に紐付ける。

| ルール | 内容 |
|--------|------|
| **namespace 接頭辞** | 各タグは `key:value` 形式（`order:Coleoptera`・`category:皿`・`genre:RPG`）。検索・facet 用 |
| **domain タグ** | 先頭に `domain:<domain>` を必ず付与 |
| **生物の主要ランク** | `order` / `family` / `genus` / `species` / `subspecies` をタグ化（界・門・綱は任意。検索 facet 過多を避ける） |
| **非生物のパス** | `artifact`=`category` / `subcategory`、`digital`=`platform`/`genre`/`work` をタグ化 |
| **未区別の明示** | 生物 `undetermined_to_species` のときは `subspecies:undetermined` を付与（空にしない） |
| **append-only** | タグは IHL `tag_event`（[ADR-H-05](./ADR-H-05-ガバナンス-v1.3.md) · tag_action）として追記。訂正は新イベント |
| **検索接続** | 観測検索 05a の facet・テンプレ `target_scope` 絞り込みに使う（[`05-観測.md`](./05-観測.md) §4.5 query whitelist の `tag includes` と整合） |

> タグは **対象由来（machine-derived from path）** と **ユーザー追加** を `source_type`（ADR-H-05）で区別する。対象を変更しても過去観測のタグは不変（append-only）。

---

## 6. 計測テンプレの `target_scope`（§4.9 OBS-TPL 連携）

計測テンプレ（[ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md)）の適用範囲を、従来の「性別」だけでなく **`target_scope`** で絞る。

```jsonc
"target_scope": {
  "domain": "biological",
  "path_prefix": ["Animalia", "Arthropoda", "Insecta", "Coleoptera"] // 鞘翅目以下に適用
}
```

| 規約 | 内容 |
|------|------|
| マッチ | `ObservationTarget.domain == target_scope.domain` かつ `path` が `path_prefix` で始まる |
| 粒度 | `path_prefix=[]`（domain のみ）で「そのドメイン全体」。深いほど限定（属・種・亜種テンプレ） |
| 令 / フェーズは別 | **instar（令）・phase・sex は 05i 入力側**の属性（[`05-観測-入力UI設計-v1.md`](./05-観測-入力UI設計-v1.md)）。`target_scope` には入れない |
| 一覧の絞り込み | テンプレ一覧 05tl は WorkflowContext の対象で `target_scope` 合致テンプレを上位表示（[`05-観測-計測テンプレ-UI設計-v1.md`](./05-観測-計測テンプレ-UI設計-v1.md) §2.5） |

> **境界**: `target_scope` は「どの対象に向くテンプレか」。**令・性別・発育段階は観測ごとに変わる入力属性**なので、対象スコープと混ぜない（誤って令単位のテンプレを量産しない）。

---

## 7. ロールアウト（Phase 1 / 2 / 3）

| Phase | 範囲 |
|-------|------|
| **Phase 1** | `biological` + `artifact` + `custom`。経路は **① 検索 + ③ 分類/カテゴリツリー**。生物は GBIF/Wikidata の **テキストメタ参照**（画像なし）。亜種必須ルール・未区別ラベル・タグ生成・`target_scope` 絞り込み |
| **Phase 2** | **② 質問で絞る（Akinator · TOT-OBS-03）** を全ドメインに。`digital` ドメイン本格対応（ゲーム木）。自由入力対象の alias 統合提案（append-only） |
| **Phase 3** | `environment` ドメイン（Placement/棚・ケースと接続 · OBS-ENV-03）。クロスドメインのタグ検索 facet。外部カタログ（GBIF taxonKey 同期バッチ） |

---

## 8. 機能要件（05 へ追加 — OBS-TGT-01〜10）

> 正本は [`05-観測.md`](./05-観測.md) §4.11。本 ADR は契約・根拠。

| ID | 要件 |
|----|------|
| OBS-TGT-01 | 観測対象を **5 ドメイン**（biological/artifact/digital/environment/custom）から選べる（昆虫専用にしない） |
| OBS-TGT-02 | ナビゲータ・ピッカーは **文字のみ**（画像/サムネイルを出さない）。外部メタはテキスト参照のみ |
| OBS-TGT-03 | 各ドメインに **3 経路**（検索 / 質問で絞る / 分類・カテゴリツリー）。いずれも候補提示で確定はユーザー |
| OBS-TGT-04 | 生物は **亜種まで到達** するか **「亜種未区別（種まで）」を明示**する（空確定禁止） |
| OBS-TGT-05 | 確定した対象を `ObservationTarget`（domain/path/rank/canonical_ids/display_ja/tags）として保持（§2） |
| OBS-TGT-06 | `path` から **構造化タグ**を生成し観測に紐付ける（検索・整理 · append-only）（§5） |
| OBS-TGT-07 | 計測テンプレを **`target_scope`（domain + path 接頭辞）** で絞り込める。令・性別・段階は入力側（§6） |
| OBS-TGT-08 | 対象選択は [ADR-H-15](./ADR-H-15-観測コンテキスト.md) の WorkflowContext に **`ObservationTarget` 参照**として載り、05i/05a/05tl に伝播（プリフィルのみ） |
| OBS-TGT-09 | GBIF/Wikidata は **候補根拠（テキスト）** として `canonical_ids` に保存。確定対象は user_confirmed のみ（OBS-TAX-07） |
| OBS-TGT-10 | ロールアウト Phase 1（生物+器物+custom · 検索+ツリー）/ Phase 2（質問+デジタル）/ Phase 3（環境）（§7） |

---

## 9. スコープ外・非目標

- **画像での対象同定**（サムネイル一覧から選ぶ）— 本 ADR は **文字のみ**（画像由来の候補は #18 写真解析の別線・確定はユーザー）。
- 外部カタログの **UI 用画像取得**（GBIF/Wikidata 画像のフェッチ・表示）。
- 対象の **自動確定**（AI が対象を確定する）。候補提示まで（OBS-TAX-05）。
- 令・発育段階・性別を対象選択（05ctx）に持ち込むこと（**入力側 05i の属性**）。
- `environment` ドメインの完全実装（Phase 3）。

### 9.1 Phase 1 UX レビュー — モックスコープ（2026-06-09 ユーザー確定）

| 項目 | Phase 1 方針 |
|------|----------------|
| **`artifact` / `digital` 専用 PNG** | **不要（スコープ外・延期）**。ADR-H-16 本文 + 辞書 YAML（[`artifact_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/artifact_category_tree.yaml) · [`digital_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/digital_category_tree.yaml)）で Phase 1 UX レビューに十分 |
| **`ihl-05-obs-context-picker.png`** | **生物ドメイン中心の現行版で可**（ユーザー Go: 2026-06-09「原版でモック OK」）。器物・デジタルはドメインチップ表示のみで足りる |
| **OBS-TGT UI 草案** | 人間目視 OK（同上 · **設計ゲートの人間レビュー済み扱いメモ**。実装 Go ではない） |

> **補足**: 多ドメインの **データ契約・分類木・3 経路 UX** は本 ADR と辞書で設計済み。Phase 1 では生物ナビの walkthrough 検証を優先し、器物・ゲーム等の **別 mock 生成は Phase 2 以降**（ユーザーが明示的に依頼した場合のみ）。

---

## 10. 未決（人間 Go）

- 生物の **分類ツリー深さ**を界からフル表示するか、目（order）以下に省略するか（草案: 目以下を主表示・上位は折りたたみ）。
- 質問経路（Akinator）の **質問定義の正本**（辞書 YAML か Question Kernel か · TOT-OBS-03）。
- `artifact` / `digital` カテゴリ木の **初期値の網羅度**（草案: 最小シード · append-only 拡張）。
- 単型種の `monotypic` 判定の出所（草案: 辞書フラグ + 判定不能は未区別）。

---

## 11. 関連

- [ADR-H-15](./ADR-H-15-観測コンテキスト.md) — 観測コンテキスト（**伝播**。本 ADR は **対象選択**。WorkflowContext は本 ADR の `ObservationTarget` を参照）
- [ADR-H-14](./ADR-H-14-グローバル文脈バー.md) — グローバル文脈バー（対象チップの土台）
- [ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md) — 計測テンプレ（`target_scope` 追加）
- [`05-観測.md`](./05-観測.md) §4.5 OBS-TAX（候補/確定分離）· §4.10 OBS-CTX · §4.11 OBS-TGT · §⑪.2 stage enum
- 辞書: [`observation_target_domain.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/observation_target_domain.yaml) · [`biological_rank.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/biological_rank.yaml) · [`artifact_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/artifact_category_tree.yaml) · [`digital_category_tree.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/digital_category_tree.yaml)
- UI: [`../../02-設計/features/05-観測/ui/コンテキスト.md`](../../02-設計/features/05-観測/ui/コンテキスト.md)（v2 · 対象ナビゲータ）
- 遷移: [`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md) · [`05-観測-計測テンプレ-遷移設計-v1.md`](./05-観測-計測テンプレ-遷移設計-v1.md)

---

*草案 v1 · 非正本 / 人間レビュー待ち / 実装禁止ゲート有効 — 実装 Go 不可*
