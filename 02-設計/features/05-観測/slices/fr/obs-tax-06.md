---
slice_id: 05-MICRO-fr-029
type: fr-1id
req_id: OBS-TAX-06
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-029 — OBS-TAX-06

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-06 · RTM `status=review`
- **acceptance**: OBS-TAX-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

表示 **alias**（例: `Heracules hercules`）と **正規学名**（例: `Dynastes hercules`）を **二重管理** し、UI・RAG・Twin で混同しないこと（REQ-025 §7.3 · promo-pack 維持方針）。alias は **表示専用** — commit taxonomy 確定値ではない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | WorkflowContext · target メタ · RAG 辞書 · UI ラベル |
| **Transform** | `display_alias` フィールド分離 · 正規 `species`/学名は user confirmed |
| **OUT** | UI 表示 = alias 可 · capture/search Truth = 正規学名 · Twin 台本は混同禁止 |

## 受入基準

1. ADR-H-15/16: `display_alias` は **任意 · 確定値ではない**。
2. commit `species` は正規学名（例: `Dynastes hercules`）— alias 文字列を species に書かない。
3. UAT-05-02（review）: alias · OBS-TGT-04（亜種まで）— **acceptance レビュー** 束ね。
4. RAG/Twin: alias と学名を **同一フィールドに正規化しない**（twin-script 舞台ルール）。
5. catalog 例: `Dynastes hercules hercules`（正規） vs 表示 `Heracules hercules`（alias · TAX-04 例示）。

## In / Out 境界

| In | Out |
|----|-----|
| display_alias · UI 表示コンテキスト | 画面ラベル · 文脈バー |
| user confirmed species（正規） | capture · search フィルタ |
| — | alias を search Truth に索引 |
| — | OS 側での alias→学名 自動確定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1 | capture `species` 正規 |
| §0 | 混同禁止 |
| ADR-H-15 | context `display_alias` |
| ADR-H-16 | target JSON 例 |
| §7 | promo-pack taxonomy 方針 |

> 要件 §⑪: `Heracules hercules` 表示名維持 · taxonomy 正本 `Dynastes hercules`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-06 |
| design_section | §2.1 alias |
| test_case_id | UAT-05-02 |
| test_layer | acceptance |
| automation | review |
| status | **review** |

逆 RTM: UAT-05-02 — OBS-TAX-06 · OBS-TGT-04（deferred · `revrtm-004` §B）。

## 実装 surface

| 層 | 参照 |
|----|------|
| ADR | `ADR-H-15` · `ADR-H-16` |
| Schema | WorkflowContext · target 型（display_alias 任意） |
| UI | コンテキストバー · 入力画面ラベル |
| RAG | 辞書 · accepted_requirements — 混同監査 |
| テスト | UAT-05-02 · **review** — 専用 pytest 薄い |

## gap 注記

- **tier-a / review**: フィールド設計は ADR 確定 · **UI/RAG 横断レビュー** が RTM review の理由。
- **TGT-04 deferred**: 亜種までの UI は別 FR — alias 混同防止は本 FR スコープ。
- **粉飭禁止**: review を existing にしない — Twin/RAG 監査証跡待ち。
