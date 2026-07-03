---
slice_id: 05-MICRO-fr-063
type: fr-1id
req_id: OBS-FUP-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-063 — OBS-FUP-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-03 · RTM `status=planned`
- **acceptance**: OBS-FUP-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

QR または「観測を続ける」から追記観測に入れ、**新 capture** + 前回サマリープリフィル + `entry_mode`（`qr` / `continue`）を記録すること。OBS-QR-* と整合。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | QR スキャン or continue CTA · 個体 ID · 直前 capture サマリー |
| **Transform** | draft プリフィル · `entry_mode` 設定 · `prior_capture_id` 候補 · 新 capture 入力へ遷移 |
| **OUT** | 追記観測フロー開始 · commit 時 `entry_mode` + 新 `capture_id` |

## 受入基準

1. QR 経路 → `entry_mode=qr` · individual 解決 · 新 capture（FUP-01）。
2. 「観測を続ける」→ `entry_mode=continue` · 前回計測/写真条件 **サマリープリフィル**（上書き可）。
3. `prior_capture_id` は continue/QR 時に **同一 individual 直前** を提案（FUP-02）。
4. UAT-05-09（planned）: QR/continue confirm — OBS-RX-UX-03/09 · OBS-QR-03 束ね。
5. manual 経路は `entry_mode=manual` — 本 FR スコープ外だが enum 共存。

## In / Out 境界

| In | Out |
|----|-----|
| QR コード · continue 導線 | 追記観測入力 |
| 前回 capture サマリー | draft プリフィル |
| — | 同一 capture UPDATE |
| — | QR 発行 CRUD（OBS-QR-01 別） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `entry_mode` enum · OBS-SOL-07 |
| §10 | 追記 UX · OBS-RX-UX-05 |
| §7.1 | G2 `entry_mode` on commit **done** |

> ペア: [`obs-rx-ux-05.md`](obs-rx-ux-05.md)（fr-076）· QR 系 OBS-QR-03。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-03 |
| design_section | §0.1 QR/continue |
| test_case_id | UAT-05-09 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-09 — OBS-FUP-03 · OBS-RX-UX-03/09 · OBS-QR-03（4 req 束ね · `revrtm-004` · playwright 未追加）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | observation input · QR handler · continue CTA |
| API | commit `entry_mode` |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| テスト | UAT-05-09 playwright **未** |

## gap 注記

- **planned**: API `entry_mode` は done — E2E QR/continue 証跡が UAT-05-09 ブロッカー。
- **FUP-01 整合**: 追記も **必ず新 capture** — continue ≠ UPDATE。
