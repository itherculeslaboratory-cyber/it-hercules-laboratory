---
slice_id: 05-MICRO-fr-021
type: fr-1id
req_id: OBS-R2-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-021 — OBS-R2-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.4 OBS-R2-03 · RTM `status=planned`
- **acceptance**: OBS-R2-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

R2 / event store への書込は **同一キーへの再 put を拒否**（no-overwrite）し、上書きによる履歴改ざんを防ぐこと。OBS-R2-01（INSERT ONLY）の **実装・テスト担保** として civilization-os · IHL 双方で Phase 0 受入基準（`00-AI-HANDOFF-BRIEF.md` §11）を満たす。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | PUT/write 要求 · 対象キー · payload |
| **Transform** | `exists(key)` 検査 — 既存なら **拒否**（`R2NoOverwriteError` / 409 相当）· 新規キーのみ put |
| **OUT** | 初回 write 成功 · 再 put は例外/エラー応答 · audit event 追記（WaveE devR2） |

## 受入基準

1. 同一 capture/session/event キーへの 2 回目 write → **拒否**（in-place patch 不可）。
2. `libs/ihl/core/r2_io.py` · `event_store.py`: exists チェック後 put（`docs/testing-strategy.md`）。
3. `ST-05-03`（planned）: 2 回 commit → 別 ID — no-overwrite と **間接整合**（R2-01/02/NF-01 束ね）。
4. Phase 0 受入: 同一キー再 put → **例外**（`00-AI-HANDOFF-BRIEF.md` §11 · item 4）。
5. index 追記は **新行 append** のみ — ファイル全体 replace 禁止（OBS-R2-05 ペア）。

## In / Out 境界

| In | Out |
|----|-----|
| 全 R2 write 経路（commit · upload · manifest） | no-overwrite ガード |
| devR2 local_fallback / dev_bucket | 409 / R2NoOverwriteError |
| — | UPDATE/DELETE API |
| — | 管理 UI からの上書き保存 |

## DET 参照

| 節 | 内容 |
|----|------|
| §4 | no-overwrite · 修正は新 ID（R2-02） |
| §6 | OBS-NF-01 / R2 INSERT ONLY |
| sub/WaveE-devR2 | session/index パス · run_info |
| §5 | component OUT — immutability |

> 実装: `libs/ihl/core/r2_io.py` · civ-os `backend/src/utils/r2.ts` 思想同等。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-R2-03 |
| design_section | §4 no-overwrite |
| test_case_id | ST-05-03 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-03 — OBS-R2-01/02/03 · OBS-NF-01（`revrtm-003` · 4 req 束ね）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `libs/ihl/core/r2_io.py` · `event_store.py` |
| ADR | `ADR-H-28-devR2-運用固定-v1-DRAFT.md` · `sub/WaveE-devR2-詳細設計-v1-DRAFT.md` |
| API | commit/upload 成功応答 · 失敗 `R2_WRITE_FAILED` |
| テスト | ST-05-03 · ST-05-09（RX-UX-07 UPDATE 拒否 · **planned**） |

## gap 注記

- **planned 維持**: append 方針は実装済だが **専用 system 断言**（同一キー再 put 明示 TC）が RTM 上 planned。
- **OBS-R2-01 分離**: R2-01 は INSERT ONLY 原則、R2-03 は **同一キー拒否の機械担保**。
- **cross-repo**: civ-os `r2.ts` と IHL `r2_io.py` は **契約同等** — 個別 E2E は NF-09 人間ゲート側。
