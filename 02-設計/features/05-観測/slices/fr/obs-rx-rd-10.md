---
slice_id: 05-MICRO-fr-092
type: fr-1id
req_id: OBS-RX-RD-10
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-092 — OBS-RX-RD-10

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-10 · OBS-RX-RD-03 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-10 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`trigger_capture_id`** を binding/occupancy 派生イベントに記録し、**どの観測 commit が区間境界を切ったか**を監査可能にすること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `capture_id` · device 変更検知 · 派生イベント draft |
| **Transform** | started/ended イベントへ `trigger_capture_id=capture_id` 付与 · INSERT ONLY |
| **OUT** | binding/occupancy JSON — `trigger_capture_id` フィールド存在 |

## 受入基準

1. device 切替派生: started/ended イベントに `trigger_capture_id` = 境界を切った `capture_id`（§4.16.4）。
2. `source=unchanged` で派生なし → イベント自体が発行されない（RD-03 · FUP-05）。
3. UT-05-20（planned）: `test_binding_events_include_trigger_capture_id`（`revrtm-001`）。
4. §4.16.7 検証束 #3: device A→B 観測 — 3 区間すべてに trigger 追跡。
5. Occupancy 派生も同一 `trigger_capture_id` — binding のみでは不十分。

## In / Out 境界

| In | Out |
|----|-----|
| commit capture_id | 派生イベント trigger フィールド |
| device 変更 | 監査可能な境界追跡 |
| — | trigger なしの手動 binding |
| — | 後追い UPDATE で trigger 補完 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | 派生イベント JSON スキーマ |
| §9.1 | `trigger_capture_id` 定義 |
| RD-03 | derive_bindings 正本 |

> ペア: [`obs-rx-rd-03.md`](obs-rx-rd-03.md) · [`obs-fup-04.md`](obs-fup-04.md) · [`obs-fup-05.md`](obs-fup-05.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-10 |
| design_section | §9.3 trigger_capture_id |
| test_case_id | UT-05-20 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-20 — OBS-RX-RD-10（1 req · `revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `derive_bindings_from_observation()` |
| Event store | binding/occupancy INSERT |
| テスト | UT-05-20 retrofit 待ち |

## gap 注記

- **planned**: RD-03 派生ロジックにフィールド設計済 — **専用 UT 未緑**。
- **RD-03 分離**: 派生ロジック vs trigger 追跡 — slice 分離 · 同一 derive 関数。
- **監査**: R2 INSERT ONLY — trigger 欠落は **データ品質欠陥**として検出対象。
