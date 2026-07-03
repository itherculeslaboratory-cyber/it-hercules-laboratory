---
slice_id: 05-MICRO-fr-008
type: fr-1id
req_id: OBS-SOL-08
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-008 — OBS-SOL-08

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-08 · RTM `status=gap`
- **acceptance**: OBS-SOL-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

同一個体の観測履歴を **`priorSessionId` / `prior_capture_id`** で連鎖し、時系列フォローアップを追跡できること。自セッション参照・他人セッション参照は **拒否** し、データ整合とプライバシーを守る（OBS-FUP-02 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 直前 capture ID · 同一 `individual_id` コンテキスト · 「続けて観測」draft |
| **Transform** | commit 前検証: prior 存在 · individual 一致 · 自己参照禁止 → capture イベントに `prior_capture_id` リンク |
| **OUT** | 個体 capture 時系列 · reanalysis-manifest `prior_capture_id` · 拒否時 400 |

## 受入基準

1. 有効 prior + 同一 individual → commit **201** · `prior_capture_id` 永続。
2. prior 不在 → **400** `PRIOR_CAPTURE_NOT_FOUND`。
3. prior の individual 不一致 → **400** `PRIOR_CAPTURE_INDIVIDUAL_MISMATCH`。
4. 他人 actor の capture を prior に指定 → 拒否（自他拒否 · 要件 Phase1 §commit）。
5. UAT-05-01（gap 束ね）: セッション連鎖 acceptance — **legacy `priorSessionId` 用語** は IHL `prior_capture_id` に読替済。

## In / Out 境界

| In | Out |
|----|-----|
| prior capture ID · individual 文脈 | 連鎖リンク · 時系列 GET |
| 続けて観測 UI | — |
| — | 血統 FN 本体（lineage 別 FeatureNode） |
| — | マーケット bundle 連鎖 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `prior_capture_id` on commit · G2 **done** |
| §3.3.1 | reanalysis-manifest · digest canonical |
| §9.7 | `GET /api/individuals/{id}/captures` 時系列 |
| §7.1 | commit 拡張実装マップ |

> エラー詳細は [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`400.md`](../errors/400.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-08 |
| design_section | §7 priorSession |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-01 — API 実装 done だが acceptance **gap** 表記（レビュー/UAT 未クローズ）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | commit `prior_capture_id` · errors 400 系 |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| Web | `observation-draft.ts` `priorCaptureId` · continue 導線 |
| Lib | `commit_solid_observation` 検証ブロック |

## gap 注記

- **RTM gap · tier-a**: **API/単体は existing 相当** — RTM は UAT acceptance 未緑のため `gap`。`priorSessionId`→`prior_capture_id` 用語移行の UAT クローズが残。
- **OBS-FUP-02**: ver1 IN — 同一 individual 内連鎖は本 FR と統合実装済。
- **Tier A**: 自他拒否の E2E 証跡（複数 actor seed）が UAT-05-01 ブロッカー。
