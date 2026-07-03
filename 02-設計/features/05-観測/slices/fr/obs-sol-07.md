---
slice_id: 05-MICRO-fr-007
type: fr-1id
req_id: OBS-SOL-07
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-007 — OBS-SOL-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-07 · RTM `status=existing`
- **acceptance**: OBS-SOL-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測セッションが **どの経路で開始されたか**（`entryMode`: `photo_ai` / `manual_taxonomy` / `qr` / `device_api` / `continue` 等）を記録し、分析・監査・QR 連携（OBS-QR-04）で **入口チャネルが追跡可能** であること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | URL クエリ `from=qr` · draft `entryMode` · 個体詳細「続けて観測」· 手動新規 |
| **Transform** | draft → commit body `entry_mode` 写像 · canonical digest に含める · capture イベント属性へ |
| **OUT** | セッション/capture JSON に `entry_mode` 保持 · reanalysis-manifest 参照可能 |

## 受入基準

1. QR 入口: `/observation/new?individual_id=…&from=qr` → draft `entryMode: "qr"`（OBS-QR-04 整合）。
2. commit 201 後 capture イベントに `entry_mode` が非 null（指定時）。
3. `clientContentDigest` canonical に `entry_mode` キー含む（§3.3.1）。
4. UT-05-01: entry_mode 永続の unit カバー（OBS-SOL-01 束ね）。
5. 未指定時は省略可 — 空文字は digest から除外（`observation-digest.ts`）。

## In / Out 境界

| In | Out |
|----|-----|
| Web ルート · クエリ · draft | capture `entry_mode` 属性 |
| QR スキャン deep link | — |
| — | entryMode から taxonomy 自動確定（OBS-SOL-04 禁止） |
| — | デバイス API 自動計測本体（OBS-INPUT-06/07 · 別 FR） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.1 | capture POST · actor_id |
| §3.3.1 | digest canonical `entry_mode` |
| §9.1 | `entry_mode` on commit · G2 done |
| §10 | `ObservationDraft.entryMode` · input page |

> API フィールド詳細は [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · `observation-digest.ts`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-07 |
| design_section | §3.1 entryMode |
| test_case_id | UT-05-01 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-01 · OBS-QR-04（QR 入口専用 req）が連鎖。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `apps/web/src/lib/observation-draft.ts` · `observation-digest.ts` · input/confirm pages |
| API | commit body `entry_mode`（schema-017） |
| Lib | `content_digest.py` · `commit_solid_observation` |
| 要件 | `01-要件/05-観測.md` OBS-QR-04 |

## gap 注記

- **enum 厳密化**: Pydantic Literal 未固定 — 慣例値は doc 化、未知値も文字列として保存（拡張許容）。
- **photo_ai / device_api**: 値は記録可能 — 対応 UI/パイプラインの完全性は OBS-INPUT-* · #18 で別追跡。
