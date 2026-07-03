---
slice_id: 05-MICRO-fr-087
type: fr-1id
req_id: OBS-RX-RD-05
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-087 — OBS-RX-RD-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-05 · ADR-H-30 §2.3 · ADR-H-19 §6 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

Tier B **gap 透明性** — 未取得バケットは **補間して fact 化しない** · UI/API で gap 表示 · imputed は `source=imputed` + 別 event として記録すること（ADR-H-30 §2.3 · ADR-H-19 §6 同型）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | Tier B telemetry バケット · `/latest` 503/空 · ユーザー手入力 |
| **Transform** | gap 検出 · UI 理由表示 · imputed 行は `source=imputed` 分離 |
| **OUT** | gap 可視化 — fact 集計から imputed/gap **除外** · 補間 fact 化 **禁止** |

## 受入基準

1. 503/空バケット: UI に **理由 1 行** + 手入力 or スキップ導線（ROW-07 · NF-04）。
2. `source=imputed` 行は fact ダッシュボードと **混在しない**（RD-01 enum 整合）。
3. サーバ側: 補間値を measurement fact として保存 **禁止**。
4. IT-05-10（planned）: 専用 integration pytest **未**（`revrtm-002` · gap-impl）。
5. §4.16.7 検証束 #5: Tier B gap UI · imputed 行は fact と混在しない。

## In / Out 境界

| In | Out |
|----|-----|
| Tier B 未取得 | gap UI 表示 |
| imputed 入力 | `source=imputed` 別 event |
| — | 補間 fact 化 |
| — | gap を黙って欠損値で埋める |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | Tier B · ingest 契約 |
| ADR-H-30 §2.3 | gap 透明性 |
| ADR-H-19 §6 | imputed 分離同型 |
| ROW-07 | `/latest` 503 理由表示 |

> ペア: [`obs-rx-rd-01.md`](obs-rx-rd-01.md) · [`obs-nf-04.md`](obs-nf-04.md) · [`obs-rx-row-07.md`](obs-rx-row-07.md) · ADR-H-30。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-05 |
| design_section | §9.1 gap透明 |
| test_case_id | IT-05-10 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-10 — OBS-RX-RD-05（1 req · `revrtm-002` · 専用 IT 無 · gap-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `/api/env/devices/{id}/latest` · 503 body |
| Web | gap 理由表示 · imputed バッジ |
| Lib | fact 集計 imputed 除外 |
| テスト | IT-05-10 **未** |

## gap 注記

- **planned · gap-impl**: gap UI 部分実装あり — IT-05-10 専用 pytest 未追加。
- **RD-01 交差**: imputed enum は RD-01 — 本 FR は **gap 透明性ポリシー**。
- **ADR 凍結**: ADR-H-30 運用凍結済 — IMPL は要件確定 · ADR 昇格は任意（§4.16.8）。
