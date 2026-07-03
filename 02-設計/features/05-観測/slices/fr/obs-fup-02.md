---
slice_id: 05-MICRO-fr-062
type: fr-1id
req_id: OBS-FUP-02
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-062 — OBS-FUP-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-02 · RTM `status=planned`
- **acceptance**: OBS-FUP-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`prior_capture_id` で同一 `individual_id` 内の観測連鎖を記録し、フォローアップ時系列を復元できること。直前 capture 参照 · **自他拒否** · OBS-SOL-08 と同一契約。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 直前 `cap_*` · 同一 individual 文脈 · continue/QR 経路 draft |
| **Transform** | prior 存在/individual 一致/自己参照検証 → capture イベントにリンク |
| **OUT** | `prior_capture_id` 永続 · 時系列 GET · 拒否時 400 |

## 受入基準

1. 有効 prior + 同一 individual → commit **201** · `prior_capture_id` 保存。
2. prior 不在 → **400** `PRIOR_CAPTURE_NOT_FOUND`。
3. prior の individual 不一致 → **400** `PRIOR_CAPTURE_INDIVIDUAL_MISMATCH`。
4. 他人 actor の capture を prior 指定 → 拒否（自他拒否）。
5. UT-05-13（planned）: prior 連鎖 unit — **専用 pytest 未命名**（orphan-impl）。

## In / Out 境界

| In | Out |
|----|-----|
| prior capture ID · individual | 連鎖リンク · schedule `prior_capture_id` |
| 続けて観測 UI | `GET …/captures` 時系列 |
| — | 血統 FN 連鎖（lineage 別） |
| — | prior 無しでの強制連鎖 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `prior_capture_id` on commit · G2 **done** |
| §9.4 | schedule イベント prior 連鎖 |
| §9.7 | individual captures 時系列降順 |

> ペア: [`obs-sol-08.md`](obs-sol-08.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-02 |
| design_section | §9.1 prior_capture_id |
| test_case_id | UT-05-13 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-13 — OBS-FUP-02 のみ（`revrtm-001` · planned · orphan-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | commit `prior_capture_id` 検証 |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| Web | `observation-draft.ts` `priorCaptureId` |
| Lib | `commit_solid_observation` 検証ブロック |

## gap 注記

- **planned · orphan-impl**: API 実装 done 相当 — UT-05-13 命名 pytest 追加待ち。
- **SOL-08 整合**: tier-a gap は UAT 表記 — 本 FR は ver1 IN 連鎖契約。
