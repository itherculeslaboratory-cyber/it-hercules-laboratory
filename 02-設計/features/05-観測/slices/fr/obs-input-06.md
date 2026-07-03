---
slice_id: 05-MICRO-fr-102
type: fr-1id
req_id: OBS-INPUT-06
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-102 — OBS-INPUT-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-06 · §4.16.6 · RTM `status=deferred`
- **acceptance**: OBS-INPUT-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`IoT取得` 選択時は **実デバイス選択**を必須化し、未登録なら機器管理へ遷移できること。**ver2 OUT** — commit 時 device 宣言（OBS-FUP-04/06/08）とは **分離**（§4.16.6）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 計測行 `measurement_method=iot_switchbot` · 登録デバイス一覧 · ユーザー選択 |
| **Transform** | device_id 必須検証 · 未登録 → 機器管理遷移 · 未選択 → 保存拒否 |
| **OUT** | device_id 付き計測行 · または機器管理画面遷移 |

## 受入基準

1. IoT 選択 + device 未選択 → **保存不可**（§4.9.1 · ver2 OUT）。
2. `機器を追加/管理` 導線で #13 Placement/デバイス管理へ遷移。
3. UAT-05-07（deferred）: OBS-INPUT-06/07 と **10 req 束ね** — gap deferred（`revrtm-004`）。
4. **FUP-04 分離**: commit 時 `devices[]` 宣言 = **ver1 IN** — 計測行 IoT 必須 = **ver2 OUT**（ADR-H-33 §10）。
5. 手入力 method 選択時は device 不要 — method 写像は TPL-06/RX-REP-07。

## In / Out 境界

| In | Out |
|----|-----|
| IoT method 選択 | device_id 必須 |
| 未登録デバイス | 管理画面遷移 |
| — | ver1 で IoT 必須化 |
| — | commit devices[] 宣言の代替 |

## DET 参照

| 節 | 内容 |
|----|------|
| §4.16.6 | ver1/ver2 境界表 |
| §4.9.1.1 | 計測行 IoT vs commit 宣言 |
| ADR-H-33 §10 | 分離正本 |
| FUP-04 | commit device 宣言（ver1 IN） |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-input-07.md`](obs-input-07.md) · [`obs-env-02.md`](obs-env-02.md) · #13 Placement。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-06 |
| design_section | §4.16.6 ver2 OUT |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-07 — OBS-SOL-05 · OBS-TAX-02/03/05 · OBS-REP-01/02/06 · OBS-DRV-01 · OBS-INPUT-06/07 等 **10 req 束ね**（`revrtm-004` · gap deferred）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 計測行 IoT DD · 機器管理 Link |
| #13 | Placement/デバイス CRUD |
| API | telemetry JOIN（ver2） |
| テスト | UAT-05-07 review 待ち |

## gap 注記

- **deferred · ver2 OUT**: 2026-06-07 方針整合 — ver1 は手入力 + commit 宣言のみ。
- **FUP 交差**: 環境・設置チャンク device 宣言は **ver1 IN** — 混同禁止。
- **INPUT-07 ペア**: 定期取得デバイス選択も ver2 OUT — 同一 UAT 束ね。
