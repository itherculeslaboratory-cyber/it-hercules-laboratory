# IHL キュー自律完走 — Cursor Automation

> **キュー正本**: [`00-完成定義と実行キュー-v1.md`](../queues/00-完成定義と実行キュー-v1.md)  
> **Skill**: [`.cursor/skills/ihl-design-impl-audit/SKILL.md`](../../../../.cursor/skills/ihl-design-impl-audit/SKILL.md)  
> **ルール**: [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../../../.cursor/rules/ihl-queue-auto-continue.mdc) · [`.cursor/rules/ihl-completion-reporting.mdc`](../../../../.cursor/rules/ihl-completion-reporting.mdc)

---

## 目的

**一度セットアップするだけ** — ユーザーが「続けて 全部」を繰り返さなくてよい。

Cursor Automation が **`IHL-QUEUE-DRAIN`** をエージェントに送り、[`00-完成定義と実行キュー-v1.md`](../queues/00-完成定義と実行キュー-v1.md) の **POST-B8 → POST-OSS** キューを **HUMAN-ONLY / PHYSICALLY-BLOCKED** に当たるまで自動消化する。

| ユーザーがやらないこと | Automation がやること |
|------------------------|----------------------|
| 毎回「続けて 全部」と入力 | スケジュール / 手動 Run で `IHL-QUEUE-DRAIN` 送信 |
| 完了確認への返答 | 機械検証 5 ブロック報告のみ |
| キュー先頭の把握 | `ihl-queue-head.mjs` で QUEUE_HEAD 取得 |

---

## Magic phrase（ユーザーは入力不要）

```
IHL-QUEUE-DRAIN
```

Automation の **Instructions は必ずこの行で始める**。エージェントは [ihl-queue-auto-continue.mdc](../../../../.cursor/rules/ihl-queue-auto-continue.mdc) を適用し、確認なしで次項目へ進む。

---

## トリガー（エディタで 1 つ以上選択）

| トリガー | 推奨設定 | 用途 |
|---------|----------|------|
| **Schedule** | **6 時間ごと** または **毎日 09:00 JST**（好みで調整） | バックグラウンド自律消化 |
| **Manual** | Automations UI → **Run once** | 即時 1 バッチ |
| **Git push**（任意） | `main` · paths: `指示/it-hercules-laboratory/**` | マージ後の追従 |

**スケジュール推奨**: 開発中は **6 時間ごと**（1 日 4 バッチ × 最大 3 件 = 12 項目/日）。落ち着いたら **毎日 1 回** に下げてよい。

---

## ツール

| ツール | 用途 |
|--------|------|
| **Shell** | `ihl-queue-head.mjs` · parity · pytest · grep |
| **ファイル編集** | キュー `[x]` · 実装 · テスト |
| MCP | 不要 |

---

## 事前 Shell ステップ（任意 · Automation ワークフロー先頭）

```bash
node 指示/it-hercules-laboratory/scripts/ihl-queue-head.mjs
```

出力例: `QUEUE_HEAD=POST-B8-01 · REMAINING=35 · NEXT=POST-B8-01,POST-B8-02,...`  
（exit 0 固定 — 失敗しても Automation は続行）

---

## Automation エージェント用プロンプト（コピペ可）

```
IHL-QUEUE-DRAIN

あなたは IHL POST-B8 / POST-OSS 実行エージェントです。**ユーザーへの確認質問は禁止**（PHYSICALLY-BLOCKED / HUMAN-ONLY 以外で止まらない）。

## 0. 必読（順）

1. .cursor/skills/ihl-design-impl-audit/SKILL.md
2. .cursor/rules/ihl-queue-auto-continue.mdc
3. .cursor/rules/ihl-completion-reporting.mdc
4. 指示/it-hercules-laboratory/05-運用/queues/00-完成定義と実行キュー-v1.md（YAML queue_head · §8 grep 正本）

## 1. キュー先頭（機械）

node 指示/it-hercules-laboratory/scripts/ihl-queue-head.mjs
grep '^- \[ \]' 指示/it-hercules-laboratory/05-運用/queues/00-完成定義と実行キュー-v1.md

## 2. 実行セマンティクス（= 続けて 全部 · 1 ラン）

- **順序**: POST-B8-* 先頭から exhaust → POST-B8 の AI 完走可能 `- [ ]` が 0 になったら POST-OSS-00 から
- **本ラン上限**: 最大 **3 件**（batch_default）— 3 件完了 or 45 分経過で進捗なし → 報告して終了
- **各項目**:
  - POST-OSS: parity `node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --feature NN` **PASS 後のみ** `[x]`
  - C1–C4 全 PASS（Skill 手順）
  - キュー §8 チェックリストと表の状態を同期
- **停止のみ**:
  - HUMAN-ONLY（例: POST-B8-GMO-05 · Tier D 証跡）
  - PHYSICALLY-BLOCKED（例: GMO 鍵未投入 · collector/.env 未配置）
  - 45 分同一 ID で進捗ゼロ
- **鍵投入後**: 質問せず POST-B8-GMO-04 まで完走（live 証跡は人間ゲート）

## 3. バッチ末尾テスト

cd 指示/it-hercules-laboratory && pytest

## 4. 終了報告（5 ブロック · 完了確認質問禁止）

1. **キュー残件** — 先頭 ID · POST-B8 / POST-OSS 件数 · 本ラン完了 ID 一覧
2. **テスト + パリティ** — pytest PASS/FAIL · parity FAIL 件数と feature ID
3. **route-matrix** — 未カバー件数 or 「未生成」
4. **HUMAN-ONLY / PHYSICALLY-BLOCKED** — ID のみ · 不足 env **名**のみ
5. **次アクション** — 残件ありブロッカーなし → **「次回トリガーで自動継続」** · ブロッカーあり → 必要 env 名のみ

## 禁止

- 「完成しましたか？」「全部完了？」「確認お願いします」
- parity FAIL 中の POST-OSS [x]
- HUMAN-* の [x] 捏造
- 秘密値の出力
- 実装禁止ゲート未通過スコープへの新規実装（IHL HUMAN-IMPL-SIGNOFF 済み POST-B8/POST-OSS のみ）
```

---

## ワンタイムセットアップ（3 ステップ）

### 1. Automation を作成

1. Cursor → **Automations** → **New automation**
2. **Name**: `IHL キュー自律完走`
3. **Trigger**: Schedule（**6h** または **daily 09:00 JST**）+ 任意 Manual / Git push
4. **Tools**: Shell + ファイル編集（Agent 既定）
5. **Instructions**: 上記プロンプト全文を貼付（**先頭行 `IHL-QUEUE-DRAIN` 必須**）
6. **Repository**: `civilization-os`
7. **Save** → **Enable**

### 2. 初回手動 Run で動作確認

Automations UI → **Run once** → 終了報告に `QUEUE_HEAD` · 完了 ID · pytest 結果があることを確認。

### 3. ブロッカー env のみ人間が投入

| ID | 必要なもの（変数名のみ） |
|----|-------------------------|
| HUMAN-COLLECTOR-KEYS | `collector/.env` · `ENV_COLLECTOR_*` |
| HUMAN-23-GMO-LIVE | `GMO_AOZORA_CLIENT_ID` / `GMO_AOZORA_CLIENT_SECRET` 等 |

鍵投入後は **追加の「続けて」不要** — 次スケジュールで Automation が自動再開。

---

## Glass で下書きを開く（Agents Window）

「IHL キュー自律完走 Automation を開いて」と依頼 → `open_automation` で prefilled エディタを開く。

```json
{
  "templateId": null,
  "prefillWorkflowData": {
    "name": "IHL キュー自律完走",
    "description": "IHL-QUEUE-DRAIN · POST-B8→POST-OSS · batch 3 · HUMAN/PHYSICAL でのみ停止",
    "instructions": "IHL-QUEUE-DRAIN\n\n（上記プロンプト全文をここに貼る）"
  }
}
```

> **Note**: MCP `build_automation_prefill_url` 未提供時は `cursor-app-control` の `open_automation` または手動コピペ。

---

## 伴走監査との役割分担

| Automation | 役割 |
|------------|------|
| **本ドキュメント（キュー自律完走）** | キュー消化 · 実装 · `[x]` · pytest |
| [`IHL-伴走監査-週次.md`](./IHL-伴走監査-週次.md) | 読取専用 · parity `--ci` · 偽完了検知 |

両方有効化してよい（スケジュールをずらすとよい: 例 キュー 6h · 監査 週次月曜）。

---

## 手動フォールバック（Automation なし）

| 方法 | 操作 |
|------|------|
| チャット | `IHL-QUEUE-DRAIN` と 1 行送る |
| CLI 先頭確認 | `node 指示/it-hercules-laboratory/scripts/ihl-queue-head.mjs` |
| 従来 | `続けて 全部`（同一セッション内は auto-continue 継続） |

---

## 関連

- [`.github/workflows/ihl-parity-gate.yml`](../../../../.github/workflows/ihl-parity-gate.yml) — PR parity CI
- [`00-監査役-設計実装伴走ゲート-v1.md`](../design/00-監査役-設計実装伴走ゲート-v1.md)
