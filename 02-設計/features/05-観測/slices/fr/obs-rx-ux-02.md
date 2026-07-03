---
slice_id: 05-MICRO-fr-073
type: fr-1id
req_id: OBS-RX-UX-02
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-073 — OBS-RX-UX-02

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-02 · OBS-NF-03 · RTM `status=review`
- **acceptance**: OBS-RX-UX-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ホーム / QR / 個体詳細から **観測入力まで 3 クリック以内**（キーボード/タップ計測）で到達できる主要導線を保証すること（OBS-NF-03 と整合 · `preferences.md` §A）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 起点画面（`/` · QR スキャン · `/individuals/{id}`）· 認証済 session |
| **Transform** | 最短ルート遷移 — 中間 confirm 不要 · deep link `entry_mode` 付与 |
| **OUT** | `/observation/input?…` 到達 — **≤3 操作** |

## 受入基準

1. **ホーム → 観測入力**: today_lines タップ or 観測 CTA — ≤3（§4.16.2 表）。
2. **QR → 入力**: スキャン → 個体解決 → 入力 — ≤3（OBS-QR-* 整合）。
3. **個体詳細 → 入力**: 「観測を続ける」/ 新規観測 — ≤3。
4. UAT-05-13（review · **manual**）: Tier D 手打鍵計測 — AI `[x]` 禁止。
5. ST-05-06 / OBS-NF-03: 3 クリック system 層 review — 人手ゲート共有。

## In / Out 境界

| In | Out |
|----|-----|
| 主要 3 導線（ホーム/QR/個体） | deep link 付き観測入力 |
| キーボード Tab 到達可能 | ≤3 クリック主要 path |
| — | 4+ クリック必須の隠し導線 |
| — | 設定画面経由の迂回正本 |

## DET 参照

| 節 | 内容 |
|----|------|
| §1 | 3 クリック例（遷移設計-v2） |
| §4.16.2 | UX 目標 ↔ 自動化 |
| 遷移 | [`遷移設計-v2.md`](../../遷移設計-v2.md) OBS-NF-03 節 |
| preferences | `ui-reference/preferences.md` §A |

> ペア: [`obs-nf-03.md`](obs-nf-03.md) · UAT-05-13 manual · ST-05-06。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-02 |
| design_section | §1 3クリック |
| test_case_id | UAT-05-13 |
| test_layer | acceptance |
| automation | manual |
| status | **review** |

逆 RTM: UAT-05-13 — OBS-RX-UX-02（1 req · `revrtm-004` · **Tier D 人手**）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | ホーム cards · QR handler · individual detail CTA |
| 遷移 | `entry_mode` · query params |
| Route | `/observation/input` |
| テスト | UAT-05-13 manual — route-matrix / Tier D |

## gap 注記

- **review · manual 固定**: 機械 E2E 未 — **Tier D 手打鍵**が正本（`P2-NEXT-SHIP-MANUAL-KB` 候補）。
- **tier-a**: 3 クリック定義（何を 1 クリックと数えるか）は UX 判断 — 本 slice で確定。
- **NF-03 束ね**: system ST-05-06 と acceptance UAT-05-13 は **同一要件の層違い** — status 粉飭禁止。
