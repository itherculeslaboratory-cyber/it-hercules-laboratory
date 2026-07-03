---
slice_id: 05-MICRO-fr-001
type: fr-1id
req_id: OBS-SOL-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-001 — OBS-SOL-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-01 · RTM `status=existing`
- **acceptance**: OBS-SOL-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ユーザーが固体標本の **写真・計測・撮影条件・環境** を入力し、confirm 画面で **binding moment（確定登録）** まで完走できること。観測は文明 OS の中心 Input であり、本要件は **「入力から commit まで途切れない固体観測フロー」** を保証する。legacy ルート `/observation/solid` は IHL では `/observation/input` → confirm → commit API に読み替える。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー確定の種・段階・性別 · 計測行 · 撮影条件 · 任意 env snapshot · 写真 blob · draft メタ（`entryMode` · `priorCaptureId` 等） |
| **Transform** | Web draft 組立 → canonical digest 計算 → `commit_solid_observation` が capture/measurement/photo_condition/env イベントを **単一 TX 相当**で INSERT |
| **OUT** | 201 `{ status: "committed", sessionId, r2Key, captureId, clientContentDigest, … }` · event store に `cap_*` 永続 · 詳細 GET で Truth 縦持ち参照可能 |

## 受入基準

1. 入力 → 確認 → 「登録する」で **201 committed** が返る（空 rows は 400）。
2. commit 後 `GET /api/v1/observation/{capture_id}` で capture + measurements + photo_conditions が取得できる。
3. INSERT ONLY — 同一 capture_id 上書きなし（OBS-R2-01 整合）。
4. E2E / ST 系: `test_solid_commit_capture_persist` および固体 critical path が緑。
5. UI: 主要導線 **3 クリック以内**（OBS-NF-03 · screen-002/003 参照）。

## In / Out 境界

| In | Out |
|----|-----|
| 固体観測 Web フロー（input/confirm） | capture Truth イベント · commit 応答 |
| ユーザー確定メタ（種/計測/写真） | R2 truth key · sessionId 相当 ID |
| 任意 env chain / snapshot | — |
| — | embedding 生成 · LabelMe mm 換算（OBS-SOL-05 · #18 境界） |
| — | マーケット自動 fork · Twin 台本 |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.1 | 固体 commit · `post_solid_capture` / `commit_solid_observation` 実装マップ |
| §3.1 | `POST /api/captures` — capture 第 1 段 |
| §3.3.1 | commit body 拡張 · `clientContentDigest` canonical |
| §4 | 状態機械（capture → env chain 分岐） |
| §5 | component ITO（IN/Transform/OUT） |
| §10 | `ObservationInputPage` · `ObservationConfirmPage` · `observation-draft` |

> API path / body 詳細は **DET/slices/api** · **DET/slices/schema** へ委譲（層分離）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-01 |
| design_section | §3.1 §4 commit |
| test_case_id | UT-05-01 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-01 は OBS-SOL-01 · OBS-SOL-07 · OBS-QR-04 を束ねる（`revrtm-001-unit-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`post-api-captures.md`](../api/post-api-captures.md) |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) · [`solidcapturebody.md`](../schema/solidcapturebody.md) |
| Screen | [`observation-input.md`](../screens/observation-input.md) · [`observation-confirm.md`](../screens/observation-confirm.md) |
| Lib | `apps/api/routes/observation_solid.py` · `libs/solid_commit.py` |
| Web | `apps/web/src/app/observation/input/` · `observation-draft.ts` |

## gap 注記

- **parity**: legacy `/observation/solid` 単一路由名は IHL Web `/observation/input` に統合済（意図同等 · ルート名差は retrofit 注記のみ）。
- **R2 キー tree**: commit 応答 `r2Key` は IHL `truth/capture/...` 形式（OBS-SOL-02 と legacy `world/observation/solid/...` は別要件で追跡）。
- **LabelMe / ScreenDef ガイド**: OBS-SOL-05（gap）— 本 FR の commit 成功には非必須。
