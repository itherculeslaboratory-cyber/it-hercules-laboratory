# ADR-H-31 — SwitchBot 過去データ Import API v1（DRAFT）

> **ステータス**: DRAFT（2026-06-21）— API 契約スケッチ · **列マッピング実機確定（2026-06-25）** · 汎用契約は [`ADR-H-35`](./ADR-H-35-汎用デバイスCSV取り込み-v1-DRAFT.md)  
> **実装**: **ver1 実装済（2026-06-26）** — `apps/api/routes/env.py` `import_device_csv` · parser [`libs/ihl/env/csv_import.py`](../../../libs/ihl/env/csv_import.py) · DPT/VPD **保存しない**
> **決定日**: 2026-06-21  
> **運用位置づけ**: [`ADR-H-30`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) §10 — **主経路はユーザー PC poll · 本 ADR は補助 backfill**  
> **上位**: [`ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)（**secret 非保持は不変**）  
> **個体↔device↔期間**: [`ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md`](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md)  
> **保存戦略**: [`ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md)（Tier B 5 分バケット UPSERT）

---

## 1. 問いの答え（要約）

| できること | できないこと |
|------------|--------------|
| **IHL API が Export CSV/JSON を受け取り Tier B にマージ**（`source=switchbot_import`） | **IHL サーバが SwitchBot secret で過去履歴を取得**（公式 API なし · ADR-H-30 禁止） |
| **ユーザー PC 上の CLI が CSV を読み、署名付き batch を ingest/import へ POST** | **ブラウザから SwitchBot Open API 直叩き**（secret 露出 · CORS） |
| **設定 UI から CSV ドラッグ＆ドロップ → import API** | **SwitchBot クラウドから IHL が自動 pull** |

**ユーザーが必ず残るローカル手順**: SwitchBot アプリの **Export Data**（または HA 等から CSV 生成）。その後は **API で IHL へ送る**のが v1 正本。

---

## 2. 外部調査（2026-06-21）

| 経路 | 過去データ | secret 要否 | IHL 適合 |
|------|-----------|-------------|----------|
| **SwitchBot Open API v1.1** | **現在値のみ** · 履歴一括 export **なし**（[SwitchBotAPI #432](https://github.com/OpenWonderLabs/SwitchBotAPI/issues/432)） | 要 | サーバ poll **禁止**（ADR-H-30） |
| **SwitchBot アプリ Export Data** | Hub 連携時 **最大約 2 年** · CSV（timestamp · 温湿度） | **不要** | **v1 正本** |
| **@switchbot/openapi-cli `device-history`** | **MQTT tail 開始以降**の JSONL · アプリ内クラウド履歴の retroactive pull **ではない** | 要（MQTT/API 設定） | ローカル bridge 素材のみ |
| **Home Assistant `history` export** | HA 保持分 · 形式は HA 依存 | HA 側に secret | 変換 connector で import 可（v2 候補） |

---

## 3. オプション比較

| # | 方式 | 実現性 | ギャップ品質 | UX | ADR-H-30 |
|---|------|--------|-------------|-----|----------|
| **A** | **IHL import API**（session 認証 · CSV/JSON） | 高 · `merge_telemetry_bucket` 再利用 | **アプリ export 粒度**（often ≤1min）→ 5 分バケット集約 | ブラウザ upload 可 | **完全準拠**（secret ゼロ） |
| **A′** | 同上 · **Ed25519 署名 JSON batch**（collector 鍵） | 高 · ingest 契約拡張 | 同上 | CLI / 自動化向け | 準拠 |
| **B** | **ローカル bridge** `ihl-env-import` → import or ingest | 高 · Node/Python 薄ラッパ | CSV=アプリ品質 · poll=forward のみ | ターミナル 1 コマンド | 準拠（secret は CSV 読取時不要） |
| **B′** | 既存 `collector/` + SwitchBot poll → ingest | 実装済 | **過去穴は埋まらない** · forward 5min | PC 常時稼働 | 準拠（ユーザー PC のみ） |
| **C** | SwitchBot 公式 history API | **不可**（2026-06 未提供） | — | — | — |
| **D1** | Export フォルダ watch → ローカル CLI | 中 | 同上 | 週次 export を置くだけ | 準拠 |
| **D2** | ブラウザ bookmarklet → import API | 低〜中 | 同上 | やや hacky | 準拠 |
| **D3** | HA history → CSV → import | 中（v2） | HA 保持分に限定 | HA ユーザー向け | 準拠 |

---

## 4. v1 決定（推奨）

### 4.1 二経路 IN（secret 非保持）

| 優先 | 経路 | 用途 |
|------|------|------|
| **1（正本）** | `POST /api/env/import/device-csv`（`format=switchbot_hub_export_v1`）· **エイリアス** `/import/switchbot` | Web UI · curl · 手動 export 直後 |
| **2（任意）** | ローカル CLI `ihl-env-import` → 上記 API **または** 署名付き `POST /api/env/ingest` batch | 大量 CSV · フォルダ watch · CI なし自動化 |

**却下（v1）**: IHL サーバが SwitchBot API を叩く import/sync · ブラウザ内 secret 保持。

### 4.2 `POST /api/env/import/switchbot` — 契約スケッチ

**認証**: IHL ユーザーセッション（magic link 後 Bearer）— **Ed25519 collector 鍵は不要**（人間操作の import と区別）。

**Content-Type（いずれか）**:

| 形式 | 用途 |
|------|------|
| `multipart/form-data` | `file` = SwitchBot export CSV · `device_id` = IHL 登録 device ID（必須） · `dry_run` optional |
| `application/json` | `schema: env_switchbot_import_v1`（下記） |

**JSON body（`env_switchbot_import_v1`）**:

```json
{
  "schema": "env_switchbot_import_v1",
  "userId": "@IT.Hercules.Laboratory",
  "deviceId": "ihl-dev-abc123",
  "importRunId": "01JXXXXXXXXXXXXXXXXXXXX",
  "samples": [
    {
      "capturedAt": "2026-06-01T12:05:00+09:00",
      "measurements": { "temperatureC": 24.2, "humidityPct": 58 }
    }
  ]
}
```

**CSV 列マッピング（v1 · `HUMAN-IMPORT-SCHEMA` 解消 2026-06-25 · 実機 `ハブ3 7E_data.csv`）**:

| Export 列（実測） | Tier B フィールド |
|-------------------|-------------------|
| `Date` — `YYYY-MM-DD HH:MM`（naive · 既定 TZ `Asia/Tokyo`） | `captured_at` → `bucket_start_unix = floor(ts, 300)` |
| `Temperature_Celsius(℃)` | `temperature_c` |
| `Relative_Humidity(%)` | `humidity_pct` |
| `Light_Value` | `light_level`（任意） |
| `DPT(℃)` · `VPD(kPa)` · `Abs Humidity(g/m³)` | **v1 保存しない**（派生列） |

**互換 alias**（他言語/firmware UI）: `Timestamp`/`日時` · `Temperature (°C)`/`温度` · `Humidity (%)`/`湿度` — 詳細 [ADR-H-35 §4.3](./ADR-H-35-汎用デバイスCSV取り込み-v1-DRAFT.md).

**ファイル特性（実測）**: UTF-8 · カンマ区切り · **1 分粒度** · **device 列なし**（`device_id` は API 必須）· 1 年分 ~138k 行 / 5.9 MB · 2 年分は ~10–14 MB 帯 → 上限は H-35 §3.4（200k 行 · 16 MB）。

**処理**:

1. 行ごとに `merge_telemetry_bucket`（[`libs/ihl/env/env_telemetry.py`](../../../libs/ihl/env/env_telemetry.py)）
2. `source=switchbot_import`（**`UPSERT_SOURCES` に追加** · 現状は `switchbot_api` \| `local_collector` のみ）
3. 同一 `(device_id, bucket_start_unix)`: epsilon 超の差分で `value_revision++` · **import と collector 競合時は `ingested_at` 新しい方 wins**（監査: `insert_reason=import_backfill`）
4. heartbeat スキップは **import では適用しない**（export 行はすべて material として扱う）

**Response 201**:

```json
{
  "importRunId": "01JXXXXXXXXXXXXXXXXXXXX",
  "bucketsWritten": 120,
  "bucketsSkipped": 3,
  "skippedReasons": { "unchanged": 3 },
  "range": { "from": "2026-05-01T00:00:00Z", "to": "2026-06-01T23:55:00Z" }
}
```

**制限（v1）**:

| 項目 | 値 |
|------|-----|
| 1 リクエスト最大行数 | **200_000**（Hub 約 2 年 Export 対応 · [ADR-H-35](./ADR-H-35-汎用デバイスCSV取り込み-v1-DRAFT.md)） |
| 最大ファイルサイズ | **16 MB** |
| 超過時 | **413** · v2 で async job 検討 |

### 4.3 ローカル CLI `ihl-env-import`（任意 · 参考実装）

```bash
# secret 不要 — SwitchBot アプリ export CSV のみ
ihl-env-import switchbot \
  --file ~/Downloads/meter-export.csv \
  --device-id ihl-dev-abc123 \
  --api https://ihl.example/api \
  --session-token "$IHL_SESSION"
```

**代替**: Ed25519 鍵済みなら CSV → `env_collector_ingest_v1` batch → 既存 `POST /api/env/ingest`（**実装変更最小**だが batch サイズ・`capturedAt` 1 件/reading 制約に注意）。

### 4.4 UI

- 設定 › 環境 IoT › **「SwitchBot 履歴を取り込む」** — ファイル選択 · device 紐付け · 結果サマリ（書込 / skip / 期間）
- 取り込み後: 既存 gap UI（ADR-H-19 §6）で **import 後も残る空白**を表示（export 範囲外 · 5 分バケット化による間引き）

---

## 5. 実装影響（チェックリスト）

| 項目 | 変更 |
|------|------|
| `UPSERT_SOURCES` | `switchbot_import` 追加 |
| `apps/api/routes/env.py` | `POST /import/switchbot` 新設 |
| `libs/ihl/env/switchbot_import.py` | CSV パース · 行→row 正規化（新規） |
| `insert_reason` | `import_backfill` enum 追加 |
| テスト | CSV fixture · bucket UPSERT · session 401 |
| Web | upload 画面（ScreenDef 別途） |

**実装しない（v1）**: SwitchBot secret 読取 · server-side export pull · async job queue。

---

## 6. ADR 相互参照

| ADR | 更新 |
|-----|------|
| **ADR-H-30** | §10 運用凍結 · import API を v1 **補助 IN** として明記 |
| **ADR-H-32** | import だけでは個体↔device 区間は復元不可 — Occupancy+Binding 必須 |
| **ADR-H-19** | §6 バックフィル「アプリ CSV → import connector」に読み替え |

---

## 7. 人間ゲート

| ID | 内容 |
|----|------|
| HUMAN-ADR-H-31 | import API 契約 · CLI 要否 · session vs 署名の優先 |
| HUMAN-IMPORT-SCHEMA | **解消（2026-06-25）** — [ADR-H-35 §2](./ADR-H-35-汎用デバイスCSV取り込み-v1-DRAFT.md) · 複数 device 同梱 = **ver1 OUT** |

---

*DRAFT v1 · 2026-06-21 · 契約スケッチのみ — コード変更は別 IMPL タスク*
