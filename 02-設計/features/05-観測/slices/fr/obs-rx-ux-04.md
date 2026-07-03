---
slice_id: 05-MICRO-fr-075
type: fr-1id
req_id: OBS-RX-UX-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-075 — OBS-RX-UX-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-04 · OBS-FUP-06 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**「環境・設置」チャンク** — Placement DD · `devices[]` 複数 role · □温湿度スナップショット同梱 checkbox を **1 Card** に集約すること（OBS-FUP-06 · ADR-H-32 §5.1 · ADR-H-33 §8 · OBS-RX-ENV-02）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | placement 一覧 · device registry · 前回 context プリフィル |
| **Transform** | `EnvironmentPlacementCard` — DD + devices[] role + 設置開始日 · snapshot checkbox（写真なし経路） |
| **OUT** | draft `placementId` · `devices[]` · commit body マッピング |

## 受入基準

1. Placement ドロップダウン + `devices[]` 複数 role（temp_humidity · gyro 等 · FUP-08）。
2. **ingest 取得 UI は環境・設置に置かない**（OBS-RX-ENV-02）— snapshot checkbox は計測付近/別 Card。
3. 設置開始日のみ — **終了日 UI 禁止**（OBS-RX-ENV-01 · 暗黙終了は derive_bindings）。
4. UAT-05-14（planned）: OBS-FUP-06 · OBS-RX-UX-01 束ね — playwright 未。
5. ADR-H-32 §5.1: 個体命名 **直後** · 計測行 **直前**。

## In / Out 境界

| In | Out |
|----|-----|
| env chunk UI | commit `placement_id` · `devices[]` |
| 前回プリフィル | `placementStartedAt` |
| — | Placement マスタ CRUD（#13） |
| — | 環境・設置内 `/latest` poll UI（ENV-02 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | `EnvironmentPlacementCard` · `obs-env-placement-chunk` |
| §9.2 | `devices[]` 契約 |
| ADR-H-32 §5.1 | 配置順 |
| ADR-H-33 §8 | ver1 マスタ chunk |
| OBS-RX-ENV | §4.18.4 ENV-01〜02 |

> ペア: [`obs-fup-06.md`](obs-fup-06.md) · [`obs-rx-ux-01.md`](obs-rx-ux-01.md) · [`observation-input.md`](../screens/observation-input.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-04 |
| design_section | §10 env chunk |
| test_case_id | UAT-05-14 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-14 — OBS-FUP-06 · OBS-RX-UX-01 · OBS-RX-UX-04（3 req 束ね · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `EnvironmentPlacementCard` |
| Draft | `placementId` · `devices[]` · `placementStartedAt` |
| #13 | Placement マスタ API |
| テスト | UAT-05-14 playwright **未** |

## gap 注記

- **planned**: chunk 実装あり — B モデル（RX-ENV-02）で ingest UI 分離済みか screen 監査要。
- **FUP-06 重複**: 同一 UAT 束ね — 機能（配置順）vs UX（chunk UI）で slice 分離 · RTM 粉飭禁止。
- **INPUT-06/07**: 計測行 IoT 必須は ver2 OUT — 本 chunk は ver1 マスタのみ。
