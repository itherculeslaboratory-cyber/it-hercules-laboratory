---
slice_id: 05-MICRO-fr-097
type: fr-1id
req_id: OBS-INPUT-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-097 — OBS-INPUT-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9.1 OBS-INPUT-01 · §⑪.2 · RTM `status=existing`
- **acceptance**: OBS-INPUT-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

発育フェーズ候補を **初令 / 2令 / 3令初期 / 3令後期 / 前蛹 / 蛹 / 生体** から選択でき、`stage_name` + `larva_subtype` + 任意 `phase_label` に正規化保存すること（**ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | フェーズ DD 候補 · ユーザー選択 · WorkflowContext プリフィル |
| **Transform** | enum 正規化 → `stage_name` · `larva_subtype` · 任意 `phase_label` |
| **OUT** | commit capture — 正規化済み stage フィールド · セッション一覧チップ |

## 受入基準

1. DD で全候補表示 — 初令〜生体 7 区分（§4.9.1 · §⑪.2）。
2. 保存: `stage_name` + `larva_subtype` + 任意 `phase_label`（OBS-MVP-01/02 整合）。
3. UAT-05-15（existing）: INPUT-01〜05 · PHOTO-01 · TPL-18/19 等 **10 req 束ね**（`revrtm-004`）。
4. 前回 `stage_name` プリフィル — 上書き自由（OBS-MVP-02 · QR-03/05）。
5. 令（instar）は **05ctx ではなく 05i 入力側**（ADR-H-16 §6）。

## In / Out 境界

| In | Out |
|----|-----|
| フェーズ DD 選択 | 正規 stage フィールド |
| 前回セッション | プリフィル値 |
| — | 自由テキスト stage のみ保存 |
| — | 対象選択（05ctx）での stage 確定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | 入力 UI フェーズ DD |
| §⑪.2 | stage_name enum |
| UI | [`入力UI設計-v1.md`](../../ui/入力UI設計-v1.md) |
| CTX | [`obs-ctx-01.md`](obs-ctx-01.md) |

> ペア: [`obs-mvp-01.md`](obs-mvp-01.md) · [`obs-mvp-02.md`](obs-mvp-02.md) · [`obs-tpl-23.md`](obs-tpl-23.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-INPUT-01 |
| design_section | §10 フェーズDD |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-RX-RD-04 · OBS-RX-REP-04 · OBS-TPL-18/19 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 入力画面フェーズ DD · チップ表示 |
| API | commit `stage_name` · `larva_subtype` |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | UAT-05-15 · ver2_uat_seed pytest |

## gap 注記

- **existing**: UI 実装済 — UAT-05-15 は **10 req 束ね** acceptance。
- **TPL-23 連携**: stage 一致時テンプレ interval プリフィル — 別 FR。
- **enum 拡張**: 新 stage 追加は §⑪.2 + 辞書同時更新必須。
