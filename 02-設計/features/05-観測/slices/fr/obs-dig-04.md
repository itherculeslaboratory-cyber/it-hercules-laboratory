---
slice_id: 05-MICRO-fr-018
type: fr-1id
req_id: OBS-DIG-04
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-018 — OBS-DIG-04

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.3 OBS-DIG-04 · RTM `status=review`
- **acceptance**: OBS-DIG-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測（含デジタル）が **Kernel UUID ルーティング** に従い、**画面単位設計を禁止** する文明 OS 構造（`WorldSystem.md` · MiniScreenKernel）を満たすこと。Next.js ファイルルートは **View 実装** であり、正本は FeatureNode `observation` 配下 Kernel 契約。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | Kernel UUID · FeatureNode `observation` · Component/SubComponent 契約 |
| **Transform** | ルータが UUID→handler 解決 · 画面名ではなく Kernel 種別で ITO 分岐 |
| **OUT** | create/analyze/configure 等 Kernel 処理 · C-USB 準拠 fork 可能 component |

## 受入基準

1. 要件 §4.3: **画面単位設計禁止** — 設計 doc は Kernel/Component 語彙を使用。
2. DET §5: FeatureNode `observation` — create=commit · analyze=similar · configure=template。
3. `ST-05-01`: solid capture 201 + **contract** が system 層で緑 — OBS-DIG-04 は **review**（Kernel 横断 · Tier A）。
4. デジタル経路も固体と **同一 FeatureNode** — 別 FeatureNode 勝手作成禁止。
5. Tier A レビュー: Next.js path と Kernel UUID の **parity 表** が遷移辞書と整合。

## In / Out 境界

| In | Out |
|----|-----|
| WorldSystem MiniScreenKernel | Kernel UUID ルーティング契約 |
| C-USB Component ITO | create/analyze/configure 分離 |
| — | レガシー「120 画面」カタログ新規追記 |
| — | 画面単位 REQ ID 増殖 |

## DET 参照

| 節 | 内容 |
|----|------|
| §5 | component ITO · FeatureNode observation |
| §1.1 | Kernel 実装マップ |
| §7 | legacy parity · ルート名差 |

> 憲法: `civilization/WorldSystem.md` · `civilization/ProjectRules.md`（画面概念なし）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-DIG-04 |
| design_section | §5 Kernel |
| test_case_id | ST-05-01 |
| test_layer | system |
| automation | pytest |
| status | **review** |

逆 RTM: ST-05-01 は OBS-SOL-03（existing）· OBS-DIG-04（review）を束ねる（`revrtm-003-system-layer.md` GAP-ST-03）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 法律 | `civilization/WorldSystem.md` · `ComponentFramework.md` |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md)（create Kernel） |
| 横断 | [`../../遷移辞書-v1.json`](../../遷移辞書-v1.json) · ROUTE-INDEX |
| テスト | `test_solid_commit_capture_persist`（ST-05-01） |

## gap 注記

- **review · tier-a**: Kernel UUID と App Router path の **1:1 表** は人間レビュー待ち — ST-05-01 は固体 contract のみ existing 断言。
- **DIG ルート deferred**: OBS-DIG-02 未配線 — Kernel 契約は doc 先行 · digital UUID 実装は ver2。
- **粉飭禁止**: ST-05-01 緑を DIG-04 **existing** と書かない（revrtm GAP-ST-03）。
