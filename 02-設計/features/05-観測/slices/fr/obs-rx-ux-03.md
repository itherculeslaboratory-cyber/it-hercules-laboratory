---
slice_id: 05-MICRO-fr-074
type: fr-1id
req_id: OBS-RX-UX-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-074 — OBS-RX-UX-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-03 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

confirm 画面の **主ボタンは 1 つ**（「観測を確定」/ 実装「登録する」）— テンプレ保存等の副次 CTA は **secondary** とすること（`preferences.md` §A · U-A11Y-MIN 理由表示）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 確定前 draft サマリー · commit body プレビュー |
| **Transform** | primary 1 · secondary 配置 · 409/400 時理由表示 |
| **OUT** | `POST /api/solid-observation/commit` 201 · 詳細/capture へ遷移 |

## 受入基準

1. DOM: confirm 画面に **primary button 1 つのみ**（`data-testid` 監査）。
2. 副次: テンプレ保存 · 戻る編集 — `variant=secondary` / 視覚的従属。
3. UAT-05-09（planned）: OBS-FUP-03 · OBS-RX-UX-09 · OBS-QR-03 と **4 req 束ね** — playwright 未。
4. §4.16.2 P1: **1 操作 = 1 capture** — confirm = binding moment TX。
5. 409 競合: 主ボタン disabled + 理由 1 行（UX-09 連携）。

## In / Out 境界

| In | Out |
|----|-----|
| confirm ページ UI | solid commit 201 |
| 読取サマリー必須 | 副次 CTA secondary |
| — | confirm 上での計測編集（戻る経由のみ） |
| — | 複数 primary 並列 |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | `ObservationConfirmPage` |
| §4 | confirm 遷移 · 副次 CTA 表 |
| Screen | [`observation-confirm.md`](../screens/observation-confirm.md) |
| UI | [`ui/観測入力-v2.md`](../../ui/観測入力-v2.md) §3.5 |

> ペア: [`obs-fup-03.md`](obs-fup-03.md) · [`obs-rx-ux-09.md`](obs-rx-ux-09.md) · OBS-QR-03。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-03 |
| design_section | §4 confirm主ボタン |
| test_case_id | UAT-05-09 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-09 — OBS-FUP-03 · OBS-RX-UX-03 · OBS-RX-UX-09 · OBS-QR-03（4 req 束ね · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `ObservationConfirmPage` · primary/secondary |
| API | `POST /api/solid-observation/commit` |
| Screen | confirm screen-state |
| テスト | UAT-05-09 playwright **未追加** |

## gap 注記

- **planned**: UI 実装済 — playwright spec 0 件（GAP-UAT-01）。
- **文言**: 要件「観測を確定」vs 実装「登録する」— parity 許容 · UAT で統一監査可。
- **UX-08 分離**: binding **差分**サマリーは ver2 — v1 confirm は読取サマリーのみ。
