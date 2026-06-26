# ADR-H-20 — データクラスと書込方針 v1

> **ステータス**: **HUMAN-CONFIRMED 2026-06-10**（ユーザー `ADR-H-20 Go`）  
> **決定日**: 2026-06-10  
> **上位法**: [`/civilization/ProjectRules.md`](../../../../civilization/ProjectRules.md) §6.1 · [`/civilization/R2Engine.md`](../../../../civilization/R2Engine.md)  
> **関連 ADR**: [`ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) · [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md)  
> **legacy 契約参照（salvage-adapt）**: [`design/adr/ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md) — Placement/Binding/Occupancy の **4 概念**は抽出するが、IHL 永続化パスは本 ADR の `truth/` 規約に従う（`world/env/` は civ-os 正本）

---

## 1. 文脈 — ProjectRules R2 と観測物質の緊張

`R2Engine.md` は **INSERT ONLY · UPDATE/DELETE 禁止** を文明同一性の条件として定める。  
一方、環境テレメトリ（SwitchBot 等）は **API が現在値のみ返す** · **同一 5 分バケット内で値が微修正される** · **collector 再実行で同一論理読み取りが重複** といった性質を持つ。

**本 ADR の決定**: R2 の INSERT ONLY 原則は **Tier A（統治・会計・意思決定）に厳格適用** する。観測物質（環境テレメトリ等）は **Tier B** として **API 由来の冪等 UPSERT** を許可する。これは ProjectRules の **scoped interpretation（観測物質に限定した解釈）** であり、文明史ハッシュチェーンの改ざんや統治イベントの上書きを意味しない。

---

## 2. 決定 — 3 層データクラス

### 2.1 Tier A — INSERT ONLY（厳格）

| 属性 | 内容 |
|------|------|
| **対象** | 統治イベント · 投票 · 紛争 · karma · マーケット成立 · 取引 · 監査ログ · Placement/Binding **ライフサイクルイベント** · 観測 commit（`capture/measurement`） |
| **書込** | **常に新規 event INSERT**。修正・取消は **相殺 event**（例: `vote_revoked` · `dispute_resolved`） |
| **UPDATE/DELETE** | **禁止**（`R2Engine.md` 準拠） |
| **正本性** | R2 イベント列 · `truth/governance/` · `truth/votes/` 等 |
| **人間介入** | 手動訂正は **新 event** として記録（`source=manual_correction`） |

**例（非網羅）**:

```text
governance_decision · vote_cast · dispute_opened · karma_adjustment
market_listing_created · trade_settled · placement_created · device_binding_started
capture_measurement_committed
```

### 2.2 Tier B — API 冪等書込（観測物質 · 環境テレメトリ）

| 属性 | 内容 |
|------|------|
| **対象** | 環境テレメトリ · SwitchBot poll 結果 · collector ingest 正規化行 |
| **自然キー** | `(device_id, bucket_start_unix)` — `bucket_start_unix = floor(unix_ts(captured_at), 300)`（5 分バケット） |
| **書込** | **UPSERT / REPLACE** — 同一自然キーに対し **最新の API 取得結果で上書き可** |
| **許可 `source`** | `switchbot_api` · `local_collector`（いずれも **機械取得のみ**） |
| **禁止** | `manual_entry` による Tier B 行の上書き · 統治 Tier A 行の UPSERT |
| **正本性** | `truth/env/telemetry/v1/{user_id_hash}/{device_id}/series.parquet` — **デバイス 1 台 = 1 series オブジェクト**（§2.4） |

**UPSERT が許される条件（すべて満たすこと）**:

1. `source ∈ { switchbot_api, local_collector }`
2. 人間がその行を直接編集していない（`value_origin ≠ manual_entry`）
3. 自然キー `(device_id, bucket_start_unix)` が一致
4. `value_revision` をインクリメントして **取得履歴の追跡可能性** を維持

**Tier B 行が持つ provenance（必須）**:

| フィールド | 意味 |
|------------|------|
| `source` | `switchbot_api` \| `local_collector` |
| `collector_run_id` | 当該 poll/ingest 実行の ULID |
| `fetched_at` | SwitchBot API 応答受信時刻（ISO8601） |
| `value_revision` | 同一バケット内の上書き回数（初回 `1`） |
| `captured_at` | 測定時刻（API から得た値 or バケット代表時刻） |
| `ingested_at` | IHL 永続化時刻 |

### 2.3 Tier C — 最新ポインタ（投影）

| 属性 | 内容 |
|------|------|
| **対象** | 「現在の device 状態」「最新 binding」「UI 用 denormalized 索引」 |
| **書込** | **REPLACE 可** — Tier A/B の **派生投影** に限る |
| **正本性** | **Tier A/B が上位**。Tier C 単体は証跡にならない |
| **例** | `projection/devices/{id}/last_reading.json` · `projection/placements/{id}/current_binding.json` |

---

## 2.4 Tier B 永続化 — 1 device = 1 series object（マージ可）

### 方針

| 原則 | 内容 |
|------|------|
| **1 device = 1 series** | 登録デバイスごとに **単一の時系列オブジェクト** を持つ。個体（Specimen）・観測対象ごとに env ファイルを増やさない |
| **マージ** | collector / poller の各取得は **同一 Parquet への冪等マージ**（自然キー `(bucket_start_unix)` 単位 UPSERT） |
| **IHL パス正本** | `truth/env/` — civ-os legacy の `world/env/` は **契約参照のみ**（[`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md)） |

### パステンプレート

```text
truth/env/telemetry/v1/{user_id_hash}/{device_id}/series.parquet   # Tier B 時系列本体（Parquet）
truth/env/telemetry/v1/{user_id_hash}/{device_id}/meta.json        # デバイス単位メタ（最終取得時刻・schema_version 等）
truth/env/telemetry/v1/{user_id_hash}/{device_id}/provenance.jsonl # 任意 · collector run 単位の append-only 監査
```

| ファイル | Tier | 書込 | 備考 |
|----------|------|------|------|
| `series.parquet` | B | **冪等マージ / UPSERT** | 列: `bucket_start_unix`, `captured_at`, 測定値, `value_revision`, provenance 列 |
| `meta.json` | C 派生 | REPLACE 可 | `last_fetched_at` · `row_count` · `schema_version` |
| `provenance.jsonl` | B 補助 | **append-only** | 各 `collector_run_id` 1 行 — 統治 Tier A ではない |

**自然キー**（マージ単位）: `(device_id, bucket_start_unix)` — [`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) と同一。

### Tier A イベント（INSERT ONLY · 変更なし）

Placement / Binding / Occupancy のライフサイクルは **従来どおり event INSERT**（Tier A）。legacy ADR の 4 概念・イベント種別（`placement.created` · `device.binding.started` · `occupancy.started` 等）を **salvage-adapt** する。

```text
truth/placement/v1/{user_id_hash}/events/{event_id}.json
truth/placement/v1/{user_id_hash}/bindings/{event_id}.json
truth/placement/v1/{user_id_hash}/occupancy/{event_id}.json
```

（キー細部は実装設計 [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) §9 · legacy [`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md) を突合）

### Tier B UPSERT ルール（クロスリファレンス）

| 条件 | 動作 |
|------|------|
| `source ∈ { switchbot_api, local_collector }` | `series.parquet` へマージ可 |
| 新バケット or 値変化 or heartbeat | 行 UPSERT · `value_revision` 更新 |
| `source=manual_entry` | **Tier B 拒否** — Tier A `capture/measurement` へ |
| 統治・Placement イベント | **Tier A INSERT ONLY** — series を上書きしない |

---

## 3. Tier 間の関係

```text
┌─────────────────────────────────────────────────────────────┐
│ Tier A — INSERT ONLY（統治・会計・観測 commit）                │
│   governance · votes · disputes · karma · market · binding   │
└────────────────────────────┬────────────────────────────────┘
                             │ 参照（raw_source_ref）
┌────────────────────────────▼────────────────────────────────┐
│ Tier B — API 冪等 UPSERT（環境テレメトリ）                    │
│   natural key: (device_id, 5min_bucket)                      │
│   source: switchbot_api | local_collector のみ               │
└────────────────────────────┬────────────────────────────────┘
                             │ 集約
┌────────────────────────────▼────────────────────────────────┐
│ Tier C — 最新ポインタ（派生投影 · REPLACE 可）                 │
└─────────────────────────────────────────────────────────────┘
```

| 操作 | Tier A | Tier B | Tier C |
|------|--------|--------|--------|
| 新規 INSERT | ✅ 常時 | ✅（新バケット） | — |
| 同一キー UPSERT | ❌ | ✅（API 由来のみ） | ✅ |
| 人間手入力で上書き | 相殺 event のみ | ❌ **禁止** | — |
| DELETE | ❌ | ❌（論理削除 event で代替） | 再生成で上書き |

---

## 4. ProjectRules R2 との整合（scoped interpretation）

| ProjectRules / R2Engine 条項 | Tier A | Tier B | 解釈 |
|------------------------------|--------|--------|------|
| R2 INSERT ONLY | **厳守** | **観測物質ストアに限定して UPSERT 許可** | Tier B は **観測物質の物質記録** であり統治史ではない |
| R2 = Single Source of Truth | 統治・会計の正本 | 環境時系列の正本（バケット最新） | スコープが異なる |
| C‑Sync 経由書込 | Tier A event は必須 | Tier B は `env_ingest` component 経由 | 直接 DB 書込禁止は維持 |
| 文明同一性（ハッシュチェーン） | 連続性必須 | Tier B UPSERT は **ハッシュチェーン外の物質投影** または **append-only revision log + 最新投影** の二層で実装可（実装設計で選択） |

**明確化**: Tier B の UPSERT は **「統治イベントの改ざん」ではない**。同一 5 分バケットに対する API 再取得の **収束** を表す。監査が必要な場合は `value_revision` 系列と `collector_run_id` で追跡する。

---

## 5. `manual_entry` と Tier B の分離

| シナリオ | 方針 |
|----------|------|
| ユーザーが UI で温湿度を手入力 | **Tier A** `capture/measurement` event として INSERT（`value_origin=manual_entry`） |
| 手入力値を Tier B 行に反映 | **禁止** — Tier B は API/collector 専用 |
| API 取得値と手入力値の矛盾 | UI は **両方表示** · 観測 commit は手入力を正とする（人間優先） |
| 手入力後の API poll | Tier B 行は **独立に UPSERT** — 手入力は上書きされない |

---

## 6. 実装への委譲

| 項目 | 参照 |
|------|------|
| SwitchBot poll · UPSERT 戦略 | [`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) §データクラス Tier B |
| #13 collector · ingest | [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) §Persistence |
| schema | `02-設計/_横断/schema/events/telemetry_sample.schema.yaml`（`value_revision` 等追加） |

---

## 7. 人間ゲート

| ID | 内容 |
|----|------|
| HUMAN-ADR-H-20 | データクラス 3 層 · ProjectRules scoped interpretation の承認 | **✓ CONFIRMED 2026-06-10** |

---

*HUMAN-CONFIRMED v1 · 2026-06-10 · 設計確定 · 実装は `HUMAN-IMPL-BATCH8-GO` 後*
