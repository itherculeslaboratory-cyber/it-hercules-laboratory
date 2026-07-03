---
slice_id: 05-MICRO-fr-067
type: fr-1id
req_id: OBS-FUP-07
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-067 — OBS-FUP-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-07 · RTM `status=planned`
- **acceptance**: OBS-FUP-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測瞬間の env は **ingest 最新バケット（poll）** または **手入力 snapshot** とし、**サーバ secret live fetch 禁止**（ADR-H-30 §10）。`include_env_snapshot` / manual `environment_snapshot` で commit 同梱。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ingest 最新 telemetry · 手入力 temp/humidity · `include_env_snapshot` flag |
| **Transform** | `GET /api/env/devices/{id}/latest` Tier B 参照 or manual body · **サーバ SwitchBot poll 禁止** |
| **OUT** | commit 内 `environment_snapshot` · `source` バッジ read-only（ingest 時） |

## 受入基準

1. poll/ingest 経路: `source=ingest_snapshot|registry_poll` → 値 read-only · `captured_at` 併記。
2. 手入力: `source=manual_entry` → ユーザー編集可。
3. 写真あり観測 → **`environment_snapshot` commit しない** — 撮影時環境は `photo_conditions[]`（§9.5.1）。
4. IT-05-09（planned）: `test_commit_environment_snapshot_and_measurement_device_id` **部分**。
5. ADR-H-30: 応答/ログに SwitchBot token 等 **秘密非表示**（OBS-NF-02 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| R2 env-samples · Tier B latest | commit snapshot 行 |
| 手入力 snapshot | manual_entry 永続 |
| — | IHL サーバ secret live poll |
| — | 写真なし以外への snapshot 強制 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `include_env_snapshot` · `environment_snapshot` |
| §9.5.1 | B モデル UI 配置 · 写真あり分離 |
| §9.6 | snapshot フィールド契約 |
| ADR-H-30 §10 | サーバ fetch 禁止 |

> ペア: [`obs-env-02.md`](obs-env-02.md) · [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-07 |
| design_section | §9.1 env snapshot |
| test_case_id | IT-05-09 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-09 — OBS-FUP-07 のみ（`revrtm-002` · planned · 部分カバー）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | env latest Tier B · commit snapshot |
| Schema | [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md) |
| Web | `buildEnvironmentSnapshotCommitBody` |
| テスト | `test_commit_environment_snapshot_*`（部分） |

## gap 注記

- **planned**: integration 部分緑 — IT-05-09 として明示断言・写真あり分岐 E2E 待ち。
- **ENV-02 ペア**: telemetry 2 行写像は別 FR — 本 FR は **点 snapshot 同梱**。
