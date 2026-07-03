---
slice_id: 05-MICRO-fr-031
type: fr-1id
req_id: OBS-REP-01
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-031 — OBS-REP-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-01 · RTM `status=gap`
- **acceptance**: OBS-REP-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

甲虫色彩計測の参照規格 **BPCMS**（人手・機材義務・ラボ条件含む）を観測ワークフローの **再現性正本** として位置づけ、IHL Phase1 は **ver1 最小メタ**（capture/manifest/digest）のみ — **strict 完全準拠は Phase 4+**（REQ-021 · OBS-RX-REP-01 OUT）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | BPCMS 参照文書 · 撮影条件テキスト · 機材宣言（`devices[]` · `photo_conditions[]`）· 人手計測行 |
| **Transform** | ver1: 最小メタを capture/manifest に格納 · strict: 機材義務・ラボ条件・色彩校正チェック（**未配線**） |
| **OUT** | ver1 IN: `photo_conditions[]` · `devices[]` · manifest `implementation_hints` · **strict B+ 査読証跡は gap** |

## 受入基準

1. 要件は **active** — strict 完全準拠は **Phase 4+ 人間判断**（§4.14 · REQ-021）。
2. ver1 最小メタセットに BPCMS 査読前フィールドが含まれる（§4.16.5 表 · OBS-RX-REP-04 IN 最小）。
3. UAT-05-07（gap 束ね）: Driver/BPCMS 未配線 — **10 req 共有 TC**（`revrtm-004`）。
4. IHL parity P2: BPCMS strict · スケールシート印刷は **IHL 未配線**（DET §7.2）。
5. civilization-os 側は BPCMS 参照・スケールシート **部分実装** — IHL は manifest/digest のみ継承。

## In / Out 境界

| In | Out |
|----|-----|
| BPCMS 参照規格（`指示/2026.3.30/`） | ver1 撮影条件・機材メタ |
| 人手計測 · 写真 blob | capture イベント · manifest |
| — | strict 機材義務自動検証 |
| — | 色彩校正パイプライン（#18 境界） |
| — | 査読級 B+ 自動判定 |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P2 | BPCMS strict gap |
| §3.3.1 | manifest · digest（ver1 再現性） |
| §4.16.5 | OBS-RX-REP-01 OUT / REP-04 IN 最小 |
| REQ-021 | Phase 4+ strict |

> 正本: `指示/2026.3.30/` · `observation-reproducibility-roadmap.md` · civ-os `docs/observation-solid-reanalysis-manifest.md`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-01 |
| design_section | §7 P2 BPCMS |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-REP-01 · OBS-REP-02 · OBS-REP-06 · OBS-DRV-* 等 **gap 束ね**（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| civ-os | BPCMS 参照 UI · スケールシート（部分） |
| IHL API | [`get-api-v1-observation-capture-id-reanalysis-manifest.md`](../api/get-api-v1-observation-capture-id-reanalysis-manifest.md) |
| Schema | [`observationphotoconditionrow.md`](../schema/observationphotoconditionrow.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) |
| 将来 | strict 機材義務 validator · REQ-021 Phase4+ |

## gap 注記

- **tier-a / gap**: 参照規格は設計正本だが **IHL runtime 未配線** — ver1 メタで再解析入口のみ確保。
- **UAT-05-07**: 1 TC 多 req は逆 RTM 意図どおり — Driver/BPCMS 実装まで gap 維持。
- **civ-os 分離**: 固体観測 UI の BPCMS 文言は civ-os 正本 · IHL は研究レイク側。
