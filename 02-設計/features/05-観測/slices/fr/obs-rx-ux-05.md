---
slice_id: 05-MICRO-fr-076
type: fr-1id
req_id: OBS-RX-UX-05
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-076 — OBS-RX-UX-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-05 · OBS-FUP-03 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

追記経路 — **QR**（`entry_mode=qr`）· **「観測を続ける」**（`entry_mode=continue`）· **前回サマリープリフィル** で自然に追記観測に入れること（OBS-FUP-03 · OBS-QR-03 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | QR payload · 個体 ID · 直前 capture サマリー · `prior_capture_id` 候補 |
| **Transform** | `entry_mode` 付与 · WorkflowContext プリフィル · **新 capture** 採番 |
| **OUT** | 観測入力 — 上書き自由サマリー表示 · UPDATE なし |

## 受入基準

1. QR スキャン → `entry_mode=qr` · 個体解決 · 入力（OBS-QR-03）。
2. 「観測を続ける」→ `entry_mode=continue` · `prior_capture_id` 自動候補（FUP-02）。
3. 前回サマリー表示 — フィールドは **上書き自由**（§4.16.2 表）。
4. UAT-05-10（planned）: OBS-MVP-01/02 と **3 req 束ね** — stage 時系列 playwright 未。
5. 毎回 **新 capture INSERT** — 同一 capture 編集 UI 禁止（UX-07）。

## In / Out 境界

| In | Out |
|----|-----|
| QR / continue 導線 | 新 capture draft |
| prior サマリー | `prior_capture_id` 連鎖 |
| — | 旧 capture UPDATE |
| — | QR 無しでの continue 不可（個体 ID 必須） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3 | QR/continue 遷移 |
| §9.1 | `entry_mode` · `prior_capture_id` |
| §10 | 追記 UX · draft プリフィル |
| FUP | [`obs-fup-03.md`](obs-fup-03.md) |

> ペア: [`obs-fup-02.md`](obs-fup-02.md) · [`obs-fup-03.md`](obs-fup-03.md) · OBS-QR-03 · OBS-MVP-*。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-05 |
| design_section | §3 QR/continue |
| test_case_id | UAT-05-10 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-10 — OBS-RX-UX-05 · OBS-MVP-01 · OBS-MVP-02（3 req 束ね · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | QR handler · continue CTA · サマリー panel |
| Draft | `entryMode` · `priorCaptureId` |
| API | 個体/capture 取得 · 新 ID 採番 |
| テスト | UAT-05-10 playwright **未** |

## gap 注記

- **planned**: 追記 UI/ draft 実装あり — stage 時系列 UAT と playwright 追加待ち。
- **FUP-03 束ね**: 機能（INSERT/chain）vs UX（導線/プリフィル）— slice 分離 · UAT 共有は正。
- **MVP 01/02**: stage 表示は本 FR の副次受入 — UAT-05-10 で一体検証予定。
