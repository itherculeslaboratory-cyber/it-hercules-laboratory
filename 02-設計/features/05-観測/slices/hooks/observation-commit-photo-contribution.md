---
slice_id: 05-MICRO-hook-004
type: hook-side-effect
owner: tier-a
axis: research
status: design-forward
impl_gap: true
---

# 05-MICRO-hook-004 — commit 時 `observation_with_photo` 研究軸 +3

- **owner**: tier-a
- **type**: hook-side-effect（Wave C · ADR-H-38 研究軸 · hook-001 子契約）
- **inputs**: [`observation-commit-research-contribution.md`](./observation-commit-research-contribution.md) · [`apps/api/routes/observation_solid.py`](../../../../../apps/api/routes/observation_solid.py) · [`libs/ihl/observation/detail.py`](../../../../../libs/ihl/observation/detail.py) · [`01-要件/14-貢献度.md`](../../../../../01-要件/14-貢献度.md) §④.3 · ADR-H-38 §6.4
- **acceptance**: 写真判定契約 · トリガ route · べき等 · Δ=+3 · IMPL-GAP · blob 永続条件 · hook-001 委譲境界

---

## 目的

観測 commit 成功時に **写真 blob が永続された capture** を検出し、研究軸 `observation_with_photo`（**+3 確定** · F05-02 · #14 §④.3）を `economy/contribution_event` へ追記する契約を定義する。

**親スライス**: hook-001（`observation_saved` +5 · 本スライス +3）。**兄弟**: hook-003（`individual_created` +10）。

## トリガ route（正本）

| 優先 | method | path | 備考 |
|------|--------|------|------|
| **1** | POST | `/api/solid-observation/commit` | `commit_solid_observation` |
| 2 | POST | `/api/captures` | legacy solid · 同一判定 |

- **auth**: session 必須
- **成功条件**: capture INSERT 完了 · HTTP **201**

## 写真あり判定（設計契約）

```text
function has_committed_photo(body, capture, image_path) -> bool:
  // 1. commit handler が blob 永続に成功
  if image_path and blob_store.exists(image_path):
    return True
  // 2. legacy / 事前アップロード経路
  if capture.get("has_photo") and capture.get("image_path"):
    return image_blob_exists(capture["image_path"])
  return False
```

| 入力 | 判定 |
|------|------|
| `body.photo_data_url`（`data:image/...;base64,...`） | `_persist_photo_blob` 成功 → `raw/{capture_id}.jpg` 等 · **+3 対象** |
| `body.has_photo=true` かつ blob 無 | **Out**（空フラグのみでは加算しない） |
| 計測のみ commit（写真なし） | `observation_saved`(+5) のみ · 本イベント **Out** |
| `photo_conditions` のみ（撮影条件行） | **Out** — 本スライスは **blob 画像** のみ |

**血統意図**: 標本写真付き観測の追加ボーナス。色補正・再トーンは **禁止**（`ui-reference/preferences.md` §C · 観測 Truth 優先）。

## フック位置

```text
commit_solid_observation(body)
  → _persist_photo_blob → capture.image_path / has_photo
  → solid_commit_capture → measurement 永続
  → [★ emit observation_saved (+5) ★]           ← hook-001
  → [★ emit observation_with_photo (+3) if photo ★] ← 本スライス
  → [★ emit individual_created (+10) if new ★]  ← hook-003
  → return 201
```

| 項目 | 契約 |
|------|------|
| 呼出タイミング | `observation_saved` **直後** · `individual_created` **直前**（201 直前） |
| 失敗時 | commit ロールバック **しない**（hook-001 同型） |
| `idempotency_key` | `{capture_id}:observation_with_photo` — capture 単位 **1 回** |

## 研究軸イベント（`observation_with_photo`）

| フィールド | 値 |
|------------|-----|
| `reason_code` | `observation_with_photo` |
| `axis` | `"research"`（設計 · schema CR 待ち） |
| `delta` | **+3** |
| `actor_id` | `body.actor_id` |
| `target_ref` | `@capture/{capture_id}` |
| `source_type` | `"observation_commit"` |

**1 commit あたり上限**（hook-001 継承）: `observation_saved`(+5) + `observation_with_photo`(+3) + `individual_created`(+10 条件付き) = **最大 +18**

## 実装参照（既存 · フック未配線）

| 項目 | 値 |
|------|-----|
| blob 永続 | `_persist_photo_blob` · `observation_solid.py:153-172` |
| commit 配線 | `commit_solid_observation` · `observation_solid.py:619-622` |
| blob 存在確認 | `image_blob_exists` · `detail.py:159-162` |
| contribution INSERT | `EventStore.write_contribution_event` · `event_store.py:348-368` |
| フック関数（**未実装**） | `emit_observation_with_photo_if_blob(store, capture, body, image_path)` — hook-001 から呼出 |

### _persist_photo_blob 既存契約

```153:172:apps/api/routes/observation_solid.py
def _persist_photo_blob(capture_id: str, photo_data_url: str | None) -> str | None:
    if not photo_data_url or not photo_data_url.startswith("data:"):
        return None
    ...
    image_path = f"raw/{capture_id}{ext}"
    ...
    return image_path
```

## RTM リンク

| req_id | test_case_id | 状態 |
|--------|--------------|------|
| OBS-PHOTO-01 | UAT-05-15 | 写真付き commit · **planned** |
| FR-CONTRIB-02 | — | `observation_with_photo` 換算 · **gap** |
| ADR-H-38 research | IT-05-24（**planned**） | blob 永続 → +3 自動 INSERT |

## 禁止（本スライス）

- 資本軸 · 開発軸の換算（ADR §6.5/§6.6 参照のみ）
- 写真なし commit への +3
- thumbnail のみで raw blob 無の加算（`image_blob_exists` 必須）
- ユーザー向け「未実装」語 — **IMPL-GAP** / **planned**

---

DET §13 · hook-001 子契約 · ADR-H-38 §6.4 · #14 §④.3 `observation_with_photo` +3 · F05-02 確定。
