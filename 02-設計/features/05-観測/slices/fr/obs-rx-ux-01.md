---
slice_id: 05-MICRO-fr-072
type: fr-1id
req_id: OBS-RX-UX-01
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-072 — OBS-RX-UX-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-01 · RTM `status=review`
- **acceptance**: OBS-RX-UX-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測入力画面を **3〜5 チャンク**（個体 · 環境・設置 · **次回観測** · 計測 · 写真/条件 · confirm）に分割し、「次回観測」は **コンパクト 1 Card** とすること。1 画面に **6 塊以上の独立 Card がない**（`preferences.md` §A）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 観測 draft · WorkflowContext プリフィル · テンプレ metadata |
| **Transform** | Card 群レイアウト — chunk 境界 = スキーマ境界 · 次回観測を独立巨大 Card にしない |
| **OUT** | `ObservationInputPage` — ≤5 データチャンク + confirm 遷移 |

## 受入基準

1. チャンク構成: 個体 → 環境・設置 → 次回観測 → 計測/個体データ → 写真 → confirm（§4.16.2 P5）。
2. **6+ 独立 Card 禁止** — 監査: screen slice · DOM `data-testid` chunk 数。
3. UAT-05-14（review/planned）: OBS-FUP-06 · OBS-RX-UX-04 と **3 req 束ね** — playwright 未。
4. UAT-05-13（manual/review）: 3 クリック導線は OBS-RX-UX-02 と分担 — Tier D 候補。
5. 実装済: `apps/web/.../observation/input/page.tsx` — chunk testid 整合（DET §10）。

## In / Out 境界

| In | Out |
|----|-----|
| 入力 UI Card 分割 | sessionStorage draft 境界 |
| preferences §A 3〜5 chunk | 1 画面 1 主ボタン（UX-03） |
| — | 6+ 独立 Card レイアウト |
| — | 計測/環境の二重入力 UI |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | `ObservationInputPage` · chunk 一覧 |
| §4.16.2 | P5 チャンク集約 |
| UI | [`ui/観測入力-v2.md`](../../ui/観測入力-v2.md) §2 |
| Screen | [`slices/screens/observation-input.md`](../screens/observation-input.md) |

> ペア: [`obs-fup-06.md`](obs-fup-06.md) · [`obs-rx-ux-04.md`](obs-rx-ux-04.md) · [`obs-rx-ux-10.md`](obs-rx-ux-10.md)（fr-081）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-01 |
| design_section | §10 5チャンク |
| test_case_id | UAT-05-14 |
| test_layer | acceptance |
| automation | manual |
| status | **review** |

逆 RTM: UAT-05-14 — OBS-FUP-06 · OBS-RX-UX-01 · OBS-RX-UX-04（3 req 束ね · `revrtm-004` · playwright planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `ObservationInputPage` · chunk Card 群 |
| Screen | `observation-input.md` · OBS-RX-UX-01 行 |
| Draft | `observation-draft.ts` chunk フィールド |
| テスト | UAT-05-14 playwright **未** · 実装 review |

## gap 注記

- **review**: UI chunk 実装あり — acceptance playwright と manual 3-click（UX-02）で **review 維持**。
- **tier-a 執筆**: チャンク数・配置は高性能判断領域 — Auto 下書き + tier-a 確定。
- **RX-UX-10 分離**: 次回日ピッカー詳細は fr-081 — 本 FR は **チャンク数/配置**のみ。
