---
slice_id: 05-MICRO-fr-025
type: fr-1id
req_id: OBS-TAX-02
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-025 — OBS-TAX-02

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-02 · RTM `status=gap`
- **acceptance**: OBS-TAX-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**GBIF Driver** が生物名・taxonKey **候補**を固体 UI に提示し、ユーザー確定前に commit Truth へ混ぜないこと（total-observation-roadmap §3.1 · REQ-026 P1）。IHL 現状は **Driver runtime 未配線（gap）** — 手動入力/辞書が正本。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー検索クエリ · 学名/和名 fragment |
| **Transform** | `gbifClient` 等で GBIF API 照会 · TaxonomyCandidate リスト生成 |
| **OUT** | UI 候補 `{ label, taxonKey, source: "gbif" }` · **commit には未反映** |

## 受入基準

1. GBIF 応答は **候補パネルのみ** — species 確定はユーザー操作（OBS-SOL-04 · OBS-TAX-07）。
2. taxonKey は `canonical_ids` **候補根拠** として draft に保存可 — commit 確定値に自動マージ禁止。
3. **gap 維持**: UAT-05-07 束ね — GBIF Driver **runtime 未配線**（`03-テスト計画` §P1 gap）。
4. ネットワーク/API 鍵は **秘密非保持**（OBS-NF-02）— env のみ。
5. オフライン時: 候補空 + 理由表示（OBS-NF-04 整合 · deferred UI）。

## In / Out 境界

| In | Out |
|----|-----|
| GBIF API · 検索文字列 | TaxonomyCandidate リスト |
| 固体入力 UI | — |
| — | commit species 自動確定 |
| — | GBIF 画像取得（ADR-H-16 禁止） |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P1 | 全 Driver runtime gap |
| §0 | 外部 ID は候補根拠 |
| ADR-H-16 | 候補提示 · 画像取得しない |
| §7 | total-observation-roadmap §3.1 |

> civ-os 参照: `gbifClient` · 固体 UI — IHL は **設計移植待ち**。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-02 |
| design_section | §7 P1 GBIF |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-TAX-02/03/05 · OBS-SOL-05 · OBS-REP-* · OBS-DRV-01 等 10 req 束ね（`revrtm-004` · gap 多）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 将来 Lib | `gbifClient` · Driver connector（OBS-DRV-01） |
| Screen | [`observation-input.md`](../screens/observation-input.md) 候補 UI |
| ADR | `ADR-H-16-観測対象ナビゲータ.md` |
| 横断 | REQ-026 §3.2 · P1 Driver 群 |
| テスト | UAT-05-07 · **gap** — pytest/playwright 未配置 |

## gap 注記

- **tier-a / gap**: 本 FR は **設計・要件正本のみ** — 実装 Go は Driver 横断（OBS-DRV-01）後。
- **粉飭禁止**: UAT-05-07 を existing と記載しない（revrtm-004 §C）。
- **TAX-07 ペア**: taxonKey は候補根拠テキスト — 確定 species は別フィールド。
