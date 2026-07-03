---
slice_id: 05-MICRO-fr-083
type: fr-1id
req_id: OBS-RX-RD-01
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-083 — OBS-RX-RD-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-01 · OBS-RX-ROW-09 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**全 measurement 行**に `source` enum を必須とし、データ出自を研究再現の正本に残すこと。欠落は **400**（commit JSON 検査）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `measurements[]` 各行 · UI 入力経路（手入力/IoT/CSV） |
| **Transform** | `source` enum 検証 — `manual_entry` \| `registry_poll` \| `switchbot_import` \| `csv_import` \| `imputed` |
| **OUT** | capture JSON 全行に `source` + `value_origin`（DET §9.6）· 欠落 → 400 |

## 受入基準

1. enum 5 値のみ受理 — 未知値は 400 + エラーカタログ。
2. 手入力行 → `manual_entry` · IoT 行 → `registry_poll` 等 UI 経路と一致（ROW-09）。
3. `imputed` は **別 event 扱い** — fact 行と混在禁止（RD-05 整合）。
4. UT-05-17（planned）: 専用 pytest **未** — orphan-impl（`revrtm-001`）。
5. Vitest: 全 measurement 行に `source` + `value_origin`（§4.16.7 検証束 #2）。

## In / Out 境界

| In | Out |
|----|-----|
| commit `measurements[]` | 各行 `source` enum |
| UI 入力経路マッピング | 欠落許容 |
| — | 自由テキストのみの出自記録 |
| — | `source` 省略時の黙認 default |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.6 | `source` enum · `value_origin` |
| §9.1 | `measurements[]` 行契約 |
| §4.18 | OBS-RX-ROW-09 device_id + source 写像 |
| エラー | [`エラーカタログ-v1.md`](../../エラーカタログ-v1.md) 400 |

> ペア: [`obs-rx-row-09.md`](obs-rx-row-09.md)（fr-106 近傍）· [`obs-rx-rd-05.md`](obs-rx-rd-05.md) · commit validation slice。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-01 |
| design_section | §9.6 source enum |
| test_case_id | UT-05-17 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-17 — OBS-RX-RD-01（1 req · `revrtm-001` · 専用 pytest 無 · orphan-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | commit JSON schema · `source` validator |
| API | POST capture 400 on missing source |
| Web | StructuredRow source バッジ（read-only 時） |
| テスト | UT-05-17 **未** · §4.16.7 Vitest 束ね planned |

## gap 注記

- **planned · orphan-impl**: 実装に source 写像あり — UT-05-17 命名・全 enum 断言待ち。
- **ROW-09 拡張**: 計測行 `device_id` 同梱は RD-01 と **同一 commit 契約** — slice 分離 · 検証共有可。
- **imputed 分離**: RD-05 と交差 — imputed 行は fact 集計から除外。
