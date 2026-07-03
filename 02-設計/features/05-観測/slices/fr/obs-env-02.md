---
slice_id: 05-MICRO-fr-010
type: fr-1id
req_id: OBS-ENV-02
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-010 — OBS-ENV-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-02 · RTM `status=existing`
- **acceptance**: OBS-ENV-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

SwitchBot（等）poller が環境サンプルを R2 **`env-samples/{YYYY-MM-DD}/{sampleId}.json` + index** に **INSERT ONLY** で蓄積し、観測 commit 時に **telemetry 参照**（temperature/humidity 2 行）として計測イベントに写像できること。precheck 5 分類・**秘密値非表示**（REQ-025 §3.2 · operating checklist）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー PC Docker poll / Export→Import · device registry · `include_env_measurements=true` + `device_id` |
| **Transform** | `resolve_device_telemetry` → `write_iot_switchbot_measurements`（2 行 · method=iot_switchbot · origin=environment_derived） |
| **OUT** | capture 201 + measurements 2 行 · `telemetry_bucket` 参照 · env-samples index 追記 |

## 受入基準

1. `POST /api/captures` or commit で `include_env_measurements=true` + 有効 `device_id` → temp/humidity 2 行 INSERT。
2. device 不在 **404** · telemetry 不在 **404** `TELEMETRY_NOT_FOUND` · 空 readings **400**。
3. 応答/ログに SwitchBot token 等 **秘密を含まない**（OBS-NF-02）。
4. IT-05-02: `test_solid_commit_iot_switchbot_env_chain` 緑。
5. precheck 5 分類（operating checklist）が運用 doc と一致。

## In / Out 境界

| In | Out |
|----|-----|
| R2 env-samples JSON · index | iot_switchbot measurement 2 行 |
| device registry 行 | telemetry_bucket 参照（値のみ） |
| — | IHL サーバ secret poll（ADR-H-30 禁止） |
| — | Placement マスタ CRUD（#13） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | env chain · method→origin 写像 |
| §3.1 | `include_env_measurements` 分岐 |
| §4 | 状態機械 env chain 枝 |
| §6 | 秘密非表示 |
| §7.1 | `test_solid_commit_iot_switchbot_env_chain` |

> measurements 経路は [`post-api-measurements.md`](../api/post-api-measurements.md) · [`solidmeasurementsbody.md`](../schema/solidmeasurementsbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-02 |
| design_section | §2.2 §3.1 telemetry |
| test_case_id | IT-05-02 |
| test_layer | integration |
| automation | pytest |
| status | **existing** |

逆 RTM: IT-05-02 — OBS-ENV-01 と共有（integration 層）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-captures.md`](../api/post-api-captures.md) · [`post-api-measurements.md`](../api/post-api-measurements.md) |
| Schema | [`solidcapturebody.md`](../schema/solidcapturebody.md) · [`solidmeasurementsbody.md`](../schema/solidmeasurementsbody.md) |
| Lib | `libs/solid_commit.py` `resolve_device_telemetry` · `write_iot_switchbot_measurements` |
| 運用 | `solid-switchbot-operating-checklist.md` · ADR-H-30/31 |

## gap 注記

- **運用 v1 凍結**: poll は **ユーザー PC Docker** + たまに Import — 本番 R2 実機確認は OBS-NF-09 **human gate**。
- **INPUT-06/07**: 計測行 IoT 必須 UI は UAT-05-07 gap 束ね — API chain は existing。
- **#13 境界**: telemetry ingest 正本はデータ取得元管理 — #05 は **参照写像のみ**。
