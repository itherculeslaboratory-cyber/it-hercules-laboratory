# ADR-H-33 — 観測追記・デバイス紐づけ（v1 統合モデル · DRAFT）

> **ステータス**: DRAFT（2026-06-21）— **設計ゲート ユーザー明示承認済** · **観測 ver1 実装 COMPLETE（2026-06-26）** — `derive_bindings_from_observation` · commit 拡張 body 実装済  
> **実装参照**: `libs/ihl/observation/derive_bindings.py` · `apps/api/routes/observation_solid.py` `commit_solid_observation` · `apps/web/.../observation/input/page.tsx`

---

## 1. 決定要約（Executive）

| 項目 | 採用 |
|------|------|
| **核心原則** | **観測イベント = 計測点 + デバイス宣言 + 必要なら区間境界** |
| **履歴** | 観測は **常に新規 capture INSERT**（UPDATE 禁止 · `prior_capture_id` で連鎖） |
| **デバイス紐づけ UX** | **観測 commit が主トリガー** — 「環境・設置」チャンクで `placementId` + `devices[]` を宣言 |
| **区間の正本** | **Tier A イベント**（DeviceBinding / Occupancy）— commit から **自動派生 INSERT** |
| **単独 DeviceBinding API** | **ver1 では任意経路**（棚だけ動かす・観測なしで温度計交換）— **主経路は commit 派生** |
| **次回観測** | **ユーザーが入力時に `next_observation_at` を指定** · テンプレ stage 間隔でプリフィル · ver1 通知 = ホーム「今日の要約」（§5.3 · [`05-観測` §4.17](../../01-要件/05-観測.md)） |

**明示推奨**: ユーザーの **「observation commit = binding moment」** を **採用**する。ただし内部表現は ADR-env の DeviceBinding / Occupancy **イベントを残す**（テレメトリ区間 JOIN · 棚専用操作 · INSERT ONLY 監査のため）。

---

## 2. 背景と問題

### 2.1 ユーザー vision（2026-06-21）

1. **観測追記**: QR スキャン · 「観測を続ける」— **次回観測日はユーザーが入力時に指定**（テンプレで stage 別間隔を既定化可）
2. **APPEND**: 履歴を消さず、観測のたびに **新レコード**
3. **設備変更**: 棚移動 · 温度計交換時に **いつどの device が有効だったか** を後から説明
4. **期間境界**: 「〜今日まで device A · 今日から device B」— 温湿度計 **および** ジャイロ等 **複数 device 種**
5. **シンプル化**: 観測登録時点で既に device を選ぶ → その瞬間 **Docker poll 最新値** または **手入力**
6. **UX 固定**: [`ADR-H-32`](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md) §5.1 — **「環境・設置」独立チャンク**（個体命名の直後 · 計測行の直前）

### 2.2 ADR-H-32 とのギャップ

ADR-H-32 は **Placement ハブ + 2 本の区間イベント**（DeviceBinding / Occupancy）を正とし、**G1: 単独 DeviceBinding API** を ver1 blocking としていた。

ユーザー insight により **UX 上の正本は観測 commit** に寄せる。G1 を **「commit からの自動派生 + 任意の棚 API」** に再定義する。

### 2.3 現行実装（2026-06-21 · retrofit 評価）

| 能力 | 状態 | 備考 |
|------|------|------|
| `POST /api/solid-observation/commit` | 実装済 | capture + measurements INSERT |
| commit `placement_id` · `device_id` | 実装済 | 単一 device · `observation_context` に placement のみ |
| `include_env_measurements` + telemetry | 実装済 | `iot_switchbot` · `environment_derived` |
| Occupancy start/end API | 実装済 | `placement_store.py` |
| DeviceBinding start/end | **未実装** | shelf `openBinding: null` |
| `prior_capture_id` / 観測連鎖 | **未実装** | 要件 OBS-SOL-08 のみ |
| commit 時の binding 自動派生 | **未実装** | 本 ADR の IMPL 対象 |

---

## 3. 統合モデル

### 3.1 核心原則

```text
観測イベント = 計測点(capture) + デバイス宣言(devices[]) + 必要なら区間境界(binding/occupancy 派生)

         ┌─────────────────────────────────────┐
         │  ObservationCommit (Tier A · 点)     │
         │  capture_id · individual_id          │
         │  observed_at (= capture_timestamp)   │
         │  placement_id                        │
         │  devices[] · env_snapshot?           │
         │  prior_capture_id?                   │
         └──────────────┬──────────────────────┘
                        │ 同一トランザクションで派生 INSERT
         ┌──────────────┴──────────────────────┐
         ▼                                      ▼
 DeviceBinding 区間                    Occupancy 区間
 [startedAt … endedAt?]                [startAt … endAt?]
 effective_from = observed_at          subject_ref = @individual/{id}
```

- **点**（今回の計測値）: capture · measurement 行 · 任意 `environment_snapshot`（ADR-H-32 §5.1 checkbox）
- **線**（期間の正本）: DeviceBinding / Occupancy — **commit が境界を切る**（device / placement 変更時）

### 3.2 `devices[]` 契約（commit ボディ拡張案）

```typescript
/** 観測 commit に載せるデバイス宣言（ver1 最小） */
interface ObservationDeviceDeclaration {
  device_id: string;           // registry 公開 ID（例: dev_… / SwitchBot external 解決後）
  role: "temp_humidity" | "gyro" | "co2" | "lux" | "custom";
  source: "registry_poll" | "manual_entry" | "unchanged";  // unchanged = 前回と同じ明示
  /** 計測行から引用した場合の measurement_name（任意 · 監査用） */
  linked_measurement_names?: string[];
}
```

| フィールド | 意味 |
|------------|------|
| `observed_at` | **commit 時刻** = 区間境界の `effective_from`（サーバ `capture_timestamp` と同一） |
| `placement_id` | 物理スロット hub |
| `devices[]` | **複数種**（温湿度 · ジャイロ等）— 空なら binding 派生なし |
| `prior_capture_id` | 同一 `individual_id` 内の **直前 capture**（連鎖 · 監査） |
| `environment_snapshot` | **点**の温湿度等（poll または manual · 区間とは分離） |

**計測行との関係**: IoT 行で `device_id` を選んだら **devices[] に同 device を自動反映**（DRY · ユーザー二重入力禁止）。「環境・設置」チャンクが **マスタ** · 計測行は **引用/上書き可**（ADR-H-32 §5.1）。

### 3.3 区間境界の自動派生ルール

commit 受理時、サーバは **現在の open 状態** と比較し **INSERT ONLY** で派生する。

| 条件 | 派生イベント |
|------|----------------|
| `devices[]` に含まれる `(placement_id, device_id, role)` が open binding と **不一致** | 該当 placement の **旧 binding end**（`ended_at = observed_at`）+ **新 binding start**（`started_at = observed_at` · `source: observation_commit` · `trigger_capture_id`） |
| `placement_id` または `individual_id` が open occupancy と不一致 | **旧 occupancy end** + **新 occupancy start**（`subject_ref = @individual/{individual_id}`） |
| 宣言が前回 commit と **同一** | **新イベントなし**（`source: unchanged` または devices 省略可） |
| 同一 placement に **別 role** の device（例: 温湿度 + ジャイロ） | role ごとに **独立 binding 区間**（同一 placement · 複数 open binding 可 — role をキーに） |

**解釈（ユーザー例）**: 「?/? 〜 今日 = device A · 今日から = device B」

```text
capture N-1  observed_at=T0  devices=[A]  →  binding A: [T0 … T1)
capture N    observed_at=T1  devices=[B]  →  end A @ T1 · start B @ T1
                                              binding B: [T1 … )
```

**implicit end**: 新観測が **異なる device** を宣言した時点で前 binding を閉じる — **ユーザーが end API を叩く必要なし**（主経路）。

### 3.4 単独 DeviceBinding API — 残すか？

| 方式 | 説明 | 判定 |
|------|------|------|
| **A. commit のみ** | 区間は capture 列から再構成 | **却下** — 観測なしの温度計交換 · poll のみ期間が説明不能 |
| **B. commit 派生 + 任意棚 API** | イベント正本は共通 · UX 主経路は commit | **採用** |
| **C. ADR-H-32 G1 のみ（棚 API 必須）** | 観測と binding が二重操作 | **UX 却下** — ユーザー vision と矛盾 |

**ver1 IMPL 優先**:

1. **P0**: commit → binding/occupancy **自動派生**（本 ADR）
2. **P1**: `POST .../device-binding/start|end` — **観測なし**の棚操作 · 補正用（civ-os `envShelfStore` salvage）
3. **P2**: `GET .../subjects/{ref}/environment` — 区間 JOIN 専用（ver2）

---

## 4. Append-only 観測連鎖

### 4.1 エンティティ関係

```text
individual (ind_*)
    │
    ├── capture (cap_*) ──measurement──▶ measurement rows (縦持ち)
    │       │
    │       ├── prior_capture_id? ──▶ 前回 cap_*
    │       ├── observation_context { placement_id, devices[], env_snapshot? }
    │       └── entry_mode: qr | continue | manual | ...
    │
    └── subject_ref ◀── Occupancy 区間（@individual/{id}）
```

| 概念 | INSERT ONLY | キー例 |
|------|-------------|--------|
| **Capture** | 新規のみ | `capture/capture/{capture_id}` |
| **Measurement** | 新規のみ | `capture/measurement/{measurement_id}` |
| **DeviceBinding 派生** | start/end イベント | `placement/.../device_binding/ev_*.json` |
| **Occupancy 派生** | start/end イベント | `placement/.../occupancy/ev_*.json` |

**禁止**: 同一 capture の上書き · binding 行の UPDATE · 「最新だけ残す」削除。

### 4.2 `prior_capture_id` / `subjectRef`

| フィールド | 規約 |
|------------|------|
| `prior_capture_id` | 同一 `individual_id` · 同一 actor · **時系列直前**の capture（サーバ検証 · 不一致は 400） |
| `subject_ref` | **`@individual/{individual_id}`** を ver1 正本（ADR-H-32 G2 具体化） |
| `entry_mode` | `qr` · `continue` · `manual` · `photo_ai` 等 — OBS-SOL-07 整合 |

---

## 5. フォローアップフロー

### 5.1 QR → 観測を続ける

```text
[個体 QR スキャン]
        │
        ▼
GET individual + latest capture summary
        │
        ├── entry_mode=qr
        ├── prior_capture_id = latest.capture_id
        ├── stage/計測プリフィル（上書き自由 · OBS-QR-03）
        └── placement/devices プリフィル = latest.observation_context
        │
        ▼
[入力 confirm] ──POST commit──▶ 新 capture INSERT
                                      │
                                      └── binding/occupancy 派生（§3.3）
```

### 5.2 「観測を続ける」ボタン（同一 UI · entry_mode=continue）

- 個体詳細 · 前回 capture 詳細から **同一フロー**（QR なし）
- `prior_capture_id` 必須 · **新 capture** のみ作成

### 5.3 次回観測スケジュール — ユーザー指定 · テンプレ interval（2026-06-21 改訂）

> **旧案廃止**: 「約 2 ヶ月ヘルスチェック」/`follow_up_policy.default_interval_days: 60` の **固定 nudge** は採用しない。  
> **正本要件**: [`05-観測.md`](../../01-要件/05-観測.md) §4.17 · OBS-FUP-09/11 · OBS-TPL-22/23

| 層 | ver1 | ver2 |
|----|------|------|
| **データ** | `next_observation_at` on commit + **`observation_schedule.scheduled` INSERT** | 同左 |
| **プリフィル** | 計測テンプレ `follow_up_intervals_by_stage` / `default_follow_up_interval` | community 共有テンプレ |
| **入力 UI** | 観測入力ページ · 環境・設置の直後 · date picker（OBS-RX-UX-10） | — |
| **通知 UI** | ホーム **「今日の要約」** upcoming/overdue（OBS-FUP-11） | Web Push / モバイル（オプトイン） |
| **禁止** | ハードコード 60 日 timer · schedule の UPDATE/DELETE | — |

**イベント例**（append-only）:

```yaml
observation_schedule.scheduled:
  individual_id: ind_…
  set_by_capture_id: cap_…
  prior_capture_id: cap_prev_…   # optional
  scheduled_at: 2026-07-21
  source: user | template_default
  template_id: tpl_…             # when template_default
  stage_at_set: L2
  interval_applied: { unit: month, value: 1 }
```

**根拠**: 種・段階・飼育方針で適切間隔が **ユーザー固有** — システムが一律 2 ヶ月を押し付けない。テンプレは **既定ルーティンの再利用** のみ。

---

## 6. タイムスタンプと環境取得

### 6.1 `observed_at` 意味論

| 項目 | 規約 |
|------|------|
| **正本** | サーバが commit 受理時に付与する `capture_timestamp`（UTC ISO8601） |
| **区間境界** | DeviceBinding / Occupancy の `started_at` / `ended_at` = **`observed_at`**（ユーザーが未来日時を送れない） |
| **テレメトリ参照** | `observed_at` に最も近い **過去** Tier B バケット（[`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) · 5 分 floor） |

### 6.2 観測瞬間の env — poll OR manual

| 経路 | 動作 | ADR |
|------|------|-----|
| **registry_poll** | `include_env_measurements: true` → 最新 ingest バケット → measurement 行 + 任意 snapshot | ADR-H-30 §10 経路 C |
| **manual_entry** | ユーザー入力 → `environment_snapshot` + `measurement_method=manual_entry` | ADR-H-30 §10 経路 B |
| **snapshot のみ** | 「温湿度スナップショット同梱」checkbox — **点** · binding 区間とは独立 | ADR-H-32 §5.1 |

**禁止**: commit 時の **サーバ secret による SwitchBot live fetch**（ADR-H-30 §2.2）。

---

## 7. チャート・期間クエリモデル

### 7.1 「どの device データがどの期間に効くか」

**正本クエリ**（概念 SQL）:

```text
有効区間(subject, device, role) =
  Occupancy(subject_ref, placement_id, [startAt, endAt))
  ∩ DeviceBinding(device_id, placement_id, role, [startedAt, endedAt))

テレメトリ行(row) が subject S に属する ⇔
  row.device_id = device_id
  AND row.bucket_time ∈ 有効区間(S, device, role)
  AND row.placement_id = placement_id  （または binding から解決）
```

### 7.2 API 段階

| ver | API | 用途 |
|-----|-----|------|
| **ver1** | `GET /api/individuals/{id}/captures` + `GET /api/env/history` | クライアント側 JOIN · 監査 |
| **ver1** | capture 応答に `derived_bindings[]` スナップショット（読取専用） | UI 説明「この観測時の device」 |
| **ver2** | `GET /api/env/subjects/{subjectRef}/telemetry?from=&to=&role=` | サーバ JOIN · チャート正本 |

### 7.3 計測チャートとの整合

- **個体の体長等**: capture / measurement 時系列（subject = individual）
- **環境温湿度**: Tier B telemetry × **§7.1 区間** — capture 点の snapshot は **補助マーカー**（gap 期間の補間禁止 · imputed は別 event）

---

## 8. UI 配置（ADR-H-32 §5.1 継承）

```text
┌─ 個体命名 / individual ─────────────────┐
├─ 【環境・設置】← 本 ADR の宣言 UI ────────┤
│    Placement（棚） DD / QR               │
│    設置開始日（終了日なし · 次回観測で暗黙終了）│
│    Devices[]（温湿度 · ジャイロ …）       │
│    □ 温湿度スナップショット同梱（点のみ）  │
│    source = 内部タグ · UI は読取専用バッジ  │
├─ 【次回観測】← §5.3 · OBS-RX-UX-10 ──────┤
│    次回観測日 date picker（テンプレプリフィル）│
├─ 計測行 Card …                           │
│    （IoT 行は devices[] をデフォルト引用） │
└─ confirm ──▶ commit ──▶ 派生 binding    ┘
     └─ 「次回: YYYY-MM-DD」読取サマリー
```

---

## 9. エンティティ / イベント一覧

| イベント / エンティティ | Tier | トリガー | 主要フィールド |
|-------------------------|------|----------|----------------|
| `capture.committed` | A | 観測 commit | `capture_id`, `individual_id`, `observed_at`, `prior_capture_id?`, `entry_mode`, `next_observation_at?` |
| `observation_schedule.scheduled` | A | commit 内 `next_observation_at` 設定時 | `individual_id`, `set_by_capture_id`, `prior_capture_id?`, `scheduled_at`, `source`, `template_id?`, `stage_at_set?` |
| `capture.measurement` | A | commit 内 rows | `measurement_name`, `value`, `device_id?`, `method` |
| `capture.photo_condition` | A | commit | 構造化撮影条件 |
| `observation.device_declared` | A | commit 内 `devices[]` | `device_id`, `role`, `source`（capture に埋込可） |
| `device.binding.started` | A | commit 派生 or 棚 API | `device_id`, `placement_id`, `role`, `started_at`, `trigger_capture_id?`, `source` |
| `device.binding.ended` | A | commit 派生 or 棚 API | `ended_at`, `start_event_id` |
| `occupancy.started` | A | commit 派生 or 棚 API | `subject_ref`, `placement_id`, `start_at` |
| `occupancy.ended` | A | commit 派生 or 棚 API | `end_at` |
| `telemetry.ingested` | B | collector / import | `device_id`, `bucket_start_unix`, 測定値 |
| `naming.name_event` | A | commit オプション | 表示名（既存） |

---

## 10. ver1 / ver2 境界

| 機能 | ver1 | ver2 |
|------|------|------|
| commit + `devices[]` + binding **自動派生** | **IN** | — |
| `prior_capture_id` 連鎖 | **IN** | — |
| QR / 「観測を続ける」 | **IN**（OBS-QR-*） | ネイティブ QR |
| 環境・設置チャンク | **IN** | — |
| 複数 device role（gyro 等） | **IN**（schema） | 計測テンプレ拡張 |
| 単独 DeviceBinding API | **P1 任意** | 棚管理 UI 強化 |
| 次回観測スケジュール + ホーム要約 | **IN**（OBS-FUP-09/11 · §5.3） | プッシュ通知 |
| サーバ JOIN telemetry API | **OUT** | §7.2 ver2 |
| IoT 計測行デバイス必須（OBS-INPUT-06/07） | **ver2 OUT 維持** → 本 ADR で **環境・設置チャンクに昇格** | — |

---

## 11. ADR-H-32 G1 からの移行

| ADR-H-32 | ADR-H-33 変更 |
|----------|---------------|
| G1 DeviceBinding API **P0 blocking** | **P0 = commit 派生** · 単独 API は **P1 任意** |
| 棚フローのみ binding | **観測 commit が主** · 棚は補助 |
| 単一 `device_id` on commit | **`devices[]` + role** |
| G5 JOIN API ver2 | 維持 |

**後方互換**: 既存 `device_id` · `placement_id` 単体フィールド → `devices[{ role: temp_humidity, device_id }]` へ **サーバ正規化**（breaking なし）。

---

## 12. トレードオフ（明示）

| 利点 | 代价 |
|------|------|
| UX 単一操作（観測 = 計測 + 設備宣言） | commit ハンドラの責務増（派生ロジック · テスト必須） |
| イベント正本維持 → telemetry JOIN 可能 | 「capture だけ」よりストレージ行数増 |
| implicit binding end → ユーザー end 不要 | 誤った device 選択が **即区間切替** — confirm 画面で **変更サマリー**必須 |
| ポリシー駆動 follow-up | ver1 は nudge なし — 運用はユーザー記憶 |

---

## 13. 推奨（Architectural verdict）

**採用**: **観測 commit = binding moment**（ユーザー vision と一致 · INSERT ONLY · ADR-env 4 概念と両立）。

**却下**: DeviceBinding を **観測から完全分離**した ADR-H-32 G1 のみの UX。

**実装順（設計ゲート後）**:

1. `ObservationCommitBody` に `devices[]` · `prior_capture_id` · `entry_mode`
2. `PlacementStore` に device_binding start/end + `get_open_binding(placement, role)`
3. commit 内 **derive_bindings_from_observation()** — Occupancy 同期
4. integration test: device A → 観測 → device B → 観測 → 区間 3 本 · telemetry フィルタ
5. P1: 棚専用 binding API（観測なし交換）

---

## 14. 参照

- [`ADR-H-32`](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md) — §6 本 ADR へ supersede 部分記載  
- [`ADR-H-30`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) §10  
- [`05-観測.md`](../../01-要件/05-観測.md) §4.15  
- [`Phase6-打鍵フィードバック-v1.md`](../Phase6-打鍵フィードバック-v1.md) §4.7  
- `civilization/ProjectRules.md` · `R2Engine.md` — INSERT ONLY  
- `libs/ihl/observation/solid_commit.py` · `tests/integration/test_observation_solid.py`

---

## 15. 既存要件との差分（2026-06-21 要約）

| 区分 | 内容 |
|------|------|
| **整合** | INSERT ONLY · 4 概念 · FR-ENV-06 単一 commit · ADR-H-30 secret 非保持 · QR/継続観測 · 「環境・設置」チャンク — §4.15 OBS-FUP で要件化済 |
| **簡素化** | DeviceBinding **単独 API = P1 任意**（旧 ADR-H-32 G1 P0）· **commit 自動派生 = P0** · implicit binding end |
| **新規** | `prior_capture_id` · `devices[]`+role · implicit end · **`observation_schedule`** · `next_observation_at` · テンプレ stage interval · `derived_bindings[]`（応答） |
| **矛盾要修正** | ~~§4.9.1 計測行 IoT=ver2 vs OBS-FUP commit 宣言=ver1~~ · ~~§4.14 MVP 境界~~ · ~~FR-ENV-02 409~~ · ~~`subjectRef`~~ — **2026-06-21 解消** → [`05-観測.md`](../../01-要件/05-観測.md) §4.16.6 · [ADR-H-34](./ADR-H-34-観測UX-研究データ-v1-DRAFT.md) |
| **未記載** | `trigger_capture_id` · confirm binding 変更サマリー · `GET .../captures` · `derive_bindings` TX 詳細 — **§4.16 OBS-RX-* で要件化済**（IMPL 待ち） |

**sync 完了（2026-06-21）**: `05-観測.md` §4.9.1.1/§4.14/§4.16/§4.17 · `Phase6` §4.7 · `13-データ取得元管理.md` §② · [ADR-H-34](./ADR-H-34-観測UX-研究データ-v1-DRAFT.md) — **設計ゲート #2–#5 v2.0 人間レビュー済（2026-06-21）** · 残: `derive_bindings` IMPL（G1）· ホーム summary API（#04）

---

*DRAFT v1 · 2026-06-21 · 設計のみ — IMPL は DELEGATED-IMPL-GO 後*
