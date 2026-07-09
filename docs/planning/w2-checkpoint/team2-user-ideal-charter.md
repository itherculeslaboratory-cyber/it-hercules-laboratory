# Team 2 — ユーザー理想 Charter v1

> **ステータス**: **確定 · 人間 Go 済み**（2026-07-05）  
> **ブランチ**: `feature/ui-parts-lab-w2-checkpoint`  
> **上位**: [`05-運用/queues/00-W2-checkpoint-orchestration-v1.md`](../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md) · [`.cursor/rules/ihl-w2-checkpoint-max-quality.mdc`](../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc)

---

## 1. 人間 Go 記録

| 項目 | 内容 |
|------|------|
| **合図** | `W2 Ideal Charter Go` |
| **日付** | 2026-07-05 |
| **回答形式** | `Q1:C Q2:A Q3:C Q4:A Q5:B Q6:A Q7:A Q8:B Q9:C Q10:A+C` |
| **品質方針** | **最大限の品質を常に出す。二層クォータ: Auto+Composer 最大 · API 節約。** |

---

## 2. 3100 vs 3101 ポリシー

| 役割 | フォルダ | URL | ポート | ルール |
|------|----------|-----|--------|--------|
| **ベースライン（比較用）** | `apps/ui-parts-lab` | http://localhost:3100/ | 3100 | **ソース変更禁止**（ユーザー明示指示まで） |
| **W2 実験・改修** | `apps/ui-parts-lab-w2` | http://localhost:3101/ | 3101 | **checkpoint 作業の唯一の書込先** |

**理由（ユーザー）**: 両方並べて判断しやすい。実験がぐちゃぐちゃになっても 3100 が残る。

**起動**:

```bash
npm run ui-parts-lab      # 3100 ベースライン
npm run ui-parts-lab-w2   # 3101 実験
```

**共有資源への注意**: `predev` は `screen-defs` / `packages/ihl-ui-catalog` を更新する。catalog を大きく変える実験は 3100 にも波及しうる — 必要なら w2 専用生成パスを Team 8 が提案する。

---

## 3. Q1–Q10 回答（確定）

| # | 質問（要約） | 回答 | 決定内容 |
|---|--------------|------|----------|
| **Q1** | まず手を付ける P2 改善 | **C** | **3クリック以内の導線**を最優先 |
| **Q2** | 3クリック厳格度 | **A** | **厳守** — タブ統合・画面整理・削除も OK |
| **Q3** | 取引 06b 系の画面数 | **C** | **3101 で 1画面 stepper（A）を試作** → 3100 と比較してから凍結 |
| **Q4** | GMO 振込 UI の位置 | **A** | 取引フロー内 **インライン**（独立 23 画面は使わない方針） |
| **Q5** | 共通ナビ（深葉 chrome）の範囲 | **B** | **観測・マーケット等の主要機能のみ**（全 55 画面一律ではない） |
| **Q6** | 06soc orphan 画面 | **A** | **削除** |
| **Q7** | ホーム（01）リンク密度 | **A** | **減らしてすっきり**（ショートカット整理） |
| **Q8** | mock PNG vs lab 見た目 | **B** | **使いやすさ優先** — レイアウト変更 OK |
| **Q9** | 空状態・エラー整備範囲 | **C** | **55 画面それぞれ最低 1 状態**（全 263 部品までは checkpoint 外） |
| **Q10** | checkpoint 完了条件 | **A + C** | 下記 §4 |

---

## 4. W2 checkpoint 完了条件（Q10: A + C）

### 4.1 必須（Q10-A）

| # | 条件 |
|---|------|
| 1 | `apps/ui-parts-lab-w2` で **`npm run build` PASS** |
| 2 | **55/55 walkId** の UX/parity スコアカード PASS（Team 3 · Tier B 監査済み） |
| 3 | **P2 横断 5 項目** 各 1 完了（本 charter の Q1–Q7 方針に沿った実装） |

### 4.2 追加（Q10-C · 品質方針から自動付与）

| # | 条件 |
|---|------|
| 4 | **EXEC → AUDIT → [x]** 全 Wave で監査 PASS（粉飾 [x] 禁止） |
| 5 | Tier B scorecard **≥ 90**（B≥28 · C≥28）— [`.cursor/rules/ihl-w2-checkpoint-max-quality.mdc`](../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc) |
| 6 | W2 機械ゲート **G1–G6 PASS**（Team 10） |
| 7 | Team 5 **BLOCKER = 0** または Accepted（人間明示） |
| 8 | **3100 ベースライン未改変**（比較可能の維持） |

**含めない（今回 checkpoint 外）**: `apps/web` 統合 · ux-walkthrough（3000）の必須目視（任意推奨） · 全 263 部品の 4 状態完備（Q9-C により 55 画面最低 1 で足りる）

---

## 5. 方針サマリー（rationale）

1. **導線第一**: IHL 固定 NFR（主要導線 3 クリック以内）を checkpoint の主戦場とする。マーケット抽選→取引の hop 過多は W2 遷移監査でも指摘済み。
2. **実験は 3101 のみ**: stepper 統合・GMO インライン・chrome 拡張は 3101 で試し、3100 で「以前」を見比べる（Q3:C）。
3. **情報量を抑える**: 全画面 chrome（Q5:B 却下）より、高頻度ドメインに限定。ホームはハブ過多を整理（Q7:A）。
4. **dead-end 排除**: 06soc は削除（Q6:A）。
5. **mock より UX**: ±2px 厳守より使いやすさ（Q8:B）— walkthrough drift は許容範囲内で記録。
6. **4 状態は画面単位**: 263 部品全数はスコープ外。触った 55 画面に empty/error/loading の最低 1 つ（Q9:C）。
7. **品質 > コスト（二層クォータ）**: checkpoint 期間は [`.cursor/rules/ihl-w2-checkpoint-max-quality.mdc`](../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc) が一般ルールより優先。**Auto + Composer クォータは節約禁止** — 並列 max 25 · 1 walkId = 1 エージェント · EXEC/AUDIT 分離で、狭いコンテキストを量で補う。**API クォータ（Standard/High/Codex）は節約必須** — 人間明示 or Team 5 BLOCKER エスカレーション時のみ。Wave 4 実装も Auto 並列が既定（Codex は別途明示時）。

---

## 6. P2 実装順序（Wave 4 推奨 DAG）

本 charter に基づく Team 4/8 の実装順:

```text
(1) 3-click 導線設計（06a tab / 06lot 統合）
 → (2) 06b stepper 試作（3101 のみ）
 → (3) GMO インライン（3101）
 → (4) 06soc 削除 + 導線整理
 → (5) 01 ホーム密度削減
 → (6) ObsDeepNav / chrome 拡張（観測・マーケットのみ）
```

**Wave 4 着手前提**: 本 charter Go 済み **かつ** 人間 **`W2 P2 実装 Go`**（別ゲート）。

---

## 7. 実験スコープ

| 含む | 含まない |
|------|----------|
| `apps/ui-parts-lab-w2/**` | `apps/web/**` |
| `docs/planning/w2-checkpoint/**` | SwitchBot 秘密の保存・ログ |
| 共有: `screen-defs` · `ihl-ui-catalog`（Merge Bot 経由） | `apps/ui-parts-lab`（3100）ソース改変 |

---

## 8. 参照

- 質問原文: チャット 2026-07-05 Team 2 10 問（改訂版）
- 遷移監査: [`docs/planning/quantum/W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md)
- 実験 README: [`apps/ui-parts-lab-w2/README.md`](../../apps/ui-parts-lab-w2/README.md)
