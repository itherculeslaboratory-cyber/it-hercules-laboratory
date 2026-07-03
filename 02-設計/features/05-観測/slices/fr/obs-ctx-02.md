---
slice_id: 05-MICRO-fr-051
type: fr-1id
req_id: OBS-CTX-02
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-051 — OBS-CTX-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.10 OBS-CTX-02 · RTM `status=deferred`
- **acceptance**: OBS-CTX-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

WorkflowContext（文脈バー）は **既定値（プリフィル）のみ** を提供し、観測の種・段階・対象の **確定値は入力画面（05i）でユーザーが明示確定** すること。コンテキスト変更だけでは **保存済み capture/commit を自動上書きしない**（OBS-SOL-04 · ADR-H-15 §2）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 文脈バー選択 · URL クエリ · localStorage/profile プリフィル |
| **Transform** | WorkflowContext → 各画面 DD/ヘッダ **非確定プリフィル** · commit 時は **入力 draft の確定値のみ** Truth 化 |
| **OUT** | プリフィル UI — **context からの auto-commit 禁止** |

## 受入基準

1. ADR-H-15 §2: 種族/段階の **Truth は入力確定** — context は候補提示に等しい。
2. 文脈を変えても **既存 capture の species/stage が UPDATE されない**（R2 INSERT ONLY 整合）。
3. UT-05-03（deferred 束ね）: `test_ut_05_03_species_user_confirmed_only` — CTX-02 断言含む。
4. OBS-CTX-01 との境界: 伝播（01）vs 確定境界（02）— 本 FR は後者のみ。
5. OBS-TAX-07 / OBS-TGT-09: 外部 ID 候補も context から確定しない。

## In / Out 境界

| In | Out |
|----|-----|
| WorkflowContext プリフィル | 入力画面 DD 初期値 |
| ユーザー入力確定 | capture/commit Truth |
| — | context 変更 → 既存レコード UPDATE |
| — | Driver/Context による species 自動確定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 | WorkflowContext 伝播 vs 確定 |
| §7 P4 | 既定値のみ |
| §10 | 入力 UI · draft 確定 |
| ADR-H-15 §2 | プリフィル ≠ 確定 |

> UI: [`ui/コンテキスト.md`](../ui/コンテキスト.md) · 入力: [`observation-input.md`](../screens/observation-input.md) · ペア: [`obs-ctx-01.md`](obs-ctx-01.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-CTX-02 |
| design_section | §7 P4 既定値 |
| test_case_id | UT-05-03 |
| test_layer | unit |
| automation | pytest |
| status | **deferred** |

逆 RTM: UT-05-03 — OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · OBS-TGT-09（planned/deferred 混在 · `revrtm-001`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| UI | 文脈ボトムシート · 入力 IndividualDataCard |
| Web | `WorkflowContext` hook · draft vs context 分離 |
| API | commit body = ユーザー確定のみ |
| ADR | ADR-H-15 §2 |
| テスト | UT-05-03 追加予定 |

## gap 注記

- **deferred**: 設計契約は確定 — **専用 UT 未緑**（UT-05-03 束ね）。
- **CTX-01 整合**: 伝播は OK · 本 FR は **確定境界** のみ — 粉飾で auto-commit と書かない。
- **SOL-04 ペア**: 同一挙動を unit/acceptance で二重断言 — RTM 意図どおり。
