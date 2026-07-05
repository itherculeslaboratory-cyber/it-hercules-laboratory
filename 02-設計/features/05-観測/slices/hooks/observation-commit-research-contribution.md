---
slice_id: 05-MICRO-hook-001
type: hook-side-effect
owner: tier-a
axis: research
status: design-forward
impl_gap: true
---

# 05-MICRO-hook-001 — 観測 commit → 研究軸貢献フック

- **owner**: tier-a
- **type**: hook-side-effect（Wave C · ADR-H-38 研究軸）
- **inputs**: [`ADR-H-38 §6.4`](../../../../_横断/adr/ADR-H-38-貢献度3軸-v1-DRAFT.md) · [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · `libs/ihl/core/event_store.py:write_contribution_event` · [`01-要件/14-貢献度.md`](../../../../../01-要件/14-貢献度.md) §④.3
- **acceptance**: トリガ route · フック位置 · イベント契約 · 換算表 · べき等 · IMPL-GAP 明示 · 資本/開発軸は ADR 参照のみ

---

## 目的

観測 **commit 成功（201）** を **研究貢献度（`research` 軸）** の入力源とする side-effect 契約を定義する。  
**本スライスは経済全体（PT ミント · Fib decay · 3 軸 UI）を実装しない** — イベント INSERT フックと換算表のみ（ADR-H-38 §8 · #14 DET 委譲）。

## トリガ route（正本）

| 優先 | method | path | handler | 備考 |
|------|--------|------|---------|------|
| **1** | POST | `/api/solid-observation/commit` | `commit_solid_observation` | Web confirm 主経路 · [`05-MICRO-api-010`](../api/post-api-solid-observation-commit.md) |
| 2 | POST | `/api/captures` | `post_solid_capture` | legacy solid · env chain のみ · 同一フック適用 |

- **auth**: session 必須（`IHL_AUTH_REQUIRED=1` · DET §3.9）
- **成功条件**: capture イベント INSERT 完了 · HTTP **201** · `status: "committed"`

## フック位置（設計）

```text
commit_solid_observation(body)
  → solid_commit_capture / measurements / bindings / schedule / photo …
  → [★ research_contribution_hook ★]   ← 本スライス（TX 内 or 直後 · 設計 TBD）
  → return 201 { status, captureId, … }
```

| 項目 | 契約 |
|------|------|
| 呼出タイミング | capture + measurement 永続 **成功後** · 201 返却 **直前** |
| 失敗時 | フック失敗 **で commit をロールバックしない**（観測 Truth 優先 · 貢献は best-effort · #14 NFR と整合） |
| actor | `body.actor_id`（session 紐付は IMPL 時に #01 連携） |
| target_ref | `@capture/{capture_id}` |

**IMPL-GAP（2026-07-05）**: `apps/api/routes/observation_solid.py` に `write_contribution_event` 呼出 **なし** — 本契約は設計正本。

## 研究軸イベント契約（ADR-H-38 §6.4）

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `event_type` / `reason_code` | string | ○ | 下表 · v1 は `reason_code` に写像（schema CR 前） |
| `axis` | enum | ○（設計） | 固定 `"research"` — ADR-H-38 §6.1 · ADR-H-06 `axis` 列は **schema CR 待ち** |
| `delta` | number | ○ | 換算表の Δ（非負） |
| `actor_id` | string | ○ | 貢献主体 |
| `target_ref` | string | ○ | `@capture/{capture_id}` |
| `source_type` | string | — | 既定 `"observation_commit"` |
| `idempotency_key` | string | ○（設計） | `{capture_id}:{event_type}` — 同一 capture 再送で二重加算禁止 |

**永続先**: `economy/contribution_event` · INSERT ONLY（`EventStore.write_contribution_event` · ADR-H-06）

### 換算表（研究軸 · v1 たたき台）

> 正本たたき台: [`01-要件/14-貢献度.md`](../../../../../01-要件/14-貢献度.md) §④.3 · 係数 **人間 Go 確定 2026-07-05**（F05-01/02 · F14-03 · [`00-M-082前-人間判断-回答-v1.md`](../../../../../05-運用/queues/00-M-082前-人間判断-回答-v1.md)）· **資本/開発軸は本表に含めない**

| 条件 | `reason_code` | Δ（research） | 備考 |
|------|---------------|---------------|------|
| commit 成功（計測あり） | `observation_saved` | **+5** | **確定** · ADR-H-38 §6.4 · hook-001 |
| 上記 + 写真 blob 永続 | `observation_with_photo` | **+3** | **確定** · 追加ボーナス · hook-004 · `photo_data_url` または `image_path` 有 |
| 新規 individual 採番 | `individual_created` | **+10** | 同一 commit で `individual_id` 新規時のみ · hook-003 |

- **1 commit あたり最大**: `observation_saved` + `observation_with_photo`（+8）+ 条件付き `individual_created`（+10）
- **PT ミント / Fib / decay**: **本スライス Out** → ADR-H-38 §6.2 · #14 DET
- **資本軸（8% 支払い）**: ADR-H-38 §6.5 stub — #06/#23 境界
- **開発軸（GitHub/掲示板/fork）**: ADR-H-38 §6.6 stub — #14/#07 境界

## 実装参照（既存 · フック未配線）

| 項目 | 値 |
|------|-----|
| commit handler | `commit_solid_observation` · `apps/api/routes/observation_solid.py:399-665` |
| contribution INSERT | `EventStore.write_contribution_event` · `libs/ihl/core/event_store.py:348-368` |
| 集計（読取） | `EconomyStore.contribution_total` · `libs/ihl/economy/economy_logic.py:97-102` |
| API 読取 | `GET /api/v1/contribution` · `apps/api/main.py:218-222` |
| フック関数（**未実装**） | `emit_research_contribution_on_commit(store, capture, body)` — 配置案: `libs/ihl/economy/observation_contribution.py` |

### write_contribution_event 既存シグネチャ

```348:368:libs/ihl/core/event_store.py
    def write_contribution_event(
        self,
        *,
        actor_id: str,
        delta: float,
        reason_code: str,
        source_type: str = "manual",
        target_ref: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "contribution_event_id": _new_id("contrib"),
            "actor_id": actor_id,
            "delta": delta,
            "reason_code": reason_code,
            "source_type": source_type,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if target_ref:
            payload["target_ref"] = target_ref
        return self.append("economy/contribution_event", payload)
```

## 201 応答への影響

- commit 201 JSON に **貢献 Δ を含めない**（#14 プロフィール / `GET /api/v1/contribution` で読取）
- 将来 optional: `contribution_hints: { research_delta: 5 }` — **v1 Out**（UI 未要求）

## RTM リンク

| req_id | test_case_id | 状態 |
|--------|--------------|------|
| FR-CONTRIB-01 | UT-14-02 · IT-14-03 | 基盤（手動 event INSERT）· **existing** |
| FR-CONTRIB-02 | — | 換算パラメータ · **gap**（economyMasterStore） |
| OBS-SOL-01 | ST-05-01 | commit 本体 · **existing** |
| ADR-H-38 research | IT-05-22（**planned**） | commit → `observation_saved` 自動 INSERT |

## 禁止（本スライス）

- 3 軸 PT ミント · UTC decay バッチの実装記述
- 資本軸 `market_fee_8pct_paid` · 開発軸 `board_improvement_adopted` の換算（ADR §6.5/§6.6 参照のみ）
- commit 失敗時の貢献イベント
- ユーザー向け「未実装」語 — 代わりに **IMPL-GAP** / **planned**

---

DET §13 · [`詳細設計-v3.md`](../../詳細設計-v3.md) · ADR-H-38 §6.4 cross-ref。
