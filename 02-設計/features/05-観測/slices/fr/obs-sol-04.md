---
slice_id: 05-MICRO-fr-004
type: fr-1id
req_id: OBS-SOL-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-004 — OBS-SOL-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-04 · RTM `status=planned`
- **acceptance**: OBS-SOL-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測対象の **種・亜種（および性別・発育段階）** は OS が自動確定せず、**ユーザーが入力画面で明示確定** した値のみが capture/commit に永続されること。外部 Driver（GBIF 等）は **候補提示** に留め、commit 時点の draft 確定値が Truth となる（REQ-025 §7.3 · OBS-TAX-07 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー入力 `species` · `sex` · `stage_name` · `view_type` · 任意亜種/ラベル · WorkflowContext プリフィル（上書き確定はユーザー操作） |
| **Transform** | Pydantic 必須検証（species 空不可）· propose-species 等 AI 候補は **commit body に混ぜない** · canonical digest に確定値のみ |
| **OUT** | `capture/capture` イベントにユーザー確定値 INSERT · 検索 whitelist フィルタ可能 |

## 受入基準

1. `species` 未入力で commit → **400**（Pydantic / 入口検証）。
2. GBIF/Wikidata 候補 API があっても **commit species は UI 確定値** — 自動上書き無。
3. WorkflowContext 変更だけでは保存レコードが変わらない（OBS-CTX-02）。
4. UT-05-03（planned）: `test_ut_05_03_species_user_confirmed_only` 追加予定。
5. 検索 `POST /search` で species/sex/stage_name フィルタが確定値に一致。

## In / Out 境界

| In | Out |
|----|-----|
| ユーザー確定 taxonomy フィールド | capture イベント属性 |
| Context プリフィル（非確定） | — |
| Driver 候補（TaxonomyCandidate） | —（commit に混在禁止） |
| — | OS 側 species 推論 · 自動 taxonKey 確定 |
| — | 観測対象ナビゲータ自動確定（OBS-TGT · deferred） |

## DET 参照

| 節 | 内容 |
|----|------|
| §0 | 種・亜種確定は常にユーザー |
| §2.1 | capture フィールド規約 · §⑪.2 enum |
| §6 | 由来分離 · 検索安全 |
| §7.2 P6 | TaxonomyCandidate/UserConfirmed 型分離 gap |
| §10 | 入力 UI — IndividualDataCard · draft |

> フィールド型/default は [`solidcapturebody.md`](../schema/solidcapturebody.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-04 |
| design_section | §2.1 §6 ユーザー確定 |
| test_case_id | UT-05-03 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-03 は OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · OBS-TGT-09 を束ねる（deferred 含む）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`solidcapturebody.md`](../schema/solidcapturebody.md) · [`captureuploadrequest.md`](../schema/captureuploadrequest.md) |
| API | [`post-api-captures.md`](../api/post-api-captures.md) · [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| Lib | `write_solid_capture` · `observation-draft.ts` |

## gap 注記

- **RTM planned**: 専用 UT `UT-05-03` は **差分 TC 追加予定** — 実装は species 必須で既存緑だが型分離テスト未完。
- **TOT-OBS-01**: TaxonomyCandidate vs UserConfirmed の **型レベル分離** は IHL 簡略（§7.2 P6 gap）— 挙動は OBS-SOL-04 を満たすが schema 厳密分離は将来。
