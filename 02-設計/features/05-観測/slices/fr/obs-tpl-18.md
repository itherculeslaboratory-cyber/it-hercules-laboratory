---
slice_id: 05-MICRO-fr-105
type: fr-1id
req_id: OBS-TPL-18
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-105 — OBS-TPL-18

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-18 · 遷移設計 confirm · RTM `status=existing`
- **acceptance**: OBS-TPL-18 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**confirm 画面で「今回入力をテンプレ保存」**を実行でき、都度再入力を回避すること。保存後に `template_id` を返却し、次回 DD で選択可能（Phase6 打鍵 FB 2026-06-21 · **ver1 IN**）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | confirm 画面 draft 全量 · 「テンプレとして保存」CTA · actor セッション |
| **Transform** | `POST /api/v1/observation/templates` — 今回入力からテンプレ生成 · 201 |
| **OUT** | `template_id` 返却 · 次回 INPUT DD で選択可能 · LIST 反映 |

## 受入基準

1. `/observation/input/confirm` に **「テンプレとして保存」** CTA（§4.9 · 遷移設計 confirm）。
2. 保存成功 → `template_id` 返却 — 次回テンプレ DD で即選択可。
3. UAT-05-15（existing）: TPL-18 · INPUT-01〜05 · PHOTO-01 等 **10 req 束ね**（`revrtm-004`）。
4. `POST /api/v1/observation/templates` — 201 Created（api-015 slice · AUTH_REQUIRED WRITE）。
5. commit **前**にテンプレ保存可 — confirm 画面の副次 CTA（commit 主ボタンは別）。

## In / Out 境界

| In | Out |
|----|-----|
| confirm draft | 新テンプレ 201 |
| セッション actor | owner スコープ template |
| — | commit 後のみテンプレ化 |
| — | community fork（TPL-20 ver2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3 | POST templates |
| §10 | confirm 画面 CTA |
| 遷移 | `05-観測-入力-遷移設計-v1.md` confirm |
| API | [`post-api-v1-observation-templates.md`](../api/post-api-v1-observation-templates.md) |

> ペア: [`obs-tpl-08.md`](obs-tpl-08.md) · [`obs-tpl-16.md`](obs-tpl-16.md) · [`obs-tpl-19.md`](obs-tpl-19.md) · confirm screen slice。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-18 |
| design_section | §4 confirmテンプレ |
| test_case_id | UAT-05-15 |
| test_layer | acceptance |
| automation | playwright |
| status | **existing** |

逆 RTM: UAT-05-15 — OBS-TPL-18 · OBS-TPL-19 · OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-RX-RD-04 · OBS-RX-REP-04 等 **10 req 束ね**（`revrtm-004` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | confirm 画面 · テンプレ保存 CTA |
| API | POST templates 201 |
| Schema | [`observationtemplatecreaterequest.md`](../schema/observationtemplatecreaterequest.md) |
| Screen | observation-input-confirm |
| テスト | UAT-05-15 playwright |

## gap 注記

- **existing**: confirm CTA + POST templates 実装済 — UAT-05-15 束ね acceptance。
- **TPL-19 連携**: target_scope 警告は別 FR — 保存自体は **スコープ不一致でも警告のみ**。
- **1 画面 1 主ボタン**: commit が主 · テンプレ保存は副次 CTA（preferences 整合）。
