# ADR: Device Driver Registry（REQ-030 — 非 SwitchBot デバイス対応）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **作成日**: 2026-06-08
> **判断 ID**: H-device-driver-registry
> **解消ギャップ**: P0-GAP-C-04 / REQ-030（型定義はあるが ADR・API・UI が無い）
> **前提**: [`13-データ取得元管理.md`](./13-データ取得元管理.md) §⑨ · `design/adr/ADR-env-placement-device-binding.md`（4 概念）· [`00-設計網羅監査-専門班-C-設定IoT.md`](./00-設計網羅監査-専門班-C-設定IoT.md) B-2/D

---

## 文脈

ENV エピックは SwitchBot で完了（専門班 C B-1）。しかし **非 SwitchBot デバイス**（BLE 体重計・Wi-Fi センサ等）は型定義（`SolidRegisteredDevice`）があるだけで、ADR・API・UI が無い（REQ-030 未設計）。SwitchBot 専用ロジックが散在すると拡張不能になる。

---

## 決定

### 1. Driver 抽象（C-USB Driver = X 層 Connector）

デバイス種別ごとに **Driver** を定義し、共通 ingest 契約に正規化する:

```yaml
driver:
  driver_id: string            # 例: switchbot.meter / ble.scale.generic / wifi.sensor.xyz
  transport: enum              # cloud_api | ble | wifi_local | manual
  capabilities: [temperature, humidity, co2, weight, ...]   # 計測能力
  secret_location: enum        # collector_env | none（★ R2/フロント保存は不可）
  normalize_to: measurement    # 出力は measurement 縦持ち（value_origin=environment_derived 等）
```

- 既存 SwitchBot は `driver_id=switchbot.meter`（後付けで registry に載せるだけ・破壊変更なし）。
- Driver は **収集の入口**。出力は必ず `measurement` / TelemetryIngest の **共通契約**に正規化（OSS 内部形式に依存しない・README 5.2）。

### 2. registry（catalog 同型・読取参照）

```
ihl/devices/registry/<driver_id>.yaml      # driver メタ（能力・transport）
```

- registry は **どの driver が利用可能か**の正本。UI（[`13-データ取得元管理-UI設計-v1.md`](./13-データ取得元管理-UI設計-v1.md)）は registry に載った driver のみ提示（未対応種別を出さない＝「未実装」を見せない）。

### 3. API（既存 env API を拡張）

| ルート | 内容 |
|--------|------|
| `GET /api/env/drivers` | 利用可能 driver 一覧（registry 投影）|
| `POST /api/env/devices` | デバイス登録（driver_id + ラベル。**秘密値は受け取らない**）|
| `POST .../device-binding/start\|end` | 既存（driver 非依存・FR-ENV-02）|

### 4. 秘密値・署名の原則（不変）

- どの driver でも **TOKEN/SECRET は R2/フロントに載せない**（collector `.env`・Docker volume のみ）。
- collector → backend は Ed25519 署名 ingest を共通利用（FR-ENV-07）。BLE/Wi-Fi も同一 ingest 契約に寄せる（FR-ENV-10）。

### 5. スコープ

- **本 ADR = registry/driver 抽象と API/UI 接点の確定**まで。個別 driver（特定 BLE 体重計）の実装は **driver ごとの追加 PR**（component 追加 4 ステップに準拠）。
- Phase 1 は SwitchBot のみ実運用。registry は **拡張の器**を設計で先に固定する。

---

## 影響

- **13 データ取得元管理**: §⑨「Driver registry（REQ-030）で拡張予定」を本 ADR で具体化。
- **UI**: 機器一覧で driver 種別 chip 表示（[`13-データ取得元管理-UI設計-v1.md`](./13-データ取得元管理-UI設計-v1.md) §4）。
- **schema**: `driver.schema.yaml` / `registered_device.schema.yaml` を 02-設計/_横断/schema/ に追加候補。
- 実装 Go 不可 — 設計ゲート 4 点は別途人間確定。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
