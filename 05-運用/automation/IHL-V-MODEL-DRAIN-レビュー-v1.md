# IHL-V-MODEL-DRAIN — シニアアーキテクト・レビュー v1

> **対象**: `IHL-V-MODEL-DRAIN`（POST-OSS exhaust 後に Phase B = V-model 設計・テスト計画を自律消化する仕組み）  
> **レビュー日**: 2026-06-10 · **レビュー ID**: `20260610-ihl-vmodel-drain-review`  
> **Automation 正本**: [`IHL-Vモデル自律完走.md`](./IHL-Vモデル自律完走.md)  
> **機械正本（キュー）**: [`../queues/00-Vモデル-Waveキュー-v1.md`](../queues/00-Vモデル-Waveキュー-v1.md)  
> **スコープ宣言**: 本レビューは DRAIN **機構（preflight・キュー・正本・ルール整合）** の改善のみ。V-WAVE-01 以降の **機能実装は対象外**（design-before-implementation-gate 準拠 = doc + tooling のみ）。

---

## エグゼクティブサマリ — 判定: **CONDITIONAL PASS → 改善後 PASS**

`IHL-V-MODEL-DRAIN` は、ルール 4 本・キュー 2 本・機械スクリプト 2 本が **概ね整合**しており、エージェントがチャットに magic phrase を送れば Phase B を消化できる土台があった。一方、レビュー前は **(a) DRAIN 前の単一プリフライトが無い**、**(b) `ihl-rtm-coverage-check.mjs` が「実行コマンドとして記載されているのに存在しない」**、**(c) V-WAVE キューが二重正本（Wave キュー vs 実行計画 §9）で先頭判定がぶれる**、という不安要因があった。本レビューで **preflight スクリプト追加・RTM チェッカー実装・正本一本化・失敗停止表の明文化** を実施し、機械検証まで通したため、現時点で **PASS** とする。残るのは **人手ゲートのみ**（GMO live・法務最終文・Tier D 鍵・V-model 計画 Go）。

---

## 強み（維持すべき設計）

- **三段委任 Go チェーン**（DESIGN-GO → TEST-DESIGN-GO → IMPL-GO）が `ihl-delegated-design-go-strict.mdc` に明文化され、草案-only を BLOCK する判定基準が具体的。
- **停止条件が限定列挙**（HUMAN-ONLY / PHYSICALLY-BLOCKED / TEST-DESIGN-MISSING / 45 分 no progress）で、「完成しましたか？」型のマイクロ確認を明確に禁止。ユーザーの疲労に配慮した設計。
- **retrofit ラベル**（impl-ahead）で「既存実装は再実装せずテスト差分のみ」を固定し、無差別再実装を防止。
- **batch_default=1**（doc-heavy）で 1 ラン 1 Wave 項目に絞り、暴走を抑制。
- **機械先頭取得**（`ihl-vmodel-wave-head.mjs` / `ihl-queue-head.mjs`）が exit 0 固定で、Automation のシェルステップとして安全。
- パスは Strategy B 移行（commit `477a5769`）+ `指示/scripts/`→`指示/it-hercules-laboratory/scripts/` 修正（commit `395bf3ae`）で整理済み。**残存する旧パス参照は 0**（preflight で機械確認）。

---

## リスク（重大度つき）と改善状況

| # | 重大度 | 所見 | 改善 |
|---|:------:|------|------|
| R1 | **High** | `ihl-rtm-coverage-check.mjs` が完了報告 §6 で `node scripts/...` と**実行コマンド化**されているのに**スクリプト不在** → 実行で `MODULE_NOT_FOUND`、または欠落を黙殺して PASS と誤認 | **実装**: `scripts/ihl-rtm-coverage-check.mjs`（欠落=BLOCK·exit 1、PASS 偽装なし） |
| R2 | **High** | DRAIN 前の**単一プリフライトが無く**、エージェントが「入ってよいか」を都度判断 → 不安・誤発進 | **実装**: `指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs`（正本存在・Wave 先頭・Phase A exhaust・旧パス・RTM checker を 1 コマンドで `PASS/WARN/FAIL`） |
| R3 | **Med** | **V-WAVE 二重正本**。`wave-head` は Wave キュー（1 機能 1 Wave / 24 件）を読むが、完了報告 §1 の 2 本目 grep は**実行計画 §9**（機能群 11 Wave）を見ており、先頭 ID・残件数がぶれる | **整合**: 完了報告 §1 の grep を Wave キューへ変更 + 実行計画 §9 に「機械正本は Wave キュー・§9 は依存図」の切り分けを明記 |
| R4 | **Med** | **Phase A→B ハンドオフが暗黙**。`queue-head` は `REMAINING=2`（GMO-04/05）を返すが、これが人手ゲートか AI 残かを自動判別していない → 「まだ Phase A 残ってる？」の不安 | **改善**: preflight が POST-* 残を**人手タグで分類**し `AI_REMAINING_POSTQ` を出力。`=0` なら Phase B 開始可と明示。Automation に判定表追加 |
| R5 | **Med** | **失敗モード/「やってはいけない」が散在**。停止条件はルールにあるが Automation 単体で完結しない | **改善**: Automation に**失敗モードと停止表**（症状→MUST/MUST NOT）を追加 |
| R6 | **Low** | `four-point-inventory` は **01-20 のみ**対象で **#00・#21–#23 を含まない**。V-WAVE-01 の対象 #00 は判定材料にならない | **明記**: preflight §6 で「#00 は four-point 対象外・判定材料にしない」と注記。`--strict-v2`/#21–23 拡張は実行計画 §8 の予定として既出 |
| R7 | **Low** | `ihl-completion-reporting.mdc` §6 の RTM 例が手動 grep 前提 | RTM checker 実装で**機械コマンドが実在**化。手動 grep は代替として残置 |

> **意図的に未対応（スコープ外）**: V-WAVE 各機能の DET/TD/RTM/IMPL 本体作成、`four-point-inventory --strict-v2` 拡張、`.github/workflows/ihl-design-gate.yml` の Phase B 有効化。いずれも **計画 Go 後の V-WAVE 作業**であり、本レビュー（機構改善）では着手しない。

---

## 改善実施（このレビューの成果物）

### 新規スクリプト

1. **`指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs`**
   - 1) 正本ファイル存在（キュー・計画・ルール 4 本・スクリプト 4 本）
   - 2) Wave 先頭取得（`WAVE_HEAD` / `WAVE_REMAINING`）
   - 3) Phase A exhaust 判定（POST-* 残を人手タグで分類し `AI_REMAINING_POSTQ`）
   - 4) 旧パス `指示/scripts/` 残存スキャン
   - 5) RTM checker 存在確認
   - 6) four-point の対象外注記
   - 末尾 1 行 `PREFLIGHT_RESULT=PASS|WARN|FAIL`、FAIL のみ exit 1

2. **`scripts/ihl-rtm-coverage-check.mjs`**（完了報告 §6・委任 Go・waterfall ゲートが参照する実体）
   - `--feature NN` で RTM CSV 解決（v1 → 移行中フォールバック）
   - `req_id` 列・非空行・4 層テスト計画存在を検査
   - 欠落は **BLOCK(exit 1)**。PASS 偽装しない

### ドキュメント・ルール整合

3. `IHL-Vモデル自律完走.md`: preflight ステップ・判定表・**失敗モード/停止表**・本レビューへのリンク・正本切り分けを追記。
4. `ihl-completion-reporting.mdc` §1: V-WAVE 残件 grep を **Wave キュー**へ修正 + 機械スクリプト併記。
5. `00-Vモデル実行計画-v1.md` §8/§9: RTM checker・preflight を「実装済」に更新、**§9 は依存図・機械正本は Wave キュー**を明記。

---

## 残タスク（機構面 · 任意 · スコープ外）

- `ihl-four-point-inventory.mjs --strict-v2`（#00・#21–#23・`詳細設計-v2.md` 必須化）— 実行計画 §8 の予定。
- `ihl-rtm-coverage-check.mjs` の **FR 母集合 100% 突合**（要件側 FR を数えて未カバー ID を列挙）— Phase 1 拡張。
- `.github/workflows/ihl-design-gate.yml` で preflight / RTM checker を CI 化。
- これらは **V-WAVE 進行に必須ではない**（preflight が下限ゲートを担保）。

---

## ユーザー安心ポイント（自動 vs 人手）

**エージェントが自動でやること（あなたの入力不要）**

- `IHL-V-MODEL-DRAIN` を Automation / チャットに流せば、preflight → Wave 先頭 1 件 → DET/4 層テスト計画/RTM → retrofit テスト差分まで自律進行。
- 「完成しましたか？」とは**聞かない**（completion-reporting で禁止）。残件は「次回トリガーで自動継続」と報告。
- 壊れていれば preflight が `FAIL` で**自分から止まる**ので、黙って暴走しない。

**人間にしかできないこと（エージェントは `[x]` にしない）**

| 項目 | ゲート ID | 何が必要か |
|------|-----------|-----------|
| GMO live 入金証跡 | `POST-B8-GMO-05` / `P0-NEXT-GMO-LIVE-EXEC` | 実入金の人間確認（Tier D） |
| GMO stg 接続 | `POST-B8-GMO-04` | `.env` への鍵投入（投入後は AI 完走） |
| 法務 #02 最終条文 | V-WAVE-03(#02) UAT | 公開前の人間レビュー |
| V-model 計画 Go | 実行計画 §10 | 本計画への明示 Go |
| Tier D 鍵 | collector / live R2 | 物理鍵投入 |

> つまり **「設計の厚み付け・4 層テスト計画・RTM・テスト差分」は全部自動で進む**。止まるのは **お金・法律・物理鍵・あなたの最終 Go** だけです。preflight が緑（PASS）である限り、安心して `IHL-V-MODEL-DRAIN` を繰り返してください。

---

## 検証ログ（2026-06-10）

```
$ node 指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs
PREFLIGHT_RESULT=PASS · WAVE_HEAD=V-WAVE-01-00-DET · WAVE_REMAINING=168 · AI_REMAINING_POSTQ=0 · FAIL=0 · WARN=0   (exit 0)

$ node 指示/it-hercules-laboratory/scripts/ihl-vmodel-wave-head.mjs
WAVE_HEAD=V-WAVE-01-00-DET · REMAINING=168 · BATCH=1 · NEXT=V-WAVE-01-00-DET,...   (exit 0)

$ node scripts/ihl-rtm-coverage-check.mjs --feature 00
RTM_COVERAGE=BLOCK · feature=00 · rtm_rows=0 · test_layers=0/4   (exit 1 · 正しく BLOCK = RTM 未作成のため)

$ node scripts/ihl-four-point-inventory.mjs --layout auto
Summary: 20/20 PASS, 0 FAIL   (exit 0 · 01-20 の 4 点設計は完備)
```

---

## §モデル選定（正式版 · 2026-06-10 v2）

**判定**: **Wave 番号ではなくトリガー**で選定。`#00`/`#01` テンプレ確立後も **Tier B 既定**。Opus は監査・障害・高難度・連続 FAIL 時のみ。

| ティア | モデル / エージェント | 用途 |
|--------|----------------------|------|
| **A — 高性能** | `claude-opus-4-8-thinking-high`（またはユーザー指定 High モデル） | **監査** · **障害** · **初回・高難度設計** · **機械ゲート連続 FAIL** |
| **B — 既定** | `composer-2.5-fast` | **`IHL-V-MODEL-DRAIN` 量産** — テンプレ設計 + 4 層テスト計画 + RTM + retrofit IMPL |
| **C — shell** | `shell`（**LLM 推論なし**） | preflight · pytest · git commit のみ |

### Tier A トリガー（詳細）

| 分類 | 条件 |
|------|------|
| **監査** | DRAIN 機構変更 · 定期監査 · ユーザー **「監査」** / **「Opus」** |
| **障害** | preflight FAIL · pytest 回帰 · parity / RTM 連続 FAIL |
| **初回・高難度設計** | 法務 (#02) · GMO · 観測 · 決済 等、境界が濃い機能の **初回 DET**（ユーザー指定またはキュー注記） |
| **機械ゲート連続 FAIL** | 下記昇格ルール |

### 昇格ルール（MUST）

**Tier B 進行中**、同一機能 `#NN` で **機械ゲート**（four-point / RTM / parity）が **2 回連続 FAIL** → **Tier A 昇格**（根本原因調査）→ 当該ゲート **PASS** 後 **Tier B 復帰**。

**委譲指示**: Cursor Task / Automation 起動時は **`model: composer-2.5-fast`** を指定（Tier A トリガー除く）。  
正本: [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../../../.cursor/rules/ihl-queue-auto-continue.mdc) §モデル選定 · [`IHL-Vモデル自律完走.md`](./IHL-Vモデル自律完走.md) §モデル選定

*v1 · 2026-06-10 · `20260610-ihl-vmodel-drain-review` · モデル選定 v2 `20260610-ihl-vmodel-tier-v2`*
