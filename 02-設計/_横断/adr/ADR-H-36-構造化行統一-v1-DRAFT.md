# ADR-H-36 — 観測入力 構造化行統一（StructuredRow · B モデル）

> **ステータス**: **Accepted v1**（2026-06-25 ユーザー確定 · **2026-06-26 実装 COMPLETE 同期**）  
> **要件**: [`01-要件/05-観測.md`](../../../01-要件/05-観測.md) §4.18 OBS-RX-ROW-*  
> **UI**: [`02-設計/features/05-観測/ui/観測入力-v2.md`](../../features/05-観測/ui/観測入力-v2.md) §3.2.1  
> **詳細**: [`02-設計/features/05-観測/詳細設計-v2.md`](../../features/05-観測/詳細設計-v2.md) §9.6

---

## 1. 文脈

観測入力（`/observation/input`）で計測行と撮影条件行が **ほぼ同一の 4 列 DD** なのに JSX が重複していた。加えて撮影後に `mergePhotoEnvConditions` が温湿度を **撮影条件へ自動注入**し、研究データ上「撮影条件」と「環境点」が混線していた。

## 2. 決定

| 項目 | 内容 |
|------|------|
| **B モデル** | 環境温湿度は `photo_conditions[]` へ **自動追加しない** |
| **StructuredRow** | `group` + 項目候補のみ差分 · 列 = 項目/値/単位/方法（+ IoT device） |
| **環境スナップショット** | **環境・設置は binding のみ** · 温湿度点は **写真なし→観測個体データ内** / **写真あり→`photo_conditions` のみ**（`environment_snapshot` commit しない）· ingest or 手入力 · `source` 読取専用バッジ |
| **設置期間** | **開始日のみ**（`placementStartedAt`）— 終了は次回観測・棚移動で暗黙（ADR-H-33） |
| **device id 解決** | `GET .../devices/{id}/latest` = CSV import 同型の external id 解決 |
| **commit 分離** | `measurements[]` / `photo_conditions[]` / `environment_snapshot` |
| **device_id 対称** | 計測行 commit にも `device_id` を載せる |

## 3. 却下

- 撮影時の `mergePhotoEnvConditions`（B モデルで廃止）
- IHL サーバ SwitchBot secret によるスナップショット取得（ADR-H-30 継続）

## 4. 実装参照

- `apps/web/src/components/observation/StructuredRow.tsx`
- `apps/web/src/lib/observation-draft.ts` — `buildEnvironmentSnapshotPayload` 等
- `GET /api/env/devices/{device_id}/latest` — Tier B ingest 参照
- `apps/api/routes/observation_solid.py` — `EnvironmentSnapshotBody`

## 5. 人間ゲート

| 項目 | ステータス |
|------|-----------|
| B モデル本文 | **ユーザー確定 2026-06-25 · 実装同期 2026-06-26** |
| ADR Accepted 昇格 | 任意（本書を v1 正本として可） |
