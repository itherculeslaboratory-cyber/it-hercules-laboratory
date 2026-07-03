---
slice_id: 05-MICRO-fr-089
type: fr-1id
req_id: OBS-RX-RD-07
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-089 — OBS-RX-RD-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-07 · §4.16.6 · OBS-FUP-04 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`subject_ref` 正本** — `@individual/{individual_id}`（ver1）。`@annotation/{id}` は **legacy 互換のみ**。Occupancy 派生イベント検査で individual 正本を強制すること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `individual_id` · legacy `annotation_id`（読取のみ） |
| **Transform** | `subject_ref=@individual/{id}` 正規化 · 派生イベントへ伝播 |
| **OUT** | capture · binding · occupancy に individual 正本 — annotation は互換読取のみ |

## 受入基準

1. 新規 commit は `subject_ref=@individual/{individual_id}` 必須（§4.16.6）。
2. `@annotation/{id}` は **新規書込禁止** — 既存 READ 互換のみ。
3. Occupancy 派生: `subject_ref` が individual を指すこと（RD-03 派生検査）。
4. IT-05-07（planned）: OBS-FUP-08 · OBS-RX-RD-03 と **3 req 束ね** — switch テスト部分（`revrtm-002`）。
5. §4.16.7 検証束 #3: `subject_ref=@individual/…` integration 検査。

## In / Out 境界

| In | Out |
|----|-----|
| `individual_id` on commit | `subject_ref=@individual/…` |
| legacy annotation READ | 新規 `@annotation/` 書込 |
| — | annotation を正本とする新規 capture |
| — | subject_ref 省略 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | Occupancy 派生 · subject_ref |
| §4.16.6 | subject_ref 要件確定 |
| FUP-04 | commit + derived_bindings |
| 要件 | §4.16.8 人間ゲート — subject_ref 確定済 |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`obs-rx-rd-03.md`](obs-rx-rd-03.md) · [`obs-fup-08.md`](obs-fup-08.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-07 |
| design_section | §9.3 subject_ref |
| test_case_id | IT-05-07 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-07 — OBS-FUP-08 · OBS-RX-RD-03 · OBS-RX-RD-07（3 req 束ね · `revrtm-002` · 部分カバー）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `subject_ref` 正規化 |
| API | commit validation · derived events |
| テスト | IT-05-07 部分 — subject_ref 断言待ち |

## gap 注記

- **planned**: individual 正本は要件確定 — IT-05-07 で派生イベント subject_ref 完全断言待ち。
- **legacy 互換**: annotation READ のみ — 新規 UI は individual 必須。
- **RD-03 交差**: binding 派生と同一 IT — slice 分離 · TC 束ね正。
