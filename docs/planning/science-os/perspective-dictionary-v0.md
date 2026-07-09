# 観点辞書 初版（v0）— 飼育・観測の記録項目正規化

> **本書は docs 層の成果物であり実装ゲート外。canonical 層・AI査読の実装は人間ゲート。**
> 本書自体は「辞書の設計（草案）」であり、コード実装・API 追加・スキーマ確定を意味しない。
> ステータス: 草案 v0・人間レビュー待ち / 実装 Go 不可（他 `schemas/dictionaries/*.yaml` と同格）。
> 作成日: 2026-07-09。

---

## 0. この辞書の役割

科学OS構想（原典「### 概要.txt」）が言う **「観点ベクトル（キー＋値＋単位＋測定精度、欠損は明示フラグ）」** を、
IHL の既存資産に接続する形で正規化したものが本辞書である。

- **目的→観点→手段→結果** テンプレートのうち、「観点（予想）」「手段（条件）」に相当する飼育系の記録項目を、
  `id（kebab-case）＋値型＋単位＋欠損時の扱い＋canonical_id（Wikidata Q番号・未定は空）` の 5 要素で正規化する。
- 対象は **飼育系を中心**（温度・湿度・マット・容器・餌…）。個体の形態計測（体重・体長・角長等）は
  既存の [`schemas/dictionaries/measurement_name.yaml`](../../../schemas/dictionaries/measurement_name.yaml) が正本であり、
  本辞書では **重複定義しない**（既存資産の再利用を優先）。
- 本辞書のキーは、論文柱 `PaperSectionsV1`（`知の広場-仮採用-02-論文-v1.md` DET-KN-2）の
  `viewpoint_vector`（`paper-template-schema-v0.md` §3〜4 の観点ベクトル拡張）へ格納される「観点キー」の正規化候補である。
  `temperature_c` / `humidity_pct` / `feed` はすでに `PaperSectionsV1.conditions` の固定フィールドであり、
  本辞書の該当キーと 1:1 対応させる（§4 参照）。

---

## 1. 位置づけ（既存設計との整合）

| 既存資産 | 本辞書との関係 |
|---|---|
| [`schemas/dictionaries/observation_target_domain.yaml`](../../../schemas/dictionaries/observation_target_domain.yaml) | 本辞書の主対象は `domain: biological`（飼育文脈）。容器・環境系の一部キーは `domain: environment`（Phase 3 Placement · OBS-ENV-03）とも関連するが、ドメイン enum 自体には手を加えない。 |
| [`schemas/dictionaries/measurement_name.yaml`](../../../schemas/dictionaries/measurement_name.yaml) | 個体の形態計測（体重・体長・角長・産卵数等）の正本。**本辞書はこれと排他** — 重複キーを作らない。 |
| `知の広場-仮採用-02-論文-v1.md` DET-KN-2 `PaperSectionsV1.conditions` | `temperature_c` / `humidity_pct` / `feed` は固定フィールド。それ以外の本辞書キーは `viewpoint_vector`（配列要素）へ格納する際の正規化候補（§4 マッピング表）。 |
| `docs/planning/science-os/paper-template-schema-v0.md` §3〜4 | `conditions` は `additionalProperties: false`（`extra` フィールドなし）。観点ベクトルの拡張は新規トップレベル配列 `viewpoint_vector`（要素: `key`/`value`/`unit`/`missing`）で行う設計。本辞書のキーはこの `viewpoint_vector.key` の正規化候補。 |
| `docs/planning/claude-plans/DESIGN-science-os-integration.md` §1 | 「目的→観点→手段→結果テンプレート」は `PaperSectionsV1` と同型であり、新スキーマを作らず観点ベクトルを拡張する方針と整合（拡張の実装先は `viewpoint_vector`。`conditions.extra` ではない）。canonical_id 欄は同設計書 §1「Wikidata Q番号(正規ID)」の受け皿。 |
| `01-要件/05-観測.md` §41 | CSV v1 保存列は「温度・湿度・`light_level`」のみ（`DPT`/`VPD`/絶対湿度は保存しない・ADR-H-31/35）。本辞書の `temperature-c` / `humidity-pct` / `light-level` はこの保存方針と矛盾しない値型・単位で定義する。 |

---

## 2. 値型・欠損時の扱い・canonical_id の規約

### 2.1 値型（value_type）

`measurement_name.yaml` の規約（numeric / categorical / boolean / text）を継承し、飼育ログの時刻属性を扱うため
`date` / `datetime` を追加する。

| value_type | 意味 | UI 入力種別（参考） |
|---|---|---|
| numeric | 数値 | number_input |
| categorical | 候補選択＋自由追加 | select_or_add |
| boolean | 真偽 | toggle |
| text | 自由記述 | text_input |
| date | 日付（時刻なし） | date_input |
| datetime | 日時 | datetime_input |

### 2.2 欠損時の扱い（missing_policy）

| missing_policy | 意味 |
|---|---|
| `default_fill` | 未入力時は既定値で補完し、欠損フラグは立てない（例: `ventilation-level` 既定 `mid`） |
| `flag_required` | 必須観点。未入力は `PaperSectionsV1.gaps.missing_keys` に計上（Paper Match 由来の〔不足〕表示と連動） |
| `optional_null` | 任意観点。未入力は `null` を許容し欠損扱いしない |

### 2.3 canonical_id（Wikidata Q番号）欄

`DESIGN-science-os-integration.md` の「正規ID軸」方針に従い、将来 Wikidata と対応させる欄を持つ。
**v0 では全キー空欄とする** — 誤った Q 番号を記載するリスクを避けるため、Stage R 以降で
「存在確認 API」（科学OSコストほぼゼロ設計 §4「APIは存在確認だけ使う」）により Wikidata 側の対応概念を
確認してから埋める運用とする。空欄は「未確認」であり「対応なし」ではない。

---

## 3. 観点キー一覧（v0・28キー）

凡例: `id` は kebab-case。`欠損時の扱い` は §2.2 の missing_policy。`canonical_id` は §2.3 のとおり全て空欄（v0）。

### 3.1 環境（温湿度・光）

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `temperature-c` | 温度 | numeric | °C | flag_required | |
| `humidity-pct` | 湿度 | numeric | % | flag_required | |
| `light-level` | 光量 | numeric | lux（Template依存で相対値可） | optional_null | |
| `photoperiod-hours` | 明期時間 | numeric | h | optional_null | |
| `co2-ppm` | CO2濃度 | numeric | ppm | optional_null | |
| `ventilation-level` | 通気性 | categorical（low/mid/high） | — | default_fill | |

### 3.2 床材（マット）

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `substrate-type` | マット種類 | categorical（発酵マット/腐葉土/カブトマット等・自由追加可） | — | flag_required | |
| `substrate-depth-cm` | マット深さ | numeric | cm | optional_null | |
| `substrate-moisture-pct` | マット水分 | numeric | % | optional_null | |
| `substrate-fermentation-days` | マット発酵日数 | numeric | d | optional_null | |
| `substrate-replaced-at` | マット交換日 | date | — | optional_null | |

### 3.3 容器

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `container-type` | 容器種類 | categorical（衣装ケース/コバエシャッター/瓶/カップ等） | — | flag_required | |
| `container-volume-l` | 容器容量 | numeric | L | optional_null | |
| `container-material` | 容器材質 | categorical（プラスチック/ガラス/紙） | — | optional_null | |

### 3.4 給餌

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `feed-type` | 餌種類 | categorical（昆虫ゼリー/果物/産卵木等） | — | flag_required | |
| `feed-brand` | 餌銘柄 | text | — | optional_null | |
| `feed-amount-g` | 給餌量 | numeric | g | optional_null | |
| `feed-frequency-per-week` | 給餌頻度 | numeric | 回/週 | optional_null | |
| `feed-last-at` | 最終給餌日時 | datetime | — | optional_null | |

### 3.5 飼育管理

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `density-individuals-per-container` | 飼育密度 | numeric | 匹/容器 | optional_null | |
| `generation-no` | 累代数 | numeric | 世代 | optional_null | |
| `isolation-flag` | 個別飼育フラグ | boolean | — | default_fill | |
| `handling-frequency-per-week` | ハンドリング頻度 | numeric | 回/週 | optional_null | |

### 3.6 繁殖・イベント文脈

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `oviposition-substrate-depth-cm` | 産卵床深さ | numeric | cm | optional_null | |
| `incubation-temperature-c` | 孵化（卵）温度 | numeric | °C | optional_null | |
| `molt-count` | 脱皮回数 | numeric | 回 | optional_null | |
| `eclosion-date` | 羽化日 | date | — | optional_null | |
| `mortality-flag` | 死亡フラグ | boolean | — | flag_required | |

### 3.7 測定メタ（機器・精度）

| id | 和名 | 値型 | 単位 | 欠損時の扱い | canonical_id |
|---|---|---|---|---|---|
| `measurement-device-id` | 測定器ID | text | — | optional_null | |
| `measurement-precision` | 測定精度 | text（例: ±0.1g） | — | optional_null | |

---

## 4. `PaperSectionsV1` へのマッピング（DET-KN-2 整合・`viewpoint_vector` 方式）

`paper-template-schema-v0.md` §4 の JSON Schema 草案では、`conditions` は次の固定形（`additionalProperties: false`、
`extra` フィールドなし）。

```yaml
conditions:
  temperature_c: number | null
  humidity_pct: number | null
  feed: string | null
  filled: boolean
```

観点ベクトルの拡張は `conditions` ではなく、新規トップレベル配列 `viewpoint_vector`（要素:
`key` / `value` / `unit` / `missing`）で行う。対応:

| PaperSectionsV1 固定フィールド | 本辞書 id | 変換 |
|---|---|---|
| `temperature_c` | `temperature-c` | kebab → snake（ハイフンをアンダースコアに置換） |
| `humidity_pct` | `humidity-pct` | 同上 |
| `feed` | `feed-type` | `feed` は単純文字列。`feed-brand` / `feed-amount-g` 等の詳細キーは `viewpoint_vector` へ |

上記 3 キー以外（`substrate-*` / `container-*` / `feed-brand` 以下 / `density-*` / 繁殖・測定メタ）は、
すべて `viewpoint_vector` の要素として `{ "key": id, "value": ..., "unit": ..., "missing": ... }` の形で格納する候補とする。
**実装時のキー変換規約（kebab か snake か）は本 v0 の対象外・別途 ADR 化を要する**（フォーク文化の観点から
自由入力キーとの整合も含めて人間レビュー時に確定）。

> **未解決事項**: `viewpoint_vector` の要素スキーマ（`paper-template-schema-v0.md` §4）は現状 `key`/`value`/`unit`/`missing`
> の4フィールドのみで、本辞書の `canonical_id`（§2.3）を格納する場所がない。canonical_id を残すなら
> `viewpoint_vector` 要素スキーマへの `canonical_id` フィールド追加が別途必要（本 v0 の対象外・要 ADR）。

---

## 5. 未決事項（v0 スコープ外・実装前に確定要）

- `substrate-type` / `feed-type` / `container-type` の候補語彙（既定リスト）は本 v0 では未確定。カテゴリ辞書として
  独立 YAML 化するか `label_name.yaml`（弱 enum）に相乗りするかは Stage R で判断。
- canonical_id（Wikidata Q番号）の実値は未確認・空欄（§2.3）。存在確認 API 呼び出しのバッチ設計は
  `DESIGN-science-os-integration.md` §2 `truth/canonical/mapping_event` 実装時に行う（本書は対象外）。
- AI査読パイプライン段階1「構造チェック」（`DESIGN-science-os-integration.md` §1 決定論5段階）が本辞書の
  `flag_required` キー未入力を検出する主体になる想定だが、パイプライン実装自体は人間ゲート後。
- 本辞書のキーと `schemas/dictionaries/*.yaml` 群との命名衝突チェック（例: 将来 `feed_type` が
  `artifact_category_tree.yaml` 側の器物カテゴリと衝突しないか）は未実施。

---

## 出典（原典・必読ファイル）

- `D:\Programs\追加アイディア\### 概要.txt`
- `D:\Programs\追加アイディア\# 🟦 科学OS：コストほぼゼロ設計.txt`
- `D:\Programs\it-hercules-laboratory-clean\schemas\dictionaries\observation_target_domain.yaml`
- `D:\Programs\it-hercules-laboratory-clean\schemas\dictionaries\measurement_name.yaml`
- `D:\Programs\it-hercules-laboratory-clean\schemas\dictionaries\qc_flag.yaml`
- `D:\Programs\it-hercules-laboratory-clean\schemas\dictionaries\README.md`
- `D:\Programs\it-hercules-laboratory-clean\docs\planning\w2-checkpoint\知の広場-仮採用-02-論文-v1.md`
- `D:\Programs\it-hercules-laboratory-clean\docs\planning\claude-plans\DESIGN-science-os-integration.md`
- `D:\Programs\it-hercules-laboratory-clean\01-要件\05-観測.md`（§41 CSV v1 保存列 · ADR-H-31/35 参照箇所）

---

*草案 v0・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
