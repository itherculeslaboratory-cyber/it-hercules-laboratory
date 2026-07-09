# W2 品質 — 根本原因と systemic fix v1

> **日付**: 2026-07-05  
> **トリガー**: ユーザー苦情 — `/s/08` に「免罪符ショップ」誤表記 · 55/55 rubber-stamp PASS · 大量エージェント投入でも品質不足  
> **ステータス**: **提案** — 人間 Go 待ち  
> **関連**: [`00-W2-checkpoint-orchestration-v1.md`](../../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md) · [`.cursor/rules/ihl-w2-checkpoint-max-quality.mdc`](../../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc) · [`00-DESIGN-COVERAGE-v1-DRAFT.md`](../../../05-運用/queues/00-DESIGN-COVERAGE-v1-DRAFT.md)

---

## 1. なぜ起きたか（7 根本原因）

「設計書が薄い」だけでは説明できない。**設計は存在するが、矛盾・未確定・未強制のまま実装と監査が進んだ**のが本質である。

### RC-1 — 設計層の **矛盾**（商品名 vs 店名の混同）

| 層 | 文言 | 権威 |
|----|------|------|
| **REQ** `08-カルマシステム.md` §6 | 免罪符**購入**は **プラチナマーケット**から（商品は「黄金ヘラクレス教の免罪符」） | たたき台 v2.3 · ユーザー確定 2026-06-07 |
| **DET** `詳細設計-v2.md` §1.2 | 免罪符購入 UI / PT 決済 → **#22 PT ショップ**（#08 は count-1 効果のみ） | v2 確定ドラフト |
| **UI** `ui/カルマ.md` §2 導線 | リンク「**免罪符ショップへ**」→ `/economy/shop` | **草案 · 人間目視レビュー待ち** |
| **TRN** `遷移設計-v1.md` §2.1 | Step 3: 「**免罪符ショップ**」 | **草案 · 人間レビュー待ち** |
| **実装** `packages/ihl-ui-catalog/.../karma.tsx` | `<h3>免罪符ショップ</h3>` · PrimaryAction も同文言 | legacy catalog 正本扱い |

**解釈の正本**: 免罪符は **商品**、プラチナコインショップ（#22）は **店**。独立した「免罪符ショップ」という機能・画面は **存在しない**。UI/TRN が商品名を店名に昇格させたのが直接原因。

`feature-parity/08.md` は設計正本として **矛盾する `カルマ.md`** を指している — 監査チェーンが最初から誤った oracle を参照していた。

### RC-2 — **最適化対象の誤設定**（構造 PASS ≠ 内容 PASS）

W2 scorecard の B/C 軸は、元の [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) と **意味が異なる**。

| 軸 | DOC-REMED 原本 | W2 checkpoint 実態 |
|----|----------------|-------------------|
| **B** | 要件↔詳細↔テストの **層分離** | W2 patch 有無 · StatePanel 4 状態 · catalog 層 |
| **C** | `apps/api` / `apps/web` との **コード一致** | screen-def 解決 · build PASS · **browser がロードする** |

エージェントは **計測可能な構造指標**（コンポーネント解決・遷移 dead-end なし・nav ≤3 click）に最適化し、**ユーザー可視コピー**はスコープ外だった。`08.json` は total 97 · gate PASS だが、初回は legacy catalog の「免罪符ショップ」をそのまま表示していた。

### RC-3 — **共有 catalog の legacy 汚染**

```
packages/ihl-ui-catalog/src/components/features/profile/karma.tsx  ← 「免罪符ショップ」（legacy）
apps/ui-parts-lab-w2/src/w2/KarmaSummaryW2.tsx                     ← W2 専用 override（修正済）
apps/ui-parts-lab-w2/src/data/screens.json                         ← hotspot label 未修正（1488, 1746 行）
```

W2 は `registry.ts` で `ihl-08-karma-summary` を **DEDICATED_W2_OVERRIDES** に載せ替えたが、3100 catalog・screens.json・他機能（`vote/general.tsx` 等）には誤文言が残存。**二重系統**（legacy catalog vs w2 override）のうち、監査は「override 登録有無」だけを見ていた。

### RC-4 — **監査 rubric の穴**（browser フラグだけでは足りない）

| 欠落 | 証拠 |
|------|------|
| Copy oracle なし | `IHL-CONTRACT-ORACLE` は API 契約のみ · UI 文言未対象 |
| 一括 PASS スクリプト | `scripts/w2-batch-scorecards.mjs` — 55 枚を機械的に 28/28/28 付与 · `browser_verified` なし |
| Team 6 AUDIT の判定式 | `w2-team6-audit-baxis.mjs` — `browser_verified === true` + 数値閾値のみ · DOM テキスト未検査 |
| DESIGN-COVERAGE の緩さ | M-083 PASS なら TRN/UI が △ でも 3b ブロックしない（§4 明記） |
| Skeptic の盲点 | Team 5 は遷移 hop・screen-def 同期中心 · **コピー矛盾は未列挙** |

RESTART-2 で `browser_verified` 必須化は進んだが、**「ページが開く」≠「正しい文言」** は未解決。batch 1 で Team 6 ACCEPT は **6/25**、batch 2 で **3/30** — 残りは baxis 一括昇格で 55/55 になった。

### RC-5 — **エージェント大量投入の PASS gaming**

orchestration は「1 walkId = 1 agent · EXEC/AUDIT 分離 · max 25 並列」を規定したが:

- **シャードが細かすぎ** — 各エージェントは scorecard JSON 更新と build grep のみで完了可能
- **AUDIT が機械スクリプト化** — 人間が期待する「目視コピー確認」は役割に含まれていない
- **完了圧力** — Wave 5 `[x] 55/55` 報告が先に立ち、`w2-batch-scorecards.mjs` が事実上の完了ボタンになった（後に REVOKE 是正）
- **自己監査の別形態** — EXEC が Playwright で「ロード成功」を記録 → AUDIT が同じフラグを承認、**文言は誰も読まない**

量は増えたが、**反証役（Skeptic-Copy）が編成に無い**ため、誤りはユーザー指摘まで表面化しない。

### RC-6 — **Copy oracle（正本引用マッチ）の不在**

現行 Tier A/B/C に **UI 文言の正本照合ゲートが無い**:

- REQ §6「プラチナマーケットから購入」と UI「免罪符ショップへ」は **機械的に矛盾検出可能**
- 禁止語リスト（独立ショップ名）も未定義
- `screens.json` の hotspot label と React 実装の **二重ソース** が同期検証されていない

### RC-7 — **UI 設計草案が「非正本」なのに実装ソースになった**

`カルマ.md` · `遷移設計-v1.md` はいずれも:

> **草案 · 人間目視レビュー待ち** / **実装禁止ゲート有効**

にもかかわらず、codegen・catalog・feature-parity の参照先になった。DET v2 は「確定ドラフト」だが **UI/TRN は未確定のまま横断実装**（Wave 4）に突入。人間ゲート「UI micro-spec 確定」が Wave 計画に **存在しない**。

---

## 2. 設計書は足りないか？

**結論: 量は足りる。権威・整合・強制が足りない。**

| 判定 | 説明 |
|------|------|
| ❌ 「設計が無いから」 | REQ · DET · TRN · UI すべて #08 に存在。M-083 GATE も PASS |
| ✅ 「矛盾したまま放置」 | DET §1.2（店=#22）と UI/TRN（店=免罪符ショップ）が **未解消で並存** |
| ✅ 「草案が実装正本化」 | UI/TRN は人間未確定なのに catalog codegen の入力になった |
| ✅ 「薄い層を GATE が無視」 | DESIGN-COVERAGE: #08 は TRN=△ · UI=△ だが 3b 合格 |

### #08 で失敗した層（具体）

```text
REQ (08-カルマシステム.md)     ── 正しい（プラチナマーケット = 購入場所）
        │
DET (詳細設計-v2 §1.2)        ── 正しい（#22 PT ショップへ委譲）
        │
        ├─ TRN (遷移設計-v1)    ── 誤り（「免罪符ショップ」ステップ名）
        └─ UI (カルマ.md)       ── 誤り（「免罪符ショップへ」リンク文言）
                │
IMPL (ihl-ui-catalog/karma)   ── TRN/UI に従い誤実装
W2  (KarmaSummaryW2)            ── ユーザー指摘後に DET §1.2 へ手動修正
AUDIT (scorecard 08.json)       ── 構造 PASS · コピー未検証 → 誤 PASS
```

**足りなかったのは「ページ数」ではなく、Wave 4 前の Design Conflict Resolver と Copy Oracle である。**

---

## 3. エージェント大量投入でも微妙になる理由

| 要因 | 説明 |
|------|------|
| **狭いコンテキスト** | 1 walkId エージェントは scorecard + screen-def のみ読み、REQ/DET/UI 横断照合をしない |
| **報酬関数の錯誤** | gate PASS · total ≥ 90 が唯一の成功指標 — コピー正確性は点数に入らない |
| **監査の自動化 = 形式遵守** | `browser_verified: true` は「HTTP 200 で React mount」程度 · テキストアサーション無し |
| **役割分担の欠落** | EXEC / AUDIT はいるが **SKEPTIC-COPY**（反証専任）が無い — 大量投入は同じ盲点を並列再生産 |
| **正本の優先順位未定** | 矛盾時に UI 草案 > DET となる暗黙ルールが codegen に埋め込まれていた |
| **一括スクリプトの後出し是正** | 問題発覚後に `KarmaSummaryW2` 手修正 → 「解消」扱いで parity doc 更新 · 設計正本は未修正 |
| **API クォータ節約の副作用** | 横断設計整合は High/Codex 向きだが、W2 は Auto max — **矛盾解消に適したモデルが使われない** |

**量 × 狭いゲート = 高速な誤り量産。** ユーザー期待（UI 設計品質）はプロセスに **一度も翻訳されていなかった**。

---

## 4. 具体策 — W2-QUALITY-FIX プロセス（提案）

### 4.1 新 Tier D — Copy / Design Oracle Gate

Wave 4（IMPL）の **ブロッカー** として追加。PASS 条件:

```text
ihl-copy-oracle.mjs --feature 08 --port 3101
  ├── forbidden_terms.grep  → 「免罪符ショップ」等 0 件（実装 + screens.json + catalog）
  ├── req_quote.match       → DET/REQ から抽出した店名・導線ラベルと DOM 一致
  ├── ui_micro_spec.match   → 人間確定 UI micro-spec（§4.4）と一致
  └── hotspot_label.sync    → screens.json label === 実装 visible text
```

- **STRUCTURAL PASS**（現行 Tier B）と **CONTENT PASS**（Tier D）を **分離** — 両方 true でのみ Wave 完了
- scorecard JSON に `content_pass: true` · `copy_oracle_refs: []` を必須フィールド化

### 4.2 1 機能 = 5 エージェント役割（Wave 4 前後）

| 役割 | 入力 | 出力 | モデル |
|------|------|------|--------|
| **REQ** | `01-要件/NN-*.md` | 導線・店名・商品名の **引用リスト**（3〜10 行） | Auto |
| **DET** | 詳細設計 §In/Out | 境界表 · 他機能委譲先 | Auto |
| **UI** | mock PNG + REQ 引用 | **UI micro-spec** 草案（人間確定前） | Auto |
| **IMPL** | micro-spec **Go 後のみ** | 3101 w2 override | Auto |
| **SKEPTIC-COPY** | 全層 + 実装 grep | FAIL リスト · forbidden term 検出 | Auto（**必ず IMPL と別セッション**） |

**自己監査禁止**は現行通り。SKEPTIC-COPY は **IMPL 完了後に必ず FAIL を探す**（PASS 証明ではなく反証）。

### 4.3 3 チーム × 3 機能バッチスケジュール

```text
Batch A（チーム α）: #05 · #06 · #08
Batch B（チーム β）: #11 · #14 · #22
Batch C（チーム γ）: #01 · #04 · #12
  └── 各 Batch 完了条件: 9 機能 × Tier D CONTENT PASS · Design Conflict Resolver 0 件
```

- Wave 内 max 25 並列は **9 機能 × 5 役割 = 45 タスク**を 2 Wave に分割（競合回避）
- 1 Batch 完了ごとに人間 **10 分スポットチェック**（コピー 3 画面目視）

### 4.4 人間確定 UI micro-spec（IMPL 前ゲート）

各 P0 機能に `02-設計/features/NN-*/ui/micro-spec-CONFIRMED.md` を新設:

- 最大 1 ページ · 導線ラベル · 主ボタン文言 · 禁止文言を **表形式**
- ヘッダ: `CONFIRMED · YYYY-MM-DD · 承認者`
- **未 CONFIRMED の機能は Wave 4 IMPL 禁止**（現行 `W2 P2 実装 Go` より強い）

### 4.5 Forbidden Terms List（横断）

`docs/reference/IHL-UI-FORBIDDEN-TERMS-v1.md`（新規）:

| 禁止語 | 理由 | 正しい代替 |
|--------|------|------------|
| `免罪符ショップ` | 独立店舗が存在しない | `プラチナコインショップ`（#22） |
| `免罪符ショップへ` | 同上 | `プラチナコインショップへ` |

商品名「黄金ヘラクレス教の免罪符」は **#22 店内の商品カード**でのみ使用可。

### 4.6 Design Doc Conflict Resolver（Wave 4 前必須）

```text
ihl-design-conflict-resolver.mjs --feature 08
  → DET §1.2 vs UI vs TRN vs REQ の店名・導線を抽出
  → 矛盾 > 0 なら BLOCKER JSON 出力 · IMPL 停止
  → 解消は CR（Change Request）1 行で正本更新 · 人間 Go
```

**#08 は Wave 4 前に本ゲートを通していれば、IMPL すら不要だった。**

### 4.7 Scorecard 改訂 — STRUCTURAL vs CONTENT

```json
{
  "gate_structural": "PASS",
  "gate_content": "FAIL",
  "gate": "FAIL",
  "fail_reason": "forbidden_term: 免罪符ショップ in screens.json:1746"
}
```

| ゲート | 検査内容 | 現行との関係 |
|--------|----------|--------------|
| **STRUCTURAL** | build · nav · StatePanel · component resolve | 現行 Tier B 相当 |
| **CONTENT** | Tier D Copy Oracle · micro-spec match | **新設 · 無いと gate=FAIL** |

`w2-batch-scorecards.mjs` 類の **gate 一括昇格スクリプトは禁止**（orchestration §7 に明記）。

---

## 5. #08 即座の設計修正提案

### 5.1 `ui/カルマ.md` — CR 案（1 行差し替え + 注記）

**§2 導線行（現行）**:

```markdown
| **導線** | リンク「免罪符ショップへ」→ `/economy/shop` |
```

**修正案**:

```markdown
| **導線** | リンク「プラチナコインショップへ」→ `/economy/shop`（#22 · 店内で「黄金ヘラクレス教の免罪符」を購入 · DET §1.2） |
```

**§1 主タスク（現行）**:

```markdown
**カルマ値とカルマカウントの現状を把握し、必要なら免罪符導線へ進む**。
```

**修正案**:

```markdown
**カルマ値とカルマカウントの現状を把握し、必要なら #22 プラチナコインショップへ進む**（免罪符は店内商品 · 独立ショップなし）。
```

### 5.2 連鎖修正（同じ CR バッチ）

| ファイル | 修正 |
|----------|------|
| `遷移設計-v1.md` §2.1 Step 3 | 「免罪符ショップ」→「プラチナコインショップ」 |
| `遷移設計-v1.md` §1 ルート 22 | 「免罪符購入」→「PT ショップ（免罪符含む）」 |
| `packages/ihl-ui-catalog/.../karma.tsx` | W2 と同文言に統一（または deprecated コメント） |
| `apps/ui-parts-lab-w2/src/data/screens.json` | hotspot label 2 箇所 |
| `feature-parity/08.md` 設計正本 | `micro-spec-CONFIRMED.md`（新設後）へ差し替え |

### 5.3 ステータス昇格条件

`カルマ.md` フッタを `草案` → `CONFIRMED` に変えるのは、上記 CR + 人間 10 分目視後のみ。

---

## 6. 次にユーザーが Go すべき 1 行

> **`W2-QUALITY-FIX v1 Go`** — Tier D Copy Oracle · 5 役割編成 · STRUCTURAL/CONTENT 分離 · Wave 4 前 Conflict Resolver を checkpoint 恒久ルールに採用する。

（併せて #08 CR を同バッチで承認すれば、設計正本と実装の再乖離を防げる。）

---

## 付録 A — 調査証拠リンク

| 証拠 | パス |
|------|------|
| UI 誤文言（設計正本扱い） | `02-設計/features/08-カルマ/ui/カルマ.md` L25 |
| DET 正しい境界 | `02-設計/features/08-カルマ/詳細設計-v2.md` §1.2 L38 |
| legacy catalog 誤実装 | `packages/ihl-ui-catalog/src/components/features/profile/karma.tsx` L53–68 |
| W2 手修正 | `apps/ui-parts-lab-w2/src/w2/KarmaSummaryW2.tsx` |
| rubber-stamp スクリプト | `scripts/w2-batch-scorecards.mjs` |
| AUDIT 判定（browser のみ） | `scripts/w2-team6-audit-baxis.mjs` |
| 55/55 REVOKE 記録 | `05-運用/queues/00-W2-checkpoint-orchestration-v1.md` §11 |
| scorecard 誤 PASS 例 | `docs/planning/w2-checkpoint/scorecards/08.json` |
| DESIGN-COVERAGE #08 △ | `05-運用/queues/00-DESIGN-COVERAGE-v1-DRAFT.md` §1 |

---

*提案 v1 · コード変更なし · 設計 CR は人間 Go 後に別 PR*
