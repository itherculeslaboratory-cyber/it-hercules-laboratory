---
slice_id: 05-MICRO-fr-084
type: fr-1id
req_id: OBS-RX-RD-02
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-084 — OBS-RX-RD-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-02 · OBS-FUP-01 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`observed_at`**（計測・区間境界の意味時刻）と **`committed_at`**（サーバ受理時刻）を **分離保存**すること。`observed_at` = ユーザー/撮影の意味時刻 · `committed_at` = サーバ付与（INSERT 時）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー入力観測日時 · `capture_timestamp` · サーバ受信時刻 |
| **Transform** | `observed_at` 正規化（ISO8601）· `committed_at` サーバ採番 · 混同禁止 |
| **OUT** | capture レコード両フィールド保存 · binding 境界 = `observed_at` |

## 受入基準

1. `observed_at` は commit body から抽出 · 未指定時は `capture_timestamp` フォールバック（§9.1）。
2. `committed_at` は **クライアント送信不可** — サーバのみ付与（UPDATE 禁止 · FUP-01）。
3. binding 派生区間境界は **`observed_at`** を使用（RD-03 · FUP-05 整合）。
4. UT-05-19（planned）: OBS-GAP-02 と **2 req 束ね** — vitest 無 · pytest 代理（`revrtm-001`）。
5. reanalysis-manifest に両時刻が含まれる（RD-06 最小メタ）。

## In / Out 境界

| In | Out |
|----|-----|
| ユーザー観測日時 | `observed_at` 保存 |
| サーバ受理 | `committed_at` 自動付与 |
| — | 両者の同一値上書き |
| — | クライアント `committed_at` 指定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `observed_at` · `committed_at` 分離 |
| §9.3 | 区間境界 = `observed_at` |
| §3.3 | reanalysis-manifest 時刻フィールド |
| FUP-01 | INSERT ONLY · サーバ採番 |

> ペア: [`obs-fup-01.md`](obs-fup-01.md) · [`obs-fup-05.md`](obs-fup-05.md) · [`obs-rx-rd-06.md`](obs-rx-rd-06.md) · OBS-GAP-02。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-02 |
| design_section | §9.1 observed_at |
| test_case_id | UT-05-19 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-19 — OBS-RX-RD-02 · OBS-GAP-02（2 req 束ね · `revrtm-001` · vitest 未 · pytest 代理）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | capture INSERT · 時刻正規化 |
| API | commit 応答 `observed_at` · `committed_at` |
| テスト | pytest 代理のみ · **vitest gap**（GAP-VITEST-01） |

## gap 注記

- **planned · gap-vitest**: 時刻分離の frontend vitest **未** — UT-05-19 は pytest 代理維持。
- **FUP-05 依存**: binding 暗黙終了の境界時刻 = `observed_at` — 本 FR は **保存契約**のみ。
- **GAP-02 束ね**: AuthenticatedImage 等と RTM 共有 — 要件 ID は slice で分離 · TC は共有正。
