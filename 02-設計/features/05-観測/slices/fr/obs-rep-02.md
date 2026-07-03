---
slice_id: 05-MICRO-fr-032
type: fr-1id
req_id: OBS-REP-02
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-032 — OBS-REP-02

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-02 · RTM `status=gap`
- **acceptance**: OBS-REP-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測再現性の **スケールシート** を `scale-sheet-template-v1.schema.json` + **印刷 SVG 単一レンダラ** で標準化し、撮影スケールの物理寸法を commit 前に検証可能にすること。civilization-os は **データ層・印刷は実装済み**、IHL は **未配線（gap）**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | スケールシート JSON（template v1）· 印刷用寸法パラメータ · 観測紙レイアウト |
| **Transform** | schema 検証 · SVG 単一レンダラで印刷物生成 · commit 前にスケール可視性チェック（civ-os） |
| **OUT** | 印刷 SVG · 検証済み template JSON · （IHL gap）manifest への scale メタ未反映 |

## 受入基準

1. `scale-sheet-template-v1.schema.json` が正本 — 単一レンダラ原則（`observation-reproducibility-roadmap.md`）。
2. civ-os: データ層 + 印刷 SVG **実装済み** — IHL repo には **同等 route/UI なし**。
3. UAT-05-07（gap）: OBS-REP-02 は BPCMS/REP-01 と **同束ね** — 受入 review まで gap。
4. OBS-RX-REP-02: データ層 IN · UI 統合 polish は ver2。
5. manifest `photo_condition_count` は ver1 最小 — スケールシート印刷連携は **deferred**。

## In / Out 境界

| In | Out |
|----|-----|
| scale-sheet template JSON | schema 検証結果 |
| 印刷パラメータ | SVG レンダラ出力（civ-os） |
| — | IHL capture への scale sheet 自動埋め込み |
| — | ScreenDef キャンバス統合（OBS-REP-07 backlog） |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P2 | スケールシート印刷 IHL 未配線 |
| §4.16.5 | OBS-RX-REP-02 データ層 IN |
| manifest | `photo_condition_count` 最小メタ |

> 正本: `observation-reproducibility-roadmap.md` · civ-os scale-sheet schema。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-02 |
| design_section | §7 P2 スケールシート |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-REP-01/02/06 等 gap 束ね（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| civ-os | `scale-sheet-template-v1.schema.json` · 印刷 SVG |
| IHL | —（gap） |
| 関連 FR | OBS-REP-01（BPCMS）· OBS-REP-07（キャンバス統合 backlog） |
| 将来 | IHL への SVG レンダラ port または civ-os 連携 |

## gap 注記

- **tier-a / gap**: 実装は civ-os 側に存在 — IHL MICRO スコープでは **設計追跡のみ**。
- **印刷 ≠ commit**: スケール可視は撮影条件の人手確認 — 自動 QC（OBS-REP-IHL-04）は Phase1 任意。
- **REP-01 ペア**: BPCMS strict とスケールシートは再現性セット — 両方 P2 gap。
