---
slice_id: 05-MICRO-hook-003
type: hook-side-effect
owner: tier-a
axis: research
status: design-forward
impl_gap: true
---

# 05-MICRO-hook-003 — commit 時 `individual_created` 研究軸 +10

- **owner**: tier-a
- **type**: hook-side-effect（Wave C · ADR-H-38 研究軸 · hook-001 子契約）
- **inputs**: [`observation-commit-research-contribution.md`](./observation-commit-research-contribution.md) · [`libs/ihl/observation/solid_commit.py`](../../../../../libs/ihl/observation/solid_commit.py) · [`01-要件/14-貢献度.md`](../../../../../01-要件/14-貢献度.md) §④.3 · ADR-H-38 §6.4
- **acceptance**: 新規判定契約 · トリガ route · べき等 · Δ=+10 · IMPL-GAP · QR/続ける除外 · hook-001 委譲境界

---

## 目的

観測 commit 成功時に **血統上の新規個体**（`individual_id` が event store に **初出**）を検出し、研究軸 `individual_created`（**+10 確定** · F05-03 · #14 §④.3）を `economy/contribution_event` へ追記する契約を定義する。

**親スライス**: hook-001（`observation_saved` +5）。**兄弟**: hook-004（`observation_with_photo` +3）。本スライスは **`individual_created` 判定ロジックのみ**を厚くする。

## トリガ route（正本）

| 優先 | method | path | 備考 |
|------|--------|------|------|
| **1** | POST | `/api/solid-observation/commit` | `commit_solid_observation` |
| 2 | POST | `/api/captures` | legacy solid · 同一判定 |

- **auth**: session 必須
- **成功条件**: capture INSERT 完了 · HTTP **201**

## 新規 individual 判定（設計契約）

```text
function is_new_individual(store, individual_id, capture_id) -> bool:
  // capture/capture 列を individual_id で走査
  prior = store.list_events("capture/capture", filter={individual_id})
  if len(prior) == 0:
    return True
  if len(prior) == 1 and prior[0].capture_id == capture_id:
    return True   // 今回 commit が初出
  return False
```

| 入力 | 判定 |
|------|------|
| `body.individual_id` **省略** | `solid_commit_capture` が `ind_{capture_suffix}` を採番（`solid_commit.py:74`）— **通常は新規** |
| `body.individual_id` **明示**（QR · 続ける） | 既存 `ind_*` — **prior capture が 1 件以上あれば新規ではない** → `individual_created` **Out** |
| 同一 `individual_id` で **2 回目以降** commit | **Out**（+10 は初回のみ） |

**血統意図**: ユーザーが新しい個体マスターを観測エコシステムに **初めて登録**したときのみ +10。フォローアップ観測（`prior_capture_id` あり · 同一 individual）は対象外。

## フック位置

```text
commit_solid_observation(body)
  → solid_commit_capture → capture.individual_id 確定
  → [★ is_new_individual ★]
  → [★ emit observation_saved (+5) ★]        ← hook-001
  → [★ emit individual_created (+10) if new ★] ← 本スライス
  → return 201
```

| 項目 | 契約 |
|------|------|
| 呼出タイミング | `observation_saved` と **同一バッチ**（201 直前） |
| 失敗時 | commit ロールバック **しない**（hook-001 同型） |
| `idempotency_key` | `{individual_id}:individual_created` — 個体単位で **生涯 1 回** |

## 研究軸イベント（`individual_created`）

| フィールド | 値 |
|------------|-----|
| `reason_code` | `individual_created` |
| `axis` | `"research"`（設計 · schema CR 待ち） |
| `delta` | **+10** |
| `actor_id` | `body.actor_id` |
| `target_ref` | `@individual/{individual_id}` |
| `source_type` | `"observation_commit"` |

**1 commit あたり上限**（hook-001 継承）: `observation_saved`(+5) + `observation_with_photo`(+3) + `individual_created`(+10 条件付き) = **最大 +18**

## 実装参照（既存 · 判定未配線）

| 項目 | 値 |
|------|-----|
| individual 採番 | `write_solid_capture` · `solid_commit.py:73-74` — `ind_id = individual_id or f"ind_{capture_id[4:]}"` |
| commit handler | `commit_solid_observation` · `observation_solid.py:400-665` |
| contribution INSERT | `EventStore.write_contribution_event` · `event_store.py:348-368` |
| 個体存在チェック | **未実装** — `list_events` / scan by `individual_id` は **IMPL-GAP** |
| フック関数（**未実装**） | `emit_individual_created_if_new(store, capture, body)` — hook-001 の `emit_research_contribution_on_commit` から呼出 |

## RTM リンク

| req_id | test_case_id | 状態 |
|--------|--------------|------|
| OBS-IND-01 | IT-05-12 | individual 連鎖 · **planned** |
| FR-CONTRIB-02 | — | `individual_created` 換算 · **gap** |
| ADR-H-38 research | IT-05-23（**planned**） | 新規 individual → +10 自動 INSERT |

## 禁止（本スライス）

- 資本軸 · 開発軸の換算（ADR §6.5/§6.6 参照のみ）
- `individual_id` 自動採番の変更（solid_commit 正本を改変しない）
- ユーザー向け「未実装」語 — **IMPL-GAP** / **planned**

---

DET §13 · hook-001 子契約 · ADR-H-38 §6.4 · #14 §④.3 `individual_created` +10。
