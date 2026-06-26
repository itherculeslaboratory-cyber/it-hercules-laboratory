# schema-pack v1 — IHL Phase 1+2 正本索引

> **ステータス**: **AI 確定草案 v1**（2026-06-09）· DELEGATED-DESIGN-GO 対象  
> **機械検査**: `node scripts/ihl-schema-inventory.mjs`  
> **前提**: [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) · [`schema-yaml-draft-v1.md`](./schema-yaml-draft-v1.md) · ADR-Phase2 C-USB · ADR-H-06

---

## 1. サマリー

| 区分 | 件数 |
|------|------|
| `*.schema.yaml` | **45** |
| `dictionaries/*.yaml` | **24** |
| 人間ゲート列（`x_ihl_human_gate`） | **0** フィールド（全 13 件は `x_ihl_human_confirmed` へ移行済） |

全 schema は **YAML（JSON Schema draft 2020-12 互換）**・`enum_ref` は `02-設計/_横断/schema/dictionaries/` を正本とする。

---

## 2. ファイル一覧

### 2.1 common/

| ファイル | layer | 用途 |
|----------|-------|------|
| `common/provenance.schema.yaml` | fragment | run_id · schema_version · input_hash · created_at |
| `common/core_subset.schema.yaml` | fragment | IHL CoreEntityBase サブセット（ADR-Phase2 §5） |

### 2.2 manifest/

| ファイル | layer | 用途 |
|----------|-------|------|
| `manifest/input_manifest.schema.yaml` | manifest | component IN |
| `manifest/output_manifest.schema.yaml` | manifest | component OUT 行 |
| `manifest/run_info.schema.yaml` | truth | 1 run 監査 |
| `manifest/errors.schema.yaml` | truth | errors.jsonl 行 |
| `manifest/thumbnail_manifest.schema.yaml` | truth | サムネイル成果 |
| `manifest/embedding_manifest.schema.yaml` | truth | embedding 成果 |
| `manifest/embedding_locator.schema.yaml` | snapshot | 類似検索 locator |
| `manifest/pointer.schema.yaml` | manifest | latest pointer（ADR-D01 方式 B） |

### 2.3 capture/

| ファイル | layer | 用途 |
|----------|-------|------|
| `capture/capture.schema.yaml` | truth | 観測キャプチャ |
| `capture/individual.schema.yaml` | truth | 個体 |
| `capture/measurement.schema.yaml` | truth | 計測縦持ち |
| `capture/measurement_template.schema.yaml` | config | 計測テンプレ（ADR-H-13） |
| `capture/searchable_capture_set.schema.yaml` | snapshot | 検索投影（1 行 = 1 capture） |

### 2.4 lineage/

| ファイル | layer | 用途 |
|----------|-------|------|
| `lineage/cross.schema.yaml` | truth | Cross 初期事実（status なし） |
| `lineage/cross_parent.schema.yaml` | truth | 多親参加 |
| `lineage/offspring_assignment.schema.yaml` | truth | 子割当 |
| `lineage/cross_status_event.schema.yaml` | truth | Cross 状態変化 |
| `lineage/life_event.schema.yaml` | truth | 死亡・羽化等 |

### 2.5 events/

| ファイル | layer | 用途 |
|----------|-------|------|
| `events/tag_event.schema.yaml` | truth | タグ append-only |
| `events/usage_event.schema.yaml` | truth | 利用ログ |
| `events/preference_event.schema.yaml` | truth | マチアプ pairwise（**正本 = events/**） |
| `events/annotation_event.schema.yaml` | truth | AI 注釈 |
| `events/label_event.schema.yaml` | truth | 分類ラベル |
| `events/actor_status_event.schema.yaml` | truth | アクター状態 |
| `events/pii_access_event.schema.yaml` | truth | PII 監査（12 設定） |

### 2.6 economy/

| ファイル | layer | 用途 |
|----------|-------|------|
| `economy/contribution_event.schema.yaml` | truth | 貢献度 |
| `economy/coin_event.schema.yaml` | truth | Platinum 功績章 |
| `economy/pt_event.schema.yaml` | truth | PT |
| `economy/karma_event.schema.yaml` | truth | カルマ二層 |
| `economy/supporter_event.schema.yaml` | truth | 金銭支援 |
| `economy/market_economy_event.schema.yaml` | truth | マーケット経済 |

### 2.7 snapshots/

| ファイル | layer | 用途 |
|----------|-------|------|
| `snapshots/individual_master.schema.yaml` | snapshot | 個体マスタ |
| `snapshots/tag_aggregate.schema.yaml` | snapshot | タグ集計 |
| `snapshots/cross_summary.schema.yaml` | snapshot | 世代集計ヘッダ |
| `snapshots/cross_growth_summary.schema.yaml` | snapshot | 成長極値 |
| `snapshots/cross_death_summary.schema.yaml` | snapshot | 死亡・不全率 |
| `snapshots/pt_summary.schema.yaml` | snapshot | PT 残高 |
| `snapshots/karma_summary.schema.yaml` | snapshot | カルマ表示 |
| `snapshots/contribution_summary.schema.yaml` | snapshot | 貢献度 |
| `snapshots/coin_summary.schema.yaml` | snapshot | コイン累計 |
| `snapshots/research_score_summary.schema.yaml` | snapshot | Research Score |

### 2.8 governance/

| ファイル | layer | 用途 |
|----------|-------|------|
| `governance/vote_event.schema.yaml` | truth | 投票（20） |
| `governance/dispute_event.schema.yaml` | truth | 争い（11） |

---

## 3. C-USB component ↔ in_schema / out_schema 対応

| component（概念） | in_schema_ref | out_schema_ref |
|-------------------|---------------|----------------|
| ingest | `manifest/input_manifest.schema.yaml` | `capture/capture.schema.yaml` + `capture/individual.schema.yaml` |
| thumbnail_builder | `manifest/input_manifest.schema.yaml` | `manifest/thumbnail_manifest.schema.yaml` |
| embedding_builder_dinov2 | `manifest/input_manifest.schema.yaml` | `manifest/embedding_manifest.schema.yaml` |
| manifest_builder | （Parquet パス契約） | `capture/searchable_capture_set.schema.yaml` · `manifest/embedding_locator.schema.yaml` |
| tag_aggregator | `events/tag_event.schema.yaml` | `snapshots/tag_aggregate.schema.yaml` |
| preference_event_writer | — | `events/preference_event.schema.yaml` |
| usage_event_writer | — | `events/usage_event.schema.yaml` |
| measurement_bridge | `capture/measurement_template.schema.yaml` | `capture/measurement.schema.yaml` |
| economy_ledger（概念） | — | `economy/*_event.schema.yaml` |
| karma_monthly_batch（概念） | `economy/karma_event.schema.yaml` | `snapshots/karma_summary.schema.yaml` |
| cross_summary_builder（概念） | lineage + measurement | `snapshots/cross_*_summary.schema.yaml` |

> manifest.yaml は **schema 本体を複製せず参照のみ**（ADR-Phase2 §6）。複数 OUT は `out_artifacts` + 個別 schema_ref で宣言。

---

## 4. 将来 `libs/schema_validator.py` マップ（設計のみ）

```text
02-設計/_横断/schema/**/*.schema.yaml  →  jsonschema.Draft202012Validator
dictionaries/*.yaml       →  enum_ref 解決 · values[].key 検証
component manifest        →  in_schema_ref / out_schema_ref 存在チェック
```

実装は IHL repo 作成後 · 設計ゲート Implementation Sign-off 後。

---

## 5. Human gates（`x_ihl_human_gate: true`）

schema 完成をブロックしない。**全フィールド確定済** — §6 で **HUMAN-CONFIRMED** 済みの列は `x_ihl_human_confirmed` に移行済み（`x_ihl_human_gate` 残存 **0**）。

### 5.1 確定済み（`x_ihl_human_confirmed: 2026-06-07`）

| schema | フィールド | 論点 | 解決 |
|--------|-----------|------|------|
| `usage_event` | `user_id_hash` | 生 user_id 非保存 | **(A)** §6 #1 |
| `preference_event` | `user_id_hash` | 生 user_id 非保存 | **(A)** §6 #1 |
| `preference_event` | `dimension_matrix` | overlay 永続 | **(A)** §6 #2 · `x_ihl_persist: false` |
| `pii_access_event` | `legal_basis`, `retention_until` | PII 最小化 · 監査行 | **PII 最小化** §6 #3 · §7 |
| `supporter_event` | `tier`, `amount_jpy`, `gmo_transaction_ref` | GMO live | **(A)** §6 #4 |
| `cross_summary` | `mortality_to_alive_rate`, `complete_rate` | 率の分子分母 | **(A)** §6 #5 |
| `governance/vote_event` | `voter_id` | `@handle` 平文保存（ハッシュ不採用） | **(A)** §6 #8 |
| `economy/market_economy_event` | `fib_tier` | 未納継続月 n（1-based） | **(A)** §6 #9 |
| `governance/dispute_event` | `market_dsp_ref` | `{anchor_type}:{anchor_id}` 形式 | **(A)** §6 #10 |

---

## 6. 人間判断が要る項目（推奨デフォルト付き）

| # | 論点 | 推奨 | 人間確定 |
|---|------|------|----------|
| 1 | **利用ログの user 識別** — Truth には `user_id_hash`（SHA-256 + salt）のみ。生 ID は保存しない。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 2 | **preference_event.dimension_matrix** — ValueCheck overlay は **セッションのみ**。Truth には `choice` + capture ペアのみ永続。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 3 | **PII 最小化方針** — Truth/R2 に平文 PII を持たない。取引 PII は取引時のみ（暗号化）または GMO/配送外部委譲。監査はメタデータのみ。削除要求は即時匿名化。 | **PII 持たない** | **HUMAN-CONFIRMED 2026-06-07** · 詳細 §7 |
| 4 | **GMO / supporter_event 金額列** — schema に `amount_jpy` は置くが **本番値の書込は live 人間ゲート後**。テストは stub tier のみ。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 5 | **完品率・死亡率の境界** — `cross_summary` に率列を置き、分子分母定義は Template + `cross_death_summary.md` §6 を正本とし CI warning のみ。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 6 | **preference_event 配置** — 正本は **`events/preference_event.schema.yaml`**（`preference_event/` トップフォルダは作らない）。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 7 | **raw 画像保持** — R2 append-only **無期限**（削除 API 禁止は憲法）。アーカイブ階層は別 ADR。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 8 | **vote_event.voter_id** — `voter_id_hash` は不採用。`@handle` を **平文** で Truth に保存する。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 9 | **market_economy_event.fib_tier** — `event_kind=fee_unpaid_set` のとき **未納継続月 n（1-based）** を必須格納。lottery 系イベントでは任意。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |
| 10 | **dispute_event.market_dsp_ref** — マーケット争い時のみ `{anchor_type}:{anchor_id}`（例 `trade_private:trade_xxx`）。非マーケット争いでは省略。**U-MKT-DSP 設計 Go は機能 11 別ゲート**。 | **(A)** | **HUMAN-CONFIRMED 2026-06-07** |

---

## 7. PII minimization policy（HUMAN-CONFIRMED 2026-06-07）

> **正本**: 人間ゲート #3 の確定内容。`pii_access_event` · `12-設定` trade_pii · 06 マーケット取引 PII の共通方針。

### 7.1 Truth / R2 に載せないもの

| 区分 | 禁止内容 |
|------|----------|
| 識別子 | 生 `user_id`（**`user_id_hash` のみ**可）。**例外**: `vote_event.voter_id` は `@handle` 平文（§6 #8） |
| 平文 PII | 氏名・住所・電話・銀行口座番号等の **本文** |
| 監査行 | `pii_access_event` 行に **PII 本文・値** を含めない |

### 7.2 取引 PII（06 · 12 設定 `trade_pii`）

| 原則 | 内容 |
|------|------|
| 保持場所 | IHL Truth/R2 には **平文を永続しない** |
| 取引時 | 必要なら **取引成立時のみ** 暗号化して渡す、または **GMO / 配送キャリア** へ委譲 |
| 取引後 | 取引完了後 **purge**（IHL 側に残さない） |
| 設定 UI | `trade_pii` は **セッション/外部 KV** または **短命暗号化バケット**（実装詳細は Implementation Sign-off 後） |

### 7.3 `pii_access_event`（監査のみ）

| フィールド | 意味 |
|-----------|------|
| `actor_id` | 誰が（ハッシュ ID） |
| `access_kind` | 何をしたか（`read` / `export` / `delete_request` / `anonymize`） |
| `target_ref` | 対象の **不透明参照**（`trade_id` · `user_id_hash` 等）— **値は含めない** |
| `legal_basis` | 目的コード（例: `user_self` · `trade_counterparty` · `delete_request`）— **本文なし** |
| `retention_until` | **監査ログ行**のローテ期限（例: 30 日）。PII 本文の保持期限 **ではない**。PII 非保持時は省略可 |

### 7.4 削除・匿名化

- **削除要求**: **即時匿名化**（PII blob の 90 日猶予などは **採用しない**）。
- `access_kind: delete_request` → 続けて `anonymize` イベントを append する設計とする。

### 7.5 関連 schema / 設計

| 参照 | 用途 |
|------|------|
| `events/pii_access_event.schema.yaml` | 監査 Truth 行 |
| `events/preference_event.schema.yaml` | `dimension_matrix` は `x_ihl_persist: false` |
| [`12-設定-詳細設計-v1.md`](../../02-設計/features/12-設定/12-設定-詳細設計-v1.md) §1 | trade_pii API · アクセス制御 |

---

*schema-pack v1 · §6 #1–10 HUMAN-CONFIRMED 2026-06-07 · `x_ihl_human_gate` 0 · 実装 Go 不可（design-before-implementation-gate）*
