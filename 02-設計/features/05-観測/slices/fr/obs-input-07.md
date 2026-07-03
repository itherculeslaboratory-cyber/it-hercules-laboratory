---
slice_id: 05-MICRO-fr-103
type: fr-1id
req_id: OBS-INPUT-07
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-103 — OBS-INPUT-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-07 · §4.16.6 · RTM `status=deferred`
- **acceptance**: OBS-INPUT-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

定期取得（温湿度）有効時は **取得元デバイス**を選択でき、polling source の `device_id` を選択して保存できること。**ver2 OUT**（2026-06-07 方針整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 定期取得トグル ON · 登録デバイス一覧 · polling 設定 |
| **Transform** | `device_id` 選択必須 · polling source 保存 · commit 連携 |
| **OUT** | polling source `device_id` · 計測行 environment_derived 由来 |

## 受入基準

1. 定期取得 ON + device 未選択 → 保存不可（§4.9.1 · ver2 OUT）。
2. polling source の `device_id` が commit/measurement に残存。
3. UAT-05-07（deferred）: OBS-INPUT-06/07 と **10 req 束ね** — gap deferred（`revrtm-004`）。
4. **ver1 代替**: 手入力 + commit 時 env snapshot 点取得 — サーバ live poll は ADR-H-30 ver1 OUT。
5. `value_origin=environment_derived` 写像 — TPL-06/RX-REP-07 整合。

## In / Out 境界

| In | Out |
|----|-----|
| 定期取得 ON | polling device_id |
| デバイス DD | measurement 由来 |
| — | ver1 で polling 必須 |
| — | サーバ secret 常時 poll（ADR-H-30 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §4.16.6 | ver2 OUT 境界 |
| §4.14 | Phase2 フル統合 |
| ADR-H-30 | サーバ poll ver1 OUT |
| ENV | [`obs-env-02.md`](obs-env-02.md) |

> ペア: [`obs-input-06.md`](obs-input-06.md) · [`obs-env-02.md`](obs-env-02.md) · [`obs-tpl-06.md`](obs-tpl-06.md) · ADR-H-33 §7.2。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-07 |
| design_section | §4.16.6 ver2 OUT |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-07 — OBS-INPUT-06/07 等 **10 req 束ね**（`revrtm-004` · gap deferred）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 定期取得トグル · device DD |
| #13 | SwitchBot デバイス登録 |
| API | telemetry poll（ver2） |
| テスト | UAT-05-07 review 待ち |

## gap 注記

- **deferred · ver2 OUT**: polling UI/API は **未着手** — 要件 slice のみ確定。
- **INPUT-06 ペア**: 計測行 IoT 必須と定期取得 — 同一 ver2 境界。
- **FUP-11**: push 通知も ver2 OUT — schedule は ver1 IN（別 FR）。
