---
slice_id: 05-MICRO-fr-066
type: fr-1id
req_id: OBS-FUP-06
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-066 — OBS-FUP-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-06 · RTM `status=planned`
- **acceptance**: OBS-FUP-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

「環境・設置」チャンクを **個体命名の直後・計測行の直前**に配置し、Placement · Devices · 温湿度スナップショット checkbox を 1 チャンクに集約すること（ADR-H-32 §5.1 · ADR-H-33 §8）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 観測入力 draft · placement DD · `devices[]` 複数 role · env snapshot checkbox |
| **Transform** | 5 チャンク以内レイアウト · chunk 順序固定 · commit body へマッピング |
| **OUT** | UI 上「環境・設置」ブロック · FUP-04/07 フィールド入力完了 |

## 受入基準

1. チャンク順: 個体命名 → **環境・設置** → 計測行 → 写真条件 → confirm（§4.16.6）。
2. Placement ドロップダウン + `devices[]` 複数 role 入力（temp_humidity · gyro 等）。
3. □温湿度スナップショット同梱 checkbox — FUP-07 と連携。
4. UAT-05-14（planned）: env chunk UI — OBS-RX-UX-01/04 束ね · playwright。
5. 主ボタン 1 · 3 クリック以内（`ui-reference/preferences.md` · screen-state 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| 観測入力 UI chunk | commit `placement_id` · `devices[]` |
| ADR-H-32 配置順 | env snapshot checkbox 状態 |
| — | Placement マスタ編集（#13） |
| — | 計測行 IoT 必須 UI（INPUT-06/07 ver2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | env chunk · OBS-RX-UX-04 |
| §9.2 | devices[] 契約 |
| ADR-H-32 §5.1 | チャンク配置順 |
| ADR-H-33 §8 | 環境・設置 = ver1 マスタ |

> ペア: [`slices/screens/observation-input.md`](../screens/observation-input.md) · [`obs-rx-ux-04.md`](obs-rx-ux-04.md)（fr-075）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-06 |
| design_section | §10 env chunk UI |
| test_case_id | UAT-05-14 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-14 — OBS-FUP-06 · OBS-RX-UX-01/04（3 req 束ね · `revrtm-004` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | observation-input env chunk コンポーネント |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| Draft | `observation-draft.ts` placement/devices |
| テスト | UAT-05-14 playwright **未** |

## gap 注記

- **planned**: UI chunk 実装あり — acceptance playwright と OBS-RX-UX-01 束ね UAT 待ち。
- **INPUT-06/07 分離**: 計測行 IoT 必須は ver2 OUT — ver1 マスタは本チャンク。
