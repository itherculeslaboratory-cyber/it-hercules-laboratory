# ADR-H-35 — 汎用デバイス CSV 取り込み v1（DRAFT）

> **ステータス**: DRAFT（2026-06-25）— **実機 Export 検証済** · 実装は `DELEGATED-IMPL-GO` 後  
> **決定日**: 2026-06-25  
> **上位**: [`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md)（SwitchBot 専用 preset）· [`ADR-H-30`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) · [`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md)  
> **デバイス登録**: [`13-データ取得元管理.md`](../../01-要件/13-データ取得元管理.md) · `DeviceRegistry` · [`ADR-H-33`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md)

---

## 1. 問いの答え

| できること | できないこと |
|------------|--------------|
| **登録済み device** に CSV/JSON 行を **append/diff のみ** で Tier B へマージ | 未登録 device への自動作成（**400 DEVICE_NOT_REGISTERED**） |
| **SwitchBot Hub Export** を **組み込み preset** で取り込み | SwitchBot クラウドからの server pull（ADR-H-30 禁止） |
| **任意 CSV** を `column_map` で Tier B へ（ver1: 温湿度+光 · ver2: 拡張列） | CSV 内の **複数 device 同梱**（ver1 OUT — `device_id` はリクエストで 1 件） |
| **再取り込み** — 同一バケットは epsilon 内なら skip · 差分のみ revision++ | 行単位の完全重複 INSERT（`merge_telemetry_bucket` が抑止） |

**ADR-H-31 との関係**: H-31 は **SwitchBot 運用・UX・secret 非保持** の正本。本 ADR は **汎用 ingest 契約 + 列マッピング + dedup** の正本。API は **単一** `POST /api/env/import/device-csv` を正とし、H-31 の `/import/switchbot` は **preset エイリアス**。

---

## 2. 実機検証 — SwitchBot Hub Export（2026-06-25）

**出典**: ユーザー実機 Export `ハブ3 7E_data.csv`（Hub 3 連携 · ファイル名に device ヒント · **CSV 内に device ID 列なし**）

| 項目 | 値 |
|------|-----|
| **エンコーディング** | UTF-8（BOM なし） |
| **区切り** | カンマ `,` |
| **ヘッダー** | 1 行目 · 7 列 |
| **データ行数** | 138,067（検証時） |
| **ファイルサイズ** | 約 5.9 MB |
| **時刻列** | `Date` — `YYYY-MM-DD HH:MM`（**タイムゾーン列なし · naive**） |
| **粒度** | **1 分間隔**（連続） |
| **期間（サンプル）** | `2026-03-21 20:17` 〜 `2026-06-25 18:00` |
| **複数 device** | **なし**（1 Export = 1 計測器の系列） |

### 2.1 列定義（実測）

| # | CSV 列名 | 例 | Tier B v1 | 備考 |
|---|----------|-----|-----------|------|
| 1 | `Date` | `2026-03-21 20:17` | `captured_at` | naive → リクエスト `timezone` で解釈（既定 `Asia/Tokyo`） |
| 2 | `Temperature_Celsius(℃)` | `20.5` | `temperature_c` | **必須（preset 時）** |
| 3 | `Relative_Humidity(%)` | `41` | `humidity_pct` | **必須（preset 時）** |
| 4 | `DPT(℃)` | `6.8` | — | 派生 · **v1 保存しない** |
| 5 | `VPD(kPa)` | `1.42` | — | 派生 · v1 保存しない |
| 6 | `Abs Humidity(g/m³)` | `7.30` | — | 派生 · v1 保存しない |
| 7 | `Light_Value` | `1` | `light_level` | **任意** · 整数スケール（SwitchBot アプリ定義） |

**`HUMAN-IMPORT-SCHEMA` 解消（2026-06-25）**: 上表を v1 正本とする。ADR-H-31 の候補列名（`Timestamp` / `Temperature (°C)`）は **別 firmware/言語 UI の可能性** — parser は **列名 alias テーブル**で吸収（§4.2）。

---

## 3. API 契約 — `POST /api/env/import/device-csv`

**認証**: IHL ユーザーセッション（magic link 後 Bearer）— collector Ed25519 **不要**。

### 3.1 Request

**Content-Type（いずれか）**:

| 形式 | フィールド |
|------|------------|
| `multipart/form-data` | `file`（CSV）· `device_id`（**必須** · DeviceRegistry 登録済み）· `format` optional · `timezone` optional（IANA · 既定 `Asia/Tokyo`）· `dry_run` optional |
| `application/json` | `schema: env_device_csv_import_v1`（下記） |

**JSON body（`env_device_csv_import_v1`）**:

```json
{
  "schema": "env_device_csv_import_v1",
  "userId": "@IT.Hercules.Laboratory",
  "deviceId": "dev_a1b2c3d4e5f6",
  "importRunId": "01JXXXXXXXXXXXXXXXXXXXX",
  "format": "switchbot_hub_export_v1",
  "timezone": "Asia/Tokyo",
  "samples": [
    {
      "capturedAt": "2026-03-21T20:17:00+09:00",
      "measurements": { "temperatureC": 20.5, "humidityPct": 41, "lightLevel": 1 }
    }
  ]
}
```

**`format` preset（v1）**:

| `format` | 用途 | `source` 値 |
|----------|------|-------------|
| `switchbot_hub_export_v1` | SwitchBot アプリ Hub Export（§2 実測列） | `switchbot_import` |
| `generic_v1` | `column_map` 必須（§4.2） | `csv_import` |

**エイリアス**: `POST /api/env/import/switchbot` = 同一ハンドラ · `format=switchbot_hub_export_v1` 固定 · ADR-H-31 互換。

### 3.2 Response 201

```json
{
  "importRunId": "01JXXXXXXXXXXXXXXXXXXXX",
  "deviceId": "dev_a1b2c3d4e5f6",
  "written": 27614,
  "skipped_duplicate": 120,
  "skipped_invalid": 3,
  "buckets_from_raw_rows": 138067,
  "range": {
    "from": "2026-03-21T11:17:00Z",
    "to": "2026-06-25T09:00:00Z"
  }
}
```

| フィールド | 意味 |
|------------|------|
| `written` | `merge_telemetry_bucket` が **新規 or revision++** したバケット数 |
| `skipped_duplicate` | 同一バケット · epsilon 内 **値不変**（`env_telemetry_skip_unchanged`） |
| `skipped_invalid` | パース失敗 · 必須列欠落 · 時刻逆転等 |
| `buckets_from_raw_rows` | CSV 行を **5 分バケット集約後**のユニークバケット数（診断用） |

### 3.3 エラー

| HTTP | `detail` | 条件 |
|------|----------|------|
| 400 | `DEVICE_NOT_REGISTERED` | `device_id` が actor の registry に無い |
| 400 | `INVALID_CSV_FORMAT` | ヘッダー不一致 · `generic_v1` で `column_map` 欠落 |
| 413 | `IMPORT_TOO_LARGE` | 行数/サイズ超過（§3.4） |
| 401 | `SESSION_REQUIRED` | 未認証 |

### 3.4 制限（v1 · 実機サイズ反映）

| 項目 | 値 | 根拠 |
|------|-----|------|
| 1 リクエスト最大行数 | **200_000** | Hub **約 2 年分**の 1 分粒度 export を **1 回で**取り込み可能に |
| 最大ファイルサイズ | **16 MB** | 2 年分実測（~10–14 MB 帯）+ 余裕 |
| 超過時 | **413** · クライアント分割 or v2 async job |

---

## 4. 処理パイプライン

```text
CSV/JSON rows
  → parse + validate (per-row)
  → normalize captured_at (timezone-aware ISO)
  → bucket_start_unix = floor(ts, 300)
  → aggregate per bucket (last row in bucket wins · captured_at = その行)
  → for each bucket: merge_telemetry_bucket(source=switchbot_import|csv_import)
  → summarize counts + range
```

### 4.1 Dedup 戦略

| 段階 | キー | 動作 |
|------|------|------|
| **バケット集約** | `(device_id, bucket_start_unix)` | 1 分 CSV を 5 分に畳む · **バケット内最終行**を代表値とする |
| **Tier B UPSERT** | 同上 + epsilon | 既存と差分 ≤ epsilon → `skipped_duplicate` · 超過 → `value_revision++` |
| **import vs collector** | 同一バケット | **`ingested_at` 新しい方 wins**（ADR-H-31 · H-19 同型） |

**heartbeat スキップ**: import 経路では **適用しない**（export 行はすべて material）。

### 4.2 汎用 `column_map`（`generic_v1` · ver1 IN）

```json
{
  "format": "generic_v1",
  "columnMap": {
    "timestamp": "Date",
    "temperatureC": "temp",
    "humidityPct": "RH",
    "lightLevel": "lux"
  },
  "timestampParse": {
    "pattern": "%Y-%m-%d %H:%M",
    "timezone": "Asia/Tokyo"
  }
}
```

| フィールド | 必須 | 備考 |
|------------|------|------|
| `timestamp` | ✓ | CSV 列名 |
| `temperatureC` | ✓ | 少なくとも温湿度のいずれか一方は必須 |
| `humidityPct` | ✓ | 同上 |
| `lightLevel` | — | ver1 任意 |

**ver2 候補**: `co2Ppm` · カスタム `timestampParse` · HA export preset · 複数 device 列。

### 4.3 SwitchBot 列名 alias（preset 内蔵）

| 実測（2026-06-25） | 互換 alias |
|--------------------|------------|
| `Date` | `Timestamp` · `日時` · `Time` |
| `Temperature_Celsius(℃)` | `Temperature (°C)` · `Temperature` · `温度` |
| `Relative_Humidity(%)` | `Humidity (%)` · `Humidity` · `湿度` |
| `Light_Value` | `Light` · `明るさ` |

---

## 5. デバイス紐づけ

1. クライアントは **事前に** `POST /api/v1/devices` で計測器を登録（`kind`: `switchbot` \| `wifi_sensor` \| `generic` 等）。
2. Import リクエストの `device_id` は **registry の内部 ID**（`dev_*`）を正とする。
3. テレメトリ parquet キー:
   - `external_device_id` があれば **そちらを series キー**（SwitchBot クラウド ID 連携 · 既存 `devices` route と同型）
   - なければ `device_id`
4. **Placement / 個体区間**は import では作らない — [ADR-H-32](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md) · 観測 commit 派生が正本。

---

## 6. UI（ver1 スタブ）

| 導線 | 内容 |
|------|------|
| 設定 › デバイス | 各行に **「CSV から履歴を取り込む」**（`device_id` プリセット） |
| 設定 › 環境 IoT（将来） | 一括 import · gap 表示と連携 |

**表示**: `written` / `skipped_duplicate` / 期間 · 取り込み後も ADR-H-19 gap UI で空白を明示。

---

## 7. 実装チェックリスト（IMPL 時）

| 項目 | 変更 |
|------|------|
| `UPSERT_SOURCES` | `switchbot_import` · `csv_import` 追加 |
| `libs/ihl/env/csv_import.py` | パース · バケット集約（**parser 先行 · 2026-06-25**） |
| `libs/ihl/env/env_telemetry.py` | `UPSERT_SOURCES` 拡張 |
| `apps/api/routes/env.py` | `POST /import/device-csv` · `/import/switchbot` alias |
| `tests/fixtures/switchbot_hub_export_sample.csv` | サニタイズ subset |
| `tests/unit/test_csv_import.py` | preset · bucket 集約 · invalid 行 |

---

## 8. 人間ゲート

| ID | 状態 | 内容 |
|----|------|------|
| HUMAN-IMPORT-SCHEMA | **解消（2026-06-25）** | §2 実測列 · timezone 既定 JST |
| HUMAN-ADR-H-35 | 未決 | 汎用 endpoint 一本化 · 200k 行上限 |
| HUMAN-ADR-H-31 | 未決 | `/import/switchbot` エイリアス化の承認 |

---

*DRAFT v1 · 2026-06-25 · 実機 `ハブ3 7E_data.csv` 根拠*
