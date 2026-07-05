---
slice_id: 05-MICRO-hook-002
type: hook-side-effect
owner: tier-a
axis: observation-env
status: design-forward
impl_gap: true
---

# 05-MICRO-hook-002 — commit 時 Tier B 環境スナップショット写像

- **owner**: tier-a
- **type**: hook-side-effect（Wave C · ADR-H-30 · #13 ingest 参照）
- **inputs**: [`詳細設計-v3.md`](../../詳細設計-v3.md) §9.5–§9.7 · [`observation-commit-research-contribution.md`](./observation-commit-research-contribution.md) · `apps/web/src/lib/observation-draft.ts` · [`01-要件/13-データ取得元管理.md`](../../../../../01-要件/13-データ取得元管理.md)
- **acceptance**: トリガ route · Tier B 取得経路 · commit body 契約 · source enum · locked 行 · IMPL-GAP · サーバ SwitchBot 禁止

---

## 目的

観測 **commit** 時に、ユーザー入力 draft から **Tier B ingest 由来の環境スナップショット**（温度 · 湿度 · 照度レベル）を `ObservationCommitBody.environment_snapshot` および measurement 行 `source=registry_poll` へ **写像する** side-effect 契約を定義する。

**本スライス Out**: collector ingest 本体 · `POST /api/env/collector/ingest` · SwitchBot secret · 研究軸貢献（→ hook-001）。

## トリガ route（正本）

| 優先 | method | path | 備考 |
|------|--------|------|------|
| **1** | POST | `/api/solid-observation/commit` | Web confirm 主経路 |
| 2 | POST | `/api/captures` | legacy solid · 同一写像ルール |

- **auth**: session 必須
- **成功条件**: HTTP **201** · capture + measurement 永続完了

## Tier B 取得経路（commit 前 · Web）

| 段 | 操作 | 契約 |
|----|------|------|
| 1 | ユーザーが env snapshot checkbox ON | `draft.includeEnvSnapshot \|\| draft.periodicEnabled` |
| 2 | `GET /api/env/devices/{device_id}/latest` | **Tier B ingest 最新 1 バケット**（#13 正本）· **サーバ SwitchBot secret 禁止** |
| 3 | draft へ写像 | `draft.envSnapshot` · `source ∈ {ingest_snapshot, registry_poll}` → **locked** |
| 4 | commit body 組立 | `buildEnvironmentSnapshotCommitBody(draft)` |

**禁止**: commit handler 内での SwitchBot live poll（ADR-H-30 §2.2）。

## commit body 契約（`environment_snapshot`）

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `temperature_c` | string/number | △ | `envSnapshot` または legacy `envTemperature` |
| `humidity_pct` | string/number | △ | 同上 |
| `device_id` | string | △ | `resolveBindingEnvDeviceId(draft)` 優先 |
| `source` | enum | ○ | `manual_entry` \| `ingest_snapshot` \| `registry_poll` |
| `captured_at` | ISO8601 | — | ingest バケット時刻 |

**含めない条件**（`shouldIncludeEnvironmentSnapshot`）:

- `draft.hasPhoto === true` → 写真あり時は `photo_conditions[]` のみ · `environment_snapshot` **Out**
- 温湿度とも空 → `{}`（スナップショット省略）

## measurement 行 `source` 写像（OBS-RX-RD-01）

| 行 `method` | commit `source` |
|-------------|-----------------|
| `iot_switchbot` | `registry_poll` |
| その他 | `manual_entry` |

Tier B ロック行は UI read-only（DET §9.5 · `StructuredRow` `group=env_snapshot`）。

## フック位置（設計）

```text
commit_solid_observation(body)
  → parse ObservationCommitBody.environment_snapshot
  → persist env measurements (temperature/humidity rows)
  → [★ research_contribution_hook ★]  ← hook-001（別スライス）
  → return 201
```

| 項目 | 契約 |
|------|------|
| 失敗時 | env 写像失敗 **で commit 全体をロールバックしない**（計測 Truth 優先 · 空 snapshot 許容） |
| idempotency | 同一 `capture_id` 再送 → 409（`05-MICRO-error-004`） |

## 実装参照（既存 · 契約正本）

| 項目 | 値 |
|------|-----|
| draft 読書 | `readDraft` · `writeDraft` · `DRAFT_STORAGE_KEY` · `apps/web/src/lib/observation-draft.ts:342-678` |
| snapshot 組立 | `buildEnvironmentSnapshotCommitBody` · `:539-564` |
| 含否判定 | `shouldIncludeEnvironmentSnapshot` · `:532-537` |
| Tier B READ | `GET /api/env/devices/{device_id}/latest`（#13 · 観測 slices/api 未掲載） |
| commit handler | `commit_solid_observation` · `apps/api/routes/observation_solid.py:399-665` |

**IMPL-GAP（2026-07-05）**: API 側 ingest バケット検証 · `captured_at` 整合チェックは **設計のみ** — 実装は IMPL-GO 後。

## RTM リンク

| req_id | test_case_id | 状態 |
|--------|--------------|------|
| OBS-ENV-02 | IT-05-08 | ingest 参照 measurement · **existing** |
| OBS-ENV-05 | ST-05-03 | env snapshot commit · **partial** |
| OBS-RX-ROW-07 | — | Tier B latest fetch · **gap** |
| OBS-FUP-07 | UAT-05-12 | placement + env checkbox · **planned** |

## 禁止（本スライス）

- SwitchBot token/secret のサーバ保持・live fetch
- collector ingest ルートの新規断定（#13 正本）
- 研究軸 `contribution_event`（hook-001 委譲）
- ユーザー向け「未実装」語 — **IMPL-GAP** / **planned**

---

DET §9.5–§9.7 · hook-001 後続 · ADR-H-30 cross-ref。
