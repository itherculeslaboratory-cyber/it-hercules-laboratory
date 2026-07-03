---
slice_id: 05-MICRO-fr-041
type: fr-1id
req_id: OBS-DRV-01
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-041 — OBS-DRV-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.7 OBS-DRV-01 · RTM `status=gap`
- **acceptance**: OBS-DRV-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**SwitchBot / n8n / device API / GBIF / Wikidata** 等の外部接続は **C-USB Driver IR** の adapter 対象とし、draft → 人間承認 → runtime 配線の **横断 Driver 契約** を固定すること（REQ-026 §4 · REQ-030）。観測ドメインの taxonomy 候補・IoT telemetry・自動化 webhook は **Driver 層** に集約し、commit Truth へ直結させない（OBS-TAX-02/03 · OBS-ENV-02 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 外部 API 仕様 · C-USB Driver draft IR · connector 設定 · ユーザー承認ゲート |
| **Transform** | Driver adapter 実装 · 候補/telemetry を **Candidate 型**で UI 提示 · **承認済みのみ** runtime 有効化 |
| **OUT** | 承認済み Driver 応答（候補リスト · telemetry 行）— **commit 確定値はユーザー経路** |

## 受入基準

1. REQ-026 §4: 全外部 Driver は **C-USB IR** 準拠 · draft→承認フロー必須。
2. OBS-TAX-02/03/05: GBIF/Wikidata/Question Driver は **本 FR 配下** — 現状 **runtime 未配線（gap）**。
3. SwitchBot telemetry は `from_device_telemetry` 経由（OBS-ENV-02）— Driver 本体は **#13 環境 IoT** と共有。
4. UAT-05-07（gap 束ね）: OBS-DRV-01 は **10 req 共有 TC**（`revrtm-004`）。
5. n8n/webhook は **Connector (X 層)** — commit 自動確定禁止（OBS-SOL-04 · OBS-TAX-07）。

## In / Out 境界

| In | Out |
|----|-----|
| C-USB Driver IR（draft） | 承認済み adapter 実装 |
| 外部 API 応答 | UI 候補 · telemetry 行 |
| — | Driver 出力を commit Truth に直書き |
| — | 承認なし runtime 有効化 |
| — | civ-os 二重 connector 実装 |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P1 | 全 Driver runtime gap |
| §3.9 | Wave B route 表 · connector 境界 |
| §2.2 | method→origin · telemetry 由来 |
| REQ-026 | Driver 横断要件 |
| REQ-030 | C-USB adapter 契約 |

> 正本: `01-要件/REQ-026.md` §4 · `civilization/C-USB.md` · `02-設計/_横断/connector/`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-DRV-01 |
| design_section | §7 P1 Driver |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-DRV-01 · OBS-TAX-02/03/05 · OBS-SOL-05 · OBS-REP-* · OBS-INPUT-06/07 等 **gap 束ね**（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 横断 | C-USB Driver IR · REQ-026 §3.2 |
| 観測 | OBS-TAX-02 `gbifClient` · OBS-TAX-03 Wikidata · OBS-ENV-02 SwitchBot |
| API | telemetry 経路のみ部分 existing — Driver 本体 gap |
| civ-os | SwitchBot 手入力正 · 自動計測は別 ADR |
| 将来 | `libs/connectors/*` · Driver 承認 UI |

## gap 注記

- **tier-a / gap**: 設計・要件正本のみ — **IHL runtime 未配線**（DET §7.2 P1）。
- **UAT-05-07**: 1 TC 多 req は逆 RTM 意図どおり — 粉飭禁止。
- **横断優先**: 個別 Driver（TAX-02 等）実装前に **OBS-DRV-01 承認フロー** を確定。
