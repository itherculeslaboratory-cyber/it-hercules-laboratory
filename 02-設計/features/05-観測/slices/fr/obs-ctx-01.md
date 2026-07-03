---
slice_id: 05-MICRO-fr-050
type: fr-1id
req_id: OBS-CTX-01
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-050 — OBS-CTX-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.10 OBS-CTX-01 · RTM `status=deferred`
- **acceptance**: OBS-CTX-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

文脈バー（05ctx）から **WorkflowContext（種族 + `stage_name` + 任意 `phase`）** を設定し、観測入力 05i / 検索 05a / テンプレ一覧 05tl へ **`?species=&stage=&scope_route=`** で引き継ぐこと（ADR-H-15 §2/§5）。**プリフィルのみ** — taxonomy 確定は常にユーザー（OBS-SOL-04 · OBS-CTX-02）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 文脈バー選択 · URL クエリ · localStorage/profile（優先順は CTX-03） |
| **Transform** | WorkflowContext 解決 → 遷移 URL にクエリ付与 → 各画面ヘッダ/DD プリフィル |
| **OUT** | 05i/05a/05tl のプリフィル UI — **commit 値は入力確定のみ** |

## 受入基準

1. ADR-H-15 §5: 種族チップは **観測ドメイン（05*）のみ** · ボトムシート（作業中断なし）。
2. 入力/検索/テンプレで **同一 WorkflowContext** がクエリ経由で参照可能。
3. UAT-05-01（deferred 束ね）: OBS-CTX-01 · OBS-SOL-06/08 等 — acceptance review 待ち。
4. OBS-CTX-02: コンテキスト変更は **保存レコードを自動上書きしない**（確定は入力画面）。
5. OBS-TGT-08 / QR-03: 個体・前回セッション プリフィルは WorkflowContext **補助**（主は individual_id）。

## In / Out 境界

| In | Out |
|----|-----|
| 文脈バー選択 | クエリ付き遷移 URL |
| URL クエリ（優先） | 各画面プリフィル |
| localStorage/profile | — |
| — | コンテキストからの自動 commit |
| — | 全画面常時表示バー（ADR-H-14 境界） |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 | WorkflowContext 伝播 |
| §7 P4 | コンテキスト優先度 |
| §10 | 文脈バー · ボトムシート |
| ADR-H-15 | §2/§5 契約 |

> UI: [`ui/コンテキスト.md`](../ui/コンテキスト.md) · 遷移: `05-観測-入力-遷移設計-v1.md` · WaveB: `sub/WaveB-context-詳細設計-v1-DRAFT.md`。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-CTX-01 |
| design_section | §1.2 §7 P4 伝播 |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-01 — OBS-CTX-01 · OBS-SOL-06/08 · OBS-DIG-01/02 · OBS-NF-05（`revrtm-004` · review/deferred 混在）。

## 実装 surface

| 層 | 参照 |
|----|------|
| UI | `ui/コンテキスト.md` · 文脈ボトムシート |
| Web | `WorkflowContext` hook · query 伝播 |
| 遷移 | input/search/templates クエリ契約 |
| ADR | ADR-H-15 · ADR-H-14 拡張 |
| テスト | UAT-05-01 acceptance review |

## gap 注記

- **deferred**: 設計・UI 契約は確定 — **E2E acceptance 未完了**（UAT-05-01 束ね）。
- **SOL-04 整合**: プリフィル ≠ 確定 — 粉飭で auto-commit と記載しない。
- **CTX-02/03**: 永続優先順・確定境界は別 FR — 本 FR は伝播のみ。
