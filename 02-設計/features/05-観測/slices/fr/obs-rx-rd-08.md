---
slice_id: 05-MICRO-fr-090
type: fr-1id
req_id: OBS-RX-RD-08
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-090 — OBS-RX-RD-08

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-08 · FR-ENV-02 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**FR-ENV-02 409 キー** — 同一 `(placement_id, device_id, role)` の **未終了 binding 重複**で 409 を返すこと（device 単体キーから拡張）。409 body に conflict key 3 要素を含める。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 新規 binding 開始要求 · 既存 open binding 一覧 |
| **Transform** | `(placement_id, device_id, role)` 重複検査 — 未終了があれば 409 |
| **OUT** | 409 body — `placement_id` · `device_id` · `role` 3 要素 + エラーカタログ detail |

## 受入基準

1. 同一 3 要素で open binding 存在 → **409 Conflict**（§4.16.7 検証束 #8）。
2. 409 body: conflict key 3 要素明示 — device 単体キーからの拡張（FR-ENV-02）。
3. ended binding 済みの同一 3 要素は **再開始可**（INSERT ONLY · 新区間）。
4. IT-05-08（planned）: 専用 IT **未分離** — `test_duplicate_display_name_blocked_per_owner` は **別軸**（`revrtm-002` · GAP-IT-02）。
5. エラーカタログ: `slices/errors/409` と detail 文字列一致（RX-UX-09 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| open binding 重複 | 409 + 3 要素 key |
| derive 暗黙終了後の再開始 | device 単体 409 のみ |
| — | 重複を黙認マージ |
| — | binding UPDATE で解消 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | binding 重複規則 |
| FR-ENV-02 | placement+device+role キー |
| エラー | [`slices/errors/409.md`](../errors/409.md) |
| §4.16.7 | 検証束 #8 |

> ペア: [`obs-env-02.md`](obs-env-02.md) · [`obs-rx-ux-09.md`](obs-rx-ux-09.md) · [`obs-rx-rd-03.md`](obs-rx-rd-03.md) · GAP-IT-02。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-08 |
| design_section | §9.3 409 key |
| test_case_id | IT-05-08 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-08 — OBS-RX-RD-08（1 req · `revrtm-002` · 409 binding 未分離 · gap-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | binding 重複検査 · 3 要素 key |
| API | 409 response body |
| テスト | IT-05-08 **未** · display_name 409 は別軸 |

## gap 注記

- **planned · gap-impl**: GAP-IT-02 — binding 409 vs display_name 409 の pytest 分離待ち。
- **FR-ENV-02**: #13 Placement 連携 — 本 FR は **観測派生 binding の重複規則**。
- **UX-09 交差**: 409 UI 表示は RX-UX-09 — 本 FR は **API 契約**のみ。
