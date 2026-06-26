# ADR-H-19 — SwitchBot 取得戦略：5 分差分ポーリング v1

> **ステータス**: **HUMAN-CONFIRMED 2026-06-10**（ユーザー `ADR-H-19 Go`）  
> **決定日**: 2026-06-10  
> **関連**: ユーザー提案「SwitchBot は 3–6 ヶ月履歴保持 · 5 分 poll · 既取得分との diff のみ取得」  
> **データクラス正本**: [`ADR-H-20-データクラスと書込方針-v1.md`](./ADR-H-20-データクラスと書込方針-v1.md)  
> **実装設計**: [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md)  
> **取得経路制約（2026-06-21）**: 本 ADR の **Tier B 保存戦略**（5 分バケット UPSERT）は **import / ローカル ingest でも有効**。**IHL サーバが SwitchBot secret を保持して poll する**経路は [`ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) により **v1 却下**。

---

## 1. 文脈 — SwitchBot Open API の実態

### 1.1 「3–6 ヶ月履歴」の意味

| 層 | 内容 | API で取れるか |
|----|------|----------------|
| **SwitchBot アプリ内グラフ** | 温湿度の履歴表示（機種・プランにより **おおよそ 3〜6 ヶ月**） | **不明瞭 / 公式に一括エクスポート API なし**（2026-06 時点） |
| **Open API `GET /v1.1/devices/{id}/status`** | **現在値（スナップショット）** のみ | **毎回 1 読み** |
| **civ-os 現状** | poller/collector が status を定期取得し **自前 R2 に時系列構築** | IHL でも同型 |

**結論**: 「3–6 ヶ月」は **SwitchBot クラウド側の UI 履歴**であり、IHL が依存すべき正本は **自前 Tier B 時系列**（[`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md) §2.4: `truth/env/telemetry/v1/{user_id_hash}/{device_id}/series.parquet`）である。API から過去 6 ヶ月を一括 diff 取得する公式手段は **期待しない**。

### 1.2 ユーザー提案の読み替え

| 提案 | IHL での解釈 |
|------|--------------|
| 5 min poll | **採用** — 既定 `POLL_INTERVAL_SEC=300`（civ-os `COLLECTOR_INTERVAL_SEC` 同等） |
| diff のみ fetch | **API には diff エンドポイントが無い** → **取得は毎回 status · 保存はバケット UPSERT** |
| 3–6 ヶ月 | **IHL 保持ポリシー**で設計（削除は別 ADR · Tier A は INSERT ONLY 維持） |

---

## 2. 決定 — 推奨戦略

### 2.1 採用: **5 分 poll + バケット UPSERT（変化あり OR ハートビート）**

```
毎 5 分:
  1. 登録 device ごとに GET status（SwitchBot API）
  2. bucket_start = floor(unix_ts(now), 300)
  3. 直近バケット行と比較（libs/env_telemetry.py）
  4. 次のいずれかなら series.parquet をマージ（自然キー: device_id + bucket_start）:
     a) いずれかの測定値が epsilon を超えて変化
     b) 当該バケットに行が無い（heartbeat — 同一値でも 1 行/5分）
     c) 前回 ERROR → 今回 SUCCESS（復帰イベント）
  5. それ以外はスキップ（ログ: env_telemetry_skip_unchanged）
  6. UPSERT 時: value_revision++ · collector_run_id · fetched_at を更新
```

**推奨理由**:

| 方式 | メリット | デメリット |
|------|----------|------------|
| **毎 poll 無条件 INSERT**（civ-os poller 現状） | 実装単純 | R2 膨張 · 観測クエリノイズ |
| **変化時のみ INSERT（バケット無視）** | 最小ストレージ | 値が一定のとき **タイムラインが欠損** |
| **✅ バケット UPSERT（変化 OR heartbeat）**（本 ADR） | ストレージ抑制 + **最大 5 分粒度の連続性** + collector 再実行の冪等性 | 比較状態のキャッシュが必要 |

### 2.2 epsilon（変化判定）

| 測定 | 既定 epsilon | 根拠 |
|------|--------------|------|
| `temperatureC` | 0.1 °C | SwitchBot 分解能相当 |
| `humidityPct` | 1 % | 整数表示が多い |
| `co2Ppm` | 10 ppm | センサー揺らぎ |
| `lightLevel` | 5 lux | 照度 |
| `batteryPct` | 1 % | バッテリー機 |

環境変数 `ENV_TELEMETRY_EPSILON_JSON` で上書き可。

### 2.3 自然キー（バケット dedup）

```text
natural_key = (device_id, bucket_start_unix)
bucket_start_unix = floor(unix_ts(captured_at), 300)   # 5 分バケット
```

- 同一自然キーへの書込は **UPSERT**（`source=switchbot_api` のみ）
- 二重 collector 対策: 同一 `collector_run_id` + 同一自然キーは **no-op**
- 旧 dedup_key（measurements ハッシュ）は **監査補助** として `dedup_key` フィールドに残す

---

## 2.4 二層モデル — 連続テレメトリ vs 撮影時スナップショット

環境データは **用途が異なる 2 層** で扱う（個体ごとの env ファイルは作らない）。

| 層 | 正本 | 更新 | 用途 |
|----|------|------|------|
| **連続テレメトリ（Tier B）** | `truth/env/telemetry/v1/{user_id_hash}/{device_id}/series.parquet` | 5 分 poll · バケット UPSERT | Placement 期間クエリ · 履歴グラフ · Occupancy 区間との join |
| **撮影時スナップショット（Tier A）** | `capture/measurement` 内 `environmentSnapshot` | 写真 commit 時 **1 回 INSERT** | その瞬間の計測値を観測記録に固定（連続 series とは別物） |

```text
連続:  Device ──poll──► series.parquet（マージ可 · ADR-H-20 Tier B）
瞬間:  Photo commit ──► environmentSnapshot @ captured_at（Tier A · 上書き不可）
```

**クエリ方針**: 個体の「その期間の環境」は **Occupancy 区間 × Placement にバインドされた Device の series** を join して導出する。Specimen 専用 Parquet は **作らない**（[`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) §9）。

固体観測 commit 時は **撮影時点の environmentSnapshot** を Tier A に載せ、必要なら `raw_source_ref` で当該バケットの Tier B 行を参照する（legacy [`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md) §SolidEnvironmentSnapshot 接続を salvage-adapt）。

---

## 3. データクラス Tier B

> **正本**: [`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md) §2.2

| 項目 | 内容 |
|------|------|
| **分類** | **Tier B** — API 冪等書込（観測物質） |
| **自然キー** | `(device_id, bucket_start_unix)` — 5 分バケット |
| **UPSERT 許可** | `source ∈ { switchbot_api, local_collector }` **のみ** |
| **Tier A との境界** | 統治 · 投票 · Placement ライフサイクル · 観測 commit は **INSERT ONLY**（Tier A） |
| **人間手入力** | `manual_entry` は **Tier B 行を上書きしない** — 手入力は Tier A `capture/measurement` として別 INSERT |

**UPSERT 時の動作**:

| 状況 | 動作 |
|------|------|
| 新バケット | INSERT（`value_revision=1`） |
| 既存バケット · 値変化 | REPLACE 相当 UPSERT（`value_revision++`） |
| 既存バケット · 値不変 · heartbeat 条件 | UPSERT（`fetched_at` · `collector_run_id` 更新 · `value_revision` は据え置き可） |
| `source=manual_entry` からの書込 | **拒否**（403 または skip + 監査ログ） |

---

## 4. Provenance フィールド（必須）

| フィールド | 型 | 意味 |
|------------|-----|------|
| `source` | enum | `switchbot_api` \| `local_collector`（Tier B UPSERT 許可源） |
| `collector_run_id` | ULID | 当該 poll/ingest 実行 ID |
| `fetched_at` | ISO8601 | SwitchBot API 応答受信時刻 |
| `value_revision` | int | 同一 `(device_id, bucket)` 内の上書き回数（初回 `1`） |
| `captured_at` | ISO8601 | 測定代表時刻（API 値 or バケット開始） |
| `ingested_at` | ISO8601 | IHL 永続化時刻 |
| `insert_reason` | enum | `changed` \| `heartbeat` \| `recovery` |
| `dedup_key` | string | 監査補助（measurements 正規化ハッシュ） |

---

## 5. Tier A（INSERT ONLY）との整合

| 原則 | 適用 |
|------|------|
| 統治・会計・観測 commit | **Tier A INSERT ONLY** — [`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md) |
| Tier B UPSERT | **観測物質のみ** — ProjectRules R2 の scoped interpretation |
| 比較用キャッシュ | **Tier B 最新バケット行読み** or API プロセス内 LRU |
| Binding 終了 | **Tier A 新 event** `device_binding_ended` — Tier B 行の更新ではない |
| 修正・訂正 | Tier A は相殺 event · Tier B は **新 revision UPSERT**（人間介入なし） |

---

## 6. バックフィル戦略

| シナリオ | 方針 |
|----------|------|
| **新規 IHL 導入** | バックフィルなし · 導入時点から 5min 戦略で前進 |
| **civ-os R2 から移行** | 別 migration ADR · 一括 import は **バケット自然キーで UPSERT**（重複バケットは最新 wins） |
| **SwitchBot アプリ履歴の取り込み** | 公式 pull API 非対応 · **手動 Export CSV → IHL import**（[`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) · `source=switchbot_import` · バケット UPSERT） |
| **長期オフライン後の復帰** | 次回 poll から再開 · 欠測期間は **gap として UI 表示**（補間は `value_origin=imputed` で Tier A 別 event） |

---

## 7. Storage — env sample event schema（草案）

```yaml
# 02-設計/_横断/schema/events/telemetry_sample.schema.yaml（要作成）
telemetry_sample_id: string          # 初回 INSERT 時 ULID · UPSERT 時は同一 ID 維持
actor_id: string
device_id: string
placement_id: string | null
bucket_start_unix: int             # 自然キー成分
captured_at: ISO8601
ingested_at: ISO8601
source: switchbot_api | local_collector   # UPSERT 許可源のみ
measurement_method: iot_switchbot
measurements:
  temperatureC: number?
  humidityPct: number?
  co2Ppm: number?
  lightLevel: number?
  batteryPct: number?
insert_reason: changed | heartbeat | recovery
# --- provenance（Tier B 必須）---
collector_run_id: string
fetched_at: ISO8601
value_revision: int
dedup_key: string
schema_version: int
data_tier: B                       # 固定 · 監査用
```

`capture/measurement`（観測 commit · **Tier A**）との連携は `raw_source_ref: telemetry_sample:{id}`。

---

## 8. レート制限 · バッテリー機

| 項目 | 対策 |
|------|------|
| **SwitchBot API rate limit** | 公式値は非公開 · **device 数 × 1 req/poll** · 逐次 + 100ms gap · 429 時 exponential backoff（civ-os `envTelemetryCollector` 流用） |
| **バッテリー駆動センサー** | 5min は civ-os 既定と同じ · 過密 poll 禁止 · `batteryPct` 低下時はログ警告のみ（poll 間隔は **ユーザー設定で延長可** · 最小 300s） |
| **全 device 失敗** | civ-os 同型 `env_telemetry_degraded` · **error 行は optional UPSERT**（監査用 · 測定値なし） |
| **collector オフライン** | `queue.jsonl` append-only · 復帰時 flush · 古いキューは **自然キー UPSERT で収束** |

---

## 9. civ-os との差分（意図的変更）

| civ-os | IHL（本 ADR） |
|--------|---------------|
| `recordSolidEnvSample` 毎サイクル INSERT | **バケット UPSERT（変化 + heartbeat）** |
| INSERT ONLY 一律 | **Tier B UPSERT**（[`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md)） |
| `placementResolved: false` 常態 | Binding 実装後に true 化 |
| Node poller + Node collector | Python libs + 同一 UPSERT ロジック共有 |

---

## 10. 推奨まとめ（ユーザー向け 2–3 文）

**SwitchBot API は「現在値」しか返さないため、5 分ごとに status を読み、IHL 側で `(device_id, 5 分バケット)` を自然キーとして「変化があるとき」または「当該バケットの初回（heartbeat）」に Tier B 行を UPSERT する。**  
これでストレージ膨張を抑えつつ、collector 再実行の冪等性と観測に必要な時系列粒度を維持する。  
統治イベントは Tier A INSERT ONLY のまま · **人間の手入力は Tier B を上書きしない**（[`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md)）。

---

## 11. 人間ゲート

| ID | 内容 |
|----|------|
| HUMAN-ADR-H-19 | 本戦略の承認 | **✓ CONFIRMED 2026-06-10** |
| HUMAN-ADR-H-20 | データクラス · Tier B UPSERT の承認（前提） | **✓ CONFIRMED 2026-06-10** |
| HUMAN-COLLECTOR-KEYS | 実機 poll 検証 |

---

*HUMAN-CONFIRMED v1 · 2026-06-10 · 設計確定 · 実装は `HUMAN-IMPL-BATCH8-GO` 後*
