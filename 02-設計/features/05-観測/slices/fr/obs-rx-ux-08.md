---
slice_id: 05-MICRO-fr-079
type: fr-1id
req_id: OBS-RX-UX-08
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-079 — OBS-RX-UX-08

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-08 · DET G8 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

confirm に **binding 変更サマリー**（device/placement 変更時 — 「device A → B に変更」等）を表示し、誤選択による **即区間切替の安全弁** とすること。**ver2 IN** — v1 は環境・設置 **静的サマリー**のみ（`obs-chunk-periodic` · DET G8 defer）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 前回 binding/placement · 今回 draft `devices[]` · `placement_id` |
| **Transform** | v1: 静的設置サマリー · v2: `BindingChangeSummary` 差分計算 |
| **OUT** | confirm 読取ブロック — v1 **差分 arrow 無** · 代替導線明示 |

## 受入基準

1. **ver1（現行）**: 環境・設置 **静的サマリー** — device A→B **arrow 表示しない**（要件 §4.16.3 ver2 明記）。
2. **ver2（planned）**: placement/device 変更時 confirm に **差分 1 行** — UAT-05-11 playwright 未。
3. `no-user-facing-unimplemented`: v1 は **事実ベース**（設置サマリー表示）— 「未実装」文言禁止。
4. derive_bindings は v1 でも commit 時 **暗黙区間切替**（FUP-05）— UI 差分は ver2 で可視化。
5. Screen: [`observation-confirm.md`](../screens/observation-confirm.md) — ver2 defer 注記済。

## In / Out 境界

| In | Out |
|----|-----|
| v1 静的サマリー | confirm 読取表示 |
| v2 BindingChangeSummary | v1 で A→B 差分 arrow |
| — | binding 変更の confirm 無警告 commit |
| — | ユーザー向け「WIP/未実装」 |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | ver2 defer · `BindingChangeSummary` |
| §11 G8 | binding 差分サマリー **ver2 defer** |
| Screen | `observation-confirm.md` · OBS-RX-UX-08 |
| ADR-H-32 | 暗黙終了（FUP-05） |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-fup-05.md`](obs-fup-05.md) · UAT-05-11。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-08 |
| design_section | §4 bindingサマリー |
| test_case_id | UAT-05-11 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-11 — OBS-RX-UX-08（1 req · `revrtm-004` · **ver2 機能 · v1 defer 意図**）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | confirm 静的設置サマリー · `obs-chunk-periodic` |
| v2 | `BindingChangeSummary` コンポーネント（未） |
| Lib | 前回 vs 今回 binding diff（v2） |
| テスト | UAT-05-11 playwright **未** |

## gap 注記

- **planned · ver2 defer 意図**: RTM status=planned は **v2 差分 UI 待ち** — v1 静的サマリーで出荷可（G8）。
- **安全弁**: v1 は FUP-05 暗黙終了 + 静的表示 — **差分 arrow 無しは要件通り** · 粉飭禁止。
- **CONFIRM 編集**: 差分確認は v2 — v1 は **戻る** で env chunk 再編集（§4.17 C 部分採用）。
