# IHL V-model 自律完走 — Cursor Automation

> **Wave キュー正本（機械）**: [`00-Vモデル-Waveキュー-v1.md`](../queues/00-Vモデル-Waveキュー-v1.md) — `ihl-vmodel-wave-head.mjs` が読む唯一の機械正本  
> **計画正本（人間・依存図）**: [`00-Vモデル実行計画-v1.md`](../queues/00-Vモデル実行計画-v1.md) — §9 の V-WAVE 一覧は **依存グルーピングの説明用**（機械消化は Wave キュー）  
> **Phase A 完走後に使用** — POST-OSS exhaust 完了が前提（残 POST-* は HUMAN-ONLY / PHYSICALLY-BLOCKED のみ）  
> **レビュー**: [`IHL-V-MODEL-DRAIN-レビュー-v1.md`](./IHL-V-MODEL-DRAIN-レビュー-v1.md)  
> **ルール**: [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../../../.cursor/rules/ihl-queue-auto-continue.mdc) · [`.cursor/rules/ihl-waterfall-v-model-gate.mdc`](../../../../.cursor/rules/ihl-waterfall-v-model-gate.mdc)

---

## 目的

**POST-OSS 完了後** — ユーザーが「続けて V-model」を繰り返さなくてよい。

`IHL-V-MODEL-DRAIN` で **V-WAVE-01 (#00)** から **1 Wave 項目 / ラン**（doc-heavy）を自律消化する。

| ユーザーがやらないこと | Automation がやること |
|------------------------|----------------------|
| 毎回「続けて V-model」と入力 | Schedule / Run once で `IHL-V-MODEL-DRAIN` 送信 |
| Wave 先頭の把握 | `ihl-vmodel-wave-head.mjs` |
| 4 層テスト計画 + RTM 作成 | 当該 Wave の DET → TD → RTM → IMPL（retrofit test） |

---

## モデル選定（正式 · 2026-06-10 v2）

> **選定基準**: **Wave 番号ではなくトリガー**。`#00`/`#01` テンプレ確立後も **Tier B 既定**。

| ティア | モデル / エージェント | 使う場面 |
|--------|----------------------|----------|
| **A — 高性能** | `claude-opus-4-8-thinking-high`（またはユーザー指定 High モデル） | **監査** · **障害** · **初回・高難度設計** · **機械ゲート連続 FAIL** |
| **B — 既定** | `composer-2.5-fast` | **`IHL-V-MODEL-DRAIN` 量産** — テンプレ設計 + 4 層テスト計画 + RTM + retrofit IMPL |
| **C — shell** | `shell` サブエージェント（**LLM 推論なし**） | preflight · pytest · git commit のみ |

### Tier A トリガー

| 分類 | 条件 |
|------|------|
| **監査** | DRAIN 機構変更 · 定期監査 · ユーザー **「監査」** / **「Opus」** |
| **障害** | preflight FAIL · pytest 回帰 · parity / RTM 連続 FAIL |
| **初回・高難度設計** | 法務 (#02) · GMO · 観測 · 決済 等の **初回 DET**（ユーザー指定またはキュー注記） |
| **機械ゲート連続 FAIL** | 同一 `#NN` で four-point / RTM / parity が **2 回連続 FAIL** → Tier A 昇格 · PASS 後 Tier B 復帰 |

**固定モデル禁止** — 親エージェントは Task 委譲ごとに Tier A/B/C と `model` を選ぶ（一括固定は不可）。  
**Cursor Task 起動時の既定は Tier B** — `model: composer-2.5-fast`（Tier A トリガー時のみ Opus）。  
ルール正本: [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../../../.cursor/rules/ihl-queue-auto-continue.mdc) §モデル選定

---

## Magic phrase

```
IHL-V-MODEL-DRAIN
```

**`IHL-QUEUE-DRAIN` との関係**: POST-OSS 空のとき `ihl-queue-head.mjs` が `WAVE_HEAD=` を付与 — 以降は **`IHL-V-MODEL-DRAIN`** 専用 Automation を推奨（batch 1 · doc 中心）。

---

## 事前 Shell ステップ（preflight 必須）

すべて **repo root**（`D:\Programs\civilization-os`）から実行する。

```bash
# 0) preflight — これだけで Phase B に入ってよいか機械判定（exit 1 なら止める）
node 指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs

# 1) 個別確認（preflight 内でも実施済み・人間確認用）
node 指示/it-hercules-laboratory/scripts/ihl-vmodel-wave-head.mjs
node 指示/it-hercules-laboratory/scripts/ihl-queue-head.mjs
```

出力例:

```
PREFLIGHT_RESULT=PASS · WAVE_HEAD=V-WAVE-01-00-DET · WAVE_REMAINING=168 · AI_REMAINING_POSTQ=0 · FAIL=0 · WARN=0
WAVE_HEAD=V-WAVE-01-00-DET · REMAINING=168 · BATCH=1 · NEXT=...
QUEUE_HEAD=POST-B8-GMO-04 · REMAINING=2 · NEXT=POST-B8-GMO-04,POST-B8-GMO-05
```

**preflight 判定の読み方**:

| `PREFLIGHT_RESULT` | 意味 | エージェント動作 |
|--------------------|------|------------------|
| `PASS` | 正本完備・Phase A は人手ゲートのみ残存 | そのまま Wave 先頭を消化 |
| `WARN` | 進行可だが注意（例: `AI_REMAINING_POSTQ>0`） | `AI_REMAINING_POSTQ>0` なら **先に `IHL-QUEUE-DRAIN`**。それ以外の WARN は内容確認後に進行可 |
| `FAIL` | 正本ファイル欠落 | **DRAIN を流さない**。欠落パスを報告して停止 |

> `ihl-queue-head.mjs` の `REMAINING=2` は **GMO-04(PHYSICALLY-BLOCKED) / GMO-05(HUMAN-ONLY)** の人手ゲート。preflight が `AI_REMAINING_POSTQ=0` を返す限り Phase B 開始は正常。

---

## 失敗モードと停止表（エージェント向け）

| 症状 | 原因の候補 | エージェントがやること（MUST） | やってはいけないこと（MUST NOT） |
|------|-----------|-------------------------------|----------------------------------|
| `PREFLIGHT_RESULT=FAIL` | 正本 md / script 欠落・移動 | 欠落パスを 1 行報告して停止 | 推測でファイル再生成・`[x]` 付与 |
| `AI_REMAINING_POSTQ>0` | Phase A 未 exhaust | 先に `IHL-QUEUE-DRAIN` を案内 | Phase B を先行させる |
| `WAVE_HEAD=NONE` | V-WAVE 全完了 or §8 見出し破損 | 完了報告 or 見出し確認 | 空消化で `[x]` 捏造 |
| `RTM_COVERAGE=BLOCK` | RTM/4 層計画 欠落 | doc 作成のみ継続・`-RTM`/`-IMPL` は `[x]` にしない | DELEGATED-TEST-DESIGN-GO 付与 |
| parity FAIL | 設計↔実装不一致 | feature ID 列挙・retrofit 判断 | `-IMPL` を `[x]` |
| 45 分 no progress | 実装不能ループ | 当該 ID + 理由を報告して停止 | 同一作業の無限リトライ |

**人手ゲート（AI は `[x]` 不可）**: `POST-B8-GMO-05`(live 証跡 = `P0-NEXT-GMO-LIVE-EXEC`) · 法務 #02 最終文 · Tier D 鍵 · **V-model 計画 Go**。

---

## Automation エージェント用プロンプト（コピペ可）

```
IHL-V-MODEL-DRAIN

あなたは IHL V-model Phase B エージェントです。**確認質問禁止**（HUMAN / TEST-DESIGN-MISSING / PHYSICAL 以外で止まらない）。

## 0. 必読

1. .cursor/rules/ihl-waterfall-v-model-gate.mdc
2. .cursor/rules/ihl-queue-auto-continue.mdc
3. .cursor/rules/ihl-delegated-design-go-strict.mdc
4. 指示/it-hercules-laboratory/05-運用/queues/00-Vモデル-Waveキュー-v1.md §8

## 1. 先頭 Wave（機械 · preflight 必須）

node 指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs   # PREFLIGHT_RESULT=FAIL なら止める
node 指示/it-hercules-laboratory/scripts/ihl-vmodel-wave-head.mjs
grep '^- \[ \]' 指示/it-hercules-laboratory/05-運用/queues/00-Vモデル-Waveキュー-v1.md | head -1

## 2. 実行（1 ラン = batch_default 1）

- **対象**: 先頭 `- [ ]` **1 件のみ**
- **DET**: `02-設計/features/NN-*/詳細設計-v2.md`（§3 テンプレ準拠）
- **TD**: `03-テスト計画/features/NN-*/` 4 層
- **RTM**: `04-トレーサ/features/NN-*/RTM-v1.csv` · DELEGATED-TEST-DESIGN-GO ログ
- **IMPL**: retrofit pytest 差分のみ · DELEGATED-IMPL-GO · parity PASS
- **停止**: TEST-DESIGN-MISSING · HUMAN-ONLY · 45 分 no progress

## 3. バッチ末尾

cd 指示/it-hercules-laboratory && pytest

## 4. 報告（6 ブロック · ihl-completion-reporting.mdc）

残件あり → **次回 IHL-V-MODEL-DRAIN で自動継続**

## 5. モデル（Tier B 既定 · トリガー昇格）

- Cursor Task 委譲: `model: composer-2.5-fast`（Tier A トリガー時のみ Opus）
- 同一 `#NN` で機械ゲート 2 連続 FAIL → Tier A 昇格 · PASS 後 Tier B 復帰
- 機械のみ: `shell` サブエージェント（preflight · pytest · commit）
```

---

## ワンタイムセットアップ

1. Automations → **New** → Name: `IHL V-model 自律完走`
2. Trigger: Schedule **daily** または POST-OSS 完了後に Manual Run
3. Instructions: 上記プロンプト（先頭 **`IHL-V-MODEL-DRAIN`** 必須）
4. **Enable**

---

## 関連

- レビュー（本 Automation の監査）: [`IHL-V-MODEL-DRAIN-レビュー-v1.md`](./IHL-V-MODEL-DRAIN-レビュー-v1.md)
- Phase A: [`IHL-キュー自律完走.md`](./IHL-キュー自律完走.md)
- preflight: [`../../scripts/ihl-vmodel-preflight.mjs`](../../scripts/ihl-vmodel-preflight.mjs)
- wave-head: [`../../scripts/ihl-vmodel-wave-head.mjs`](../../scripts/ihl-vmodel-wave-head.mjs)
- RTM チェッカー: [`../../../../scripts/ihl-rtm-coverage-check.mjs`](../../../../scripts/ihl-rtm-coverage-check.mjs)
