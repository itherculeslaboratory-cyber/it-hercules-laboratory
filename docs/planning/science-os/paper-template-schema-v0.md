# 設計提案: 論文テンプレート JSON Schema 初版(観点ベクトル拡張) v0

> **本書は docs 層の成果物であり実装ゲート外。** canonical 層(`truth/canonical/`)・AI 査読パイプラインの実装は人間ゲート後。本書はスキーマの**提案**であり、`schemas/` に新規スキーマファイルを追加するものではない(将来実装時の入力ドラフト)。

起案: Fable 5(2026-07-09)。位置づけ: `docs/planning/claude-plans/DESIGN-science-os-integration.md` §1・§7 の Stage R5 文書成果物のうち「テンプレート JSON Schema」に相当する。同設計書の**必読前提**であり、内容はそれと整合させてある。

知の広場(観点辞書・査読パイプライン等の科学OS構想全体)は **PROVISIONAL(仮採用・ゲート中)** であり、本書の内容も「決定済み」ではない。人間レビューと知の広場ゲート解除まで拘束力を持たない設計ドラフトである。

---

## 1. 目的

`DESIGN-science-os-integration.md` の対応表(§1)にある一行:

> 目的→観点→手段→結果テンプレート ⇔ **論文6節スキーマ PaperSectionsV1 とほぼ同型**(目的/仮説/条件/検証/フェーズ/ギャップ) → 新スキーマを作らず PaperSectionsV1 に観点ベクトル(観点辞書キー+値+単位+欠損フラグ)を拡張

これを JSON Schema の形で具体化する。既存 PaperSectionsV1(6節)は**無変更**、新規フィールド `viewpoint_vector` を追加するだけの**最小拡張**とする。

## 2. 既存 PaperSectionsV1 の実定義(出典に合わせる)

`schemas/` および `libs/` 配下には PaperSectionsV1 の形式スキーマファイルは存在しない(調査済み・本書末尾「出典」参照)。実定義は UI 実装(`apps/ui-parts-lab-w2/src/w2/paper-mock.ts`)の TypeScript 型が現時点で最も具体的な実物であり、ADR-H-09(研究フロー低コスト設計)の6節構成と一致する。本書のフィールド名はこの実物にすべて合わせた。

6節と実フィールド(既存・無変更):

| 節キー | 意味 | 実フィールド | 型 |
|---|---|---|---|
| `purpose` | 目的 | `text`, `filled` | string, boolean |
| `hypothesis` | 仮説 | `text`, `filled` | string, boolean |
| `conditions` | 条件(温度/湿度/餌) | `temperature_c`, `humidity_pct`, `feed`, `filled` | string×3, boolean |
| `verification` | 検証したいこと | `text`, `filled` | string, boolean |
| `current_phase` | 現在のフェーズ | `step`(enum: observe/hypothesize/try/record/cite), `label_ja`, `filled` | string enum, string, boolean |
| `gaps` | 必要なデータ / ギャップ | `missing_keys`(string[]), `tags`(string[]), `note`, `filled` | array, array, string, boolean |

`conditions` の3値(温度・湿度・餌)は現状すべて自由記入の `string` 型(例: `"22–30"` のような範囲表記や単位混在を許すため)。この設計は変更しない。

## 3. 拡張方針: `viewpoint_vector`(観点ベクトル)

### 3.1 なぜ既存6節を触らないか

- 後方互換必須条件のため。既存 Truth データ・UI モックは `viewpoint_vector` を持たないが、新スキーマでそのまま valid でなければならない。
- コア思想①(ランニングコスト最小・決定論優先): 既存6節は自由記入テキストで柔軟性を確保済み。数値化・単位付きの構造化が要る観測値だけを `viewpoint_vector` に切り出し、他は変えない。

### 3.2 なぜ `gaps.missing_keys` と別に持つか

`gaps.missing_keys` は既存のギャップ節(自由記入寄りの文字列配列)であり、これは残す。`viewpoint_vector` の各要素が持つ `missing` フラグは**値そのものに紐づく欠損表現**で、粒度が異なる(1観点=1値+1単位+1欠損)。将来的に `gaps.missing_keys` は `viewpoint_vector` 内で `missing: true` のキー群から**派生生成**できるが、本v0では両者を独立フィールドとして扱い、自動同期ロジックは実装ゲート後の課題とする。

### 3.3 観点辞書キー(`key`)について

観点辞書そのもの(観点キーの正本一覧・命名規約)は `DESIGN-science-os-integration.md` §7 が挙げる別の文書成果物(観点辞書初版)であり、**本書の対象外・未整備**。本書では `key` を自由記入 string とし、辞書の正本が整備され次第、将来 `enum` や参照制約に強化することを想定する(v0時点では拘束しない = PROVISIONAL)。

## 4. JSON Schema(草案)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://it-hercules.example/schemas/paper-sections-v1-viewpoint-draft-v0.json",
  "title": "PaperSectionsV1 + 観点ベクトル拡張(草案 v0・PROVISIONAL)",
  "description": "既存 PaperSectionsV1(6節)は無変更。viewpoint_vector は任意(optional)フィールドとして追加し、既存データの後方互換を保つ。",
  "type": "object",
  "required": [
    "purpose",
    "hypothesis",
    "conditions",
    "verification",
    "current_phase",
    "gaps"
  ],
  "properties": {
    "purpose": {
      "type": "object",
      "required": ["text", "filled"],
      "properties": {
        "text": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "hypothesis": {
      "type": "object",
      "required": ["text", "filled"],
      "properties": {
        "text": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "conditions": {
      "type": "object",
      "required": ["temperature_c", "humidity_pct", "feed", "filled"],
      "properties": {
        "temperature_c": { "type": "string" },
        "humidity_pct": { "type": "string" },
        "feed": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "verification": {
      "type": "object",
      "required": ["text", "filled"],
      "properties": {
        "text": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "current_phase": {
      "type": "object",
      "required": ["step", "label_ja", "filled"],
      "properties": {
        "step": {
          "type": "string",
          "enum": ["observe", "hypothesize", "try", "record", "cite"]
        },
        "label_ja": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "gaps": {
      "type": "object",
      "required": ["missing_keys", "tags", "note", "filled"],
      "properties": {
        "missing_keys": {
          "type": "array",
          "items": { "type": "string" }
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "note": { "type": "string" },
        "filled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "viewpoint_vector": {
      "type": "array",
      "description": "観点ベクトル(PROVISIONAL)。観点辞書キー+値+単位+欠損フラグの配列。省略可(既存データとの後方互換のため required に含めない)。",
      "items": {
        "type": "object",
        "required": ["key", "value", "unit", "missing"],
        "properties": {
          "key": {
            "type": "string",
            "description": "観点辞書キー(例: horn_length_mm, temperature_night_c)。観点辞書の正本は別文書(未整備・PROVISIONAL)。v0では自由記入string。"
          },
          "value": {
            "type": ["number", "string", "null"],
            "description": "観点の値。missing=true の場合は null を許容。数値は number、区分値やコード値は string を許容。"
          },
          "unit": {
            "type": ["string", "null"],
            "description": "単位(例: mm, °C, %)。無次元・該当なしは null。"
          },
          "missing": {
            "type": "boolean",
            "description": "値が未取得・欠損であることを明示するフラグ。true の場合 value は null を推奨。"
          }
        },
        "additionalProperties": false
      },
      "default": []
    }
  },
  "additionalProperties": true
}
```

## 5. 後方互換の確認

### 5.1 既存データ(`viewpoint_vector` なし)→ valid であること

既存モック `MOCK_PAPER_IN_PROGRESS`(`apps/ui-parts-lab-w2/src/w2/paper-mock.ts`)相当のデータ:

```json
{
  "purpose": { "text": "温度がクワガタの角長に与える影響を明らかにする。", "filled": true },
  "hypothesis": { "text": "温度が高いほど、オスの角長は長くなる。", "filled": true },
  "conditions": { "temperature_c": "22–30", "humidity_pct": "60", "feed": "昆虫ゼリー", "filled": true },
  "verification": { "text": "異なる温度条件下で飼育した個体の角長を比較し、温度と角長の相関を検証する。", "filled": true },
  "current_phase": { "step": "try", "label_ja": "試す", "filled": true },
  "gaps": { "missing_keys": ["temperature_night", "humidity_night"], "tags": ["不足"], "note": "夜間温度・湿度の連続ログが不足しています。", "filled": false }
}
```

`viewpoint_vector` を持たないが `required` に含まれないため **valid**。これが後方互換の必須条件を満たす根拠。

### 5.2 新データ(`viewpoint_vector` あり)→ valid であること

上記に加えて:

```json
{
  "viewpoint_vector": [
    { "key": "horn_length_mm", "value": 62, "unit": "mm", "missing": false },
    { "key": "temperature_night_c", "value": null, "unit": "°C", "missing": true }
  ]
}
```

を追加しても各要素が `key`/`value`/`unit`/`missing` を満たすため **valid**。

## 6. 制約・今後の課題(実装ゲート後に検討)

- `key` の正本管理(観点辞書の enum 化・命名規約)は別文書(観点辞書初版)の整備後に本スキーマへ反映。
- `viewpoint_vector` と `gaps.missing_keys` の自動同期(欠損キーの二重管理を避ける仕組み)は canonical 層実装時に設計。
- `unit` の正規化(単位変換・SI統一)は決定論コード側(AI査読パイプライン段階1〜5相当)の範囲であり、本スキーマは値の**保持形式**のみを定める。
- 実データでの妥当性検証(既存 Truth 層データへの適用テスト)は実装ゲート後。

## 7. 実装ゲート

本書は `docs/planning/` 配下の設計ドラフトであり、`schemas/` への正式スキーマファイル追加・canonical 層・AI 査読パイプラインへの組み込みは `DESIGN-science-os-integration.md` §7 の人間ゲートに従う。

---

## 出典(読んだ原典)

- `D:\Programs\it-hercules-laboratory-clean\docs\planning\claude-plans\DESIGN-science-os-integration.md`
- `D:\Programs\it-hercules-laboratory-clean\docs\planning\claude-plans\PLAN-ultracode-integration.md`
- `D:\Programs\it-hercules-laboratory-clean\apps\ui-parts-lab-w2\src\w2\paper-mock.ts`(PaperSectionsV1 実定義)
- `D:\Programs\it-hercules-laboratory-clean\02-設計\_横断\adr\ADR-H-09-研究フロー-低コスト設計.md`
- `D:\Programs\it-hercules-laboratory-clean\01-要件\09-論文.md`
- `D:\Programs\it-hercules-laboratory-clean\libs\ihl\observation\detail.py`(既存観測データの `unit` フィールド命名の参考)
- 調査済み・該当なし: `schemas/` 配下に PaperSectionsV1 の JSON Schema ファイルは存在しない(本書作成時点)
