---
slice_id: 05-MICRO-fr-015
type: fr-1id
req_id: OBS-DIG-01
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-015 — OBS-DIG-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.3 OBS-DIG-01 · RTM `status=deferred`
- **acceptance**: OBS-DIG-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測ホームから **固体・デジタル・環境** を **3〜5 チャンク** で分離表示し、ユーザーが経路を迷わず選べること（REQ-024 UX · OBS-NF-03）。legacy `ObservationHubPage.tsx` は salvage 参照 — IHL v1 は `/observation` 検索ホーム + 入力導線が **固体中心**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 観測フィーチャ入口 · ユーザーコンテキスト（固体/デジタル/環境） |
| **Transform** | ホーム UI が chunk 単位で経路を分割 · 各 chunk 1 主ボタン |
| **OUT** | `/observation/input`（固体）· `/observation/digital`（deferred）· 環境チャンク（入力内 EnvironmentPlacementCard） |

## 受入基準

1. 情報設計が **3〜5 チャンク**（固体 / デジタル / 環境 / 検索 / テンプレ等）。
2. 主要導線 **3 クリック以内**（OBS-NF-03）。
3. **deferred**: legacy 3 分岐ホーム相当の IHL 専用 Hub ページは **未再実装** — `/observation` は Scope A 検索が主。
4. `UAT-05-01`（review）: 色補正なし等 OBS-SOL-06/08 と **束ね UAT** — DIG 単体 acceptance は延期。
5. `no-user-facing-unimplemented` 遵守 — 「未実装」語をユーザー UI に出さない。

## In / Out 境界

| In | Out |
|----|-----|
| 観測フィーチャナビ設計 | chunk 分離 UI |
| preferences §A 3 クリック | 各経路 CTA |
| — | デジタル ScreenDef 本体（OBS-DIG-02 deferred） |
| — | 固体 commit 契約（OBS-SOL-01 existing） |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 | デジタル観測は固体代替でない |
| §10 | Web ルート一覧 · observation/input |
| §6 | 3 クリック · OBS-NF-03 |

> 現行ホーム: [`observation.md`](../screens/observation.md) — 検索 list · 計測入力 secondary。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-DIG-01 |
| design_section | §1.2 観測ホーム |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-01 は OBS-DIG-01/02（deferred）· OBS-SOL-06/08 · OBS-NF-05 等を束ねる（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Screen | [`observation.md`](../screens/observation.md) · [`observation-input.md`](../screens/observation-input.md) |
| Web | `apps/web/src/app/observation/page.tsx` |
| Salvage | civilization-os `ObservationHubPage.tsx`（3 chunk 参照） |
| UX | REQ-024 · `ui-reference/preferences.md` §A |

## gap 注記

- **deferred 明示**: IHL v1 は **固体 + 検索** が in-scope — 3 分岐専用 Hub は ver2 UI 再設計待ち。
- **代替導線**: 計測入力（固体）· 文脈設定 · テンプレ — ホームヘッダから到達（screen-001 記載）。
- **UAT 粉飭禁止**: retrofit API 緑 ≠ DIG ホーム完成 — status deferred 維持。
