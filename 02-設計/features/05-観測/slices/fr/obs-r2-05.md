---
slice_id: 05-MICRO-fr-023
type: fr-1id
req_id: OBS-R2-05
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-023 — OBS-R2-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.4 OBS-R2-05 · RTM `status=deferred`
- **acceptance**: OBS-R2-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測索引（solid `index.json` · `env-samples-index.json` · IHL `manifests/latest/`）は **追記型（末尾追記）** で運用し、一覧の最新性を **UPDATE/DELETE なし** で表現すること。IHL 側 latest pointer 方式（D-01 未決 · ADR-H-04）は **deferred** — 設計確定後 retrofit。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 新 capture/session/env-sample 登録イベント |
| **Transform** | 索引 JSON 末尾に **新行追記** · latest pointer 更新（方式 A/B 未決） |
| **OUT** | 更新された index ファイル（新 revision）· 旧 index 参照可能 |

## 受入基準

1. solid `index.json` は commit 成功時に **追記行追加** — ファイル全体 replace 禁止（OBS-SOL-02 整合）。
2. env `env-samples-index.json` も同型 append（OBS-ENV-02 · R2-02 訂正時は新 index 行）。
3. **deferred 維持**: UAT-05-05（acceptance review）— latest pointer 運用の **人手受入** 待ち。
4. D-01（H-04）: 方式 A 実体コピー vs 方式 B pointer — **人間確定前は実装固定しない**。
5. no-overwrite: 同一 index キー再 put 拒否（OBS-R2-03 ペア）。

## In / Out 境界

| In | Out |
|----|-----|
| capture/env 登録成功 | index 追記行 |
| user/session スコープ索引 | latest 参照 |
| — | Parquet searchable 投影（#18 · 別 pipeline） |
| — | index 行の in-place 編集 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | env index 追記 |
| §7 | latest index · D-01 未決 |
| sub/WaveE-devR2 | `…/index.json` パス |
| §4 | INSERT ONLY 索引 |

> 要件 §4.4: civ-os `index.json` / IHL `manifests/latest/` pointer。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-R2-05 |
| design_section | §7 latest index |
| test_case_id | UAT-05-05 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-05 — OBS-R2-05 · OBS-REP-05 · OBS-RAG-01 · OBS-IMG-05 · OBS-NF-08（deferred/xref 混在 · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `solid_commit.py` index 追記 |
| ADR | `ADR-H-04`（D-01 latest 方式）· `ADR-H-28` |
| Env | OBS-ENV-02 env-samples-index |
| テスト | UAT-05-05 · **deferred** — pytest 単体断言なし |

## gap 注記

- **deferred 明示**: append 実装は部分存在（SOL-02 注記）だが **latest 運用 UAT** が未了。
- **D-01 ブロック**: pointer vs コピー確定まで acceptance TC を existing にしない（粉飭禁止）。
- **cross-bucket**: IHL manifests/latest と civ-os solid index は **別 tree** — id マッピングで連鎖。
