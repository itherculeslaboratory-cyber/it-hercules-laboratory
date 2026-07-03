---
slice_id: 05-MICRO-fr-094
type: fr-1id
req_id: OBS-RX-REP-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-094 — OBS-RX-REP-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.5 OBS-RX-REP-04 · OBS-PHOTO-01 · RTM `status=planned`
- **acceptance**: OBS-RX-REP-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

commit メタ — **`camera_body` · `lens_name` · `light_source_type` · 構造化撮影条件** を ver1 最小として capture schema 列に保存し、BPCMS 査読前の再現性メタを確保すること（OBS-REP-04 bundle とは **別 FR**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 撮影機材 DD · 構造化 `photo_conditions[]` · commit body |
| **Transform** | capture 列へメタマージ · manifest/reanalysis へ伝播 |
| **OUT** | capture JSON — 機材 3 列 + `photo_conditions[]` 構造化 |

## 受入基準

1. ver1 最小: `camera_body` · `lens_name` · `light_source_type` が capture に保存（§4.16.5）。
2. 撮影条件は OBS-PHOTO-01 構造化行 — 自由テキスト単独正本 **禁止**（RD-04 整合）。
3. UAT-05-15（planned）: INPUT-01〜05 · PHOTO-01 · TPL-18/19 等 **10 req 束ね**（`revrtm-004`）。
4. §4.16.7 検証束 #6: reanalysis-manifest が ver1 最小メタを返す（RD-06 交差）。
5. BPCMS strict 全フィールドは **ver2 OUT** — 本 FR は最小セットのみ。

## In / Out 境界

| In | Out |
|----|-----|
| 機材 DD 入力 | capture メタ列 |
| 構造化 photo_conditions | manifest 再現性行 |
| — | observation profile bundle（OBS-REP-04 · deferred） |
| — | BPCMS 査読級 B+（ver2 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | 撮影メタ最小フィールド |
| §4.16.5 | OBS-RX-REP-04 ver1 IN |
| PHOTO | [`obs-photo-01.md`](obs-photo-01.md) |
| Schema | [`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md) |

> ペア: [`obs-rx-rd-04.md`](obs-rx-rd-04.md) · [`obs-rx-rd-06.md`](obs-rx-rd-06.md) · [`obs-rep-04.md`](obs-rep-04.md)（bundle · 別 req）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-REP-04 |
| design_section | §9.1 撮影条件最小 |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-15 — OBS-RX-RD-04 · OBS-RX-REP-04 · OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing retrofit 緑 · planned 維持）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| Web | 撮影条件 StructuredRow · 機材 DD |
| API | commit validation · manifest |
| テスト | UAT-05-15 playwright |

## gap 注記

- **planned 維持**: 構造化 UI 実装あり — UAT-05-15 は **10 req 束ね** · 個別 FR 粉飭禁止。
- **REP-04 混同注意**: OBS-REP-04 = bundle v1 · OBS-RX-REP-04 = 撮影メタ最小 — req_id 別。
- **ver2 BPCMS**: 査読級メタは §4.16.8 人間判断 · 本 FR スコープ外。
