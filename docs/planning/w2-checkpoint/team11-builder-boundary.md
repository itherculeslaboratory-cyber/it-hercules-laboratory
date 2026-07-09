# Team 11 — UIbuilder / ScreenDef 編集境界（Wave 3）

> **ステータス**: **Wave 3 出力**（2026-07-05）  
> **正本**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) · [`ownership-table.md`](./ownership-table.md) · [`team5-skeptic-findings.md`](./team5-skeptic-findings.md)

---

## 1. ステータスとスコープ

| 項目 | 内容 |
|------|------|
| 対象 | `#16` UIbuilder · `screen-defs/**` · 3101 `W2ScreenRenderer` |
| checkpoint 期間 | **3101 実験** — 正本 screen-def の大規模改変は Team 8 + Merge Bot 経由 |
| 3100 | **読取のみ** — renderer / catalog 非改変 |
| `apps/web` | **全チーム禁止** |

---

## 2. W2 checkpoint で編集可 vs 凍結

| 層 | 編集 | 備考 |
|----|------|------|
| `apps/ui-parts-lab-w2/src/w2/**` | ✅ 3101 専用 | registry 上書き · route redirect · deep chrome |
| `screen-defs/{walkId}.json` | ⚠️ Merge Bot 直列 | 1 walkId = 1 所有者（Team 8） |
| `packages/ihl-ui-catalog/**` | ⚠️ codegen / override manifest | 手編集禁止（generated） |
| `catalog/ui-components.yaml` | Team 13 のみ | 直列 merge |
| `apps/ui-parts-lab`（3100） | ❌ 凍結 | 比較ベースライン |
| `#16` Builder 本番 canvas | ❌ checkpoint 外 | lab 上の `16` / `16e` walkthrough のみ |

**原則**: 3101 は **runtime 上書き**（`W2_COMPONENT_OVERRIDES` · query param · redirect）を優先し、共有 screen-def の破壊的変更は Wave 5 Merge 前に人間確認。

---

## 3. ScreenDef スキーマ境界

| フィールド | 編集可否 | 3101 実験での扱い |
|------------|----------|-------------------|
| `screen_id` / `route` | Team 8 | walkId 不変 · route は walkthrough 正本 |
| `layout` | Team 8 | `auth`（O*）/ `standard` — W2ScreenRenderer が解釈 |
| `nodes[]` | Team 8 | `component_id` + `region` — catalog 解決必須 |
| `transitions[]` | Team 8 | `from` = `hotspot.N` or `{nodeId}.{action}` |
| `ihl-brand-chrome` node | Team 8 + Team 4 | **Q5:B**: 3101 では `deep-chrome-screens.ts` で表示フィルタ |
| `notes` | 任意 | 監査メモのみ |

**禁止**: screen-def 無しで 3101 だけ存在する walkId（parity FAIL）— 除外は `excluded-screens.ts` + generate-data のみ。

---

## 4. #16 マルチノード · hotspot 衝突（WRN-W2-001）

| リスク | 内容 |
|--------|------|
| **衝突** | `SaveBar` / `CanvasDropZone` も `hotspot.0` を発火 → グローバル `hotspot.0→16e` に誤マッチ |
| **症状** | `wireProps.onAction`（L39: `${nodeId}.${action}` 優先）が bare `hotspot.N` にフォールバック |
| **要件** | マルチ node 画面では bare `hotspot.N` **禁止** — `part-0.hotspot.N` のみ |

**Wave 4 正本 transition 目標（`16.json`）**

| from | to | 用途 |
|------|-----|------|
| `part-0.hotspot.0` | `16e` | 入口例 |
| `part-0.hotspot.1` | `17picker` | UI テンプレ選択 |
| `part-0.hotspot.2` | `18photo` | 写真解析 |
| （なし） | — | 保存 · ブロック追加 — transition なし（no-op） |

**3101 暫定**: `W2ScreenRenderer.wireProps` は screen-def `transitions` をそのまま使用。Builder 編集結果を 3101 に載せる前に **transition 一意性監査**必須。

**関連 walkId**: `16` · `16e` — scorecard 現状 FAIL（85）→ Wave 4 で B/C≥28 目標。

---

## 5. 3101 W2ScreenRenderer vs 3100 乖離ポリシー

| 項目 | 3100 | 3101 |
|------|------|------|
| Renderer | catalog 標準 | `W2ScreenRenderer` + `resolveW2CatalogComponent` |
| コンポーネント | catalog 正本 | `registry.ts` 7 上書き（01 · 06a · 06b） |
| ルーティング | walkthrough hotspots | + `route-redirects.ts` · `?tab=` · `?stage=` |
| BrandChrome | screen-def 通り全件 | **Q5:B** 観測・マーケット深葉のみ |
| 比較 | ベースライン | 実験 — **凍結判断前に side-by-side** |

**凍結ゲート（Q3:C）**: stepper 試作完了 → 人間が 3100 vs 3101 URL を比較 → Accept 後に Team 8 が screen-def 正本化。

---

## 6. Merge Bot / Team 8 所有権

```text
screen-defs/{walkId}.json          ← Team 8（manifest 1:1）
packages/ihl-ui-catalog/overrides  ← Team 8（mockBase 1:1）
catalog/ui-components.yaml         ← Team 13 直列 merge のみ
```

**prebuild 波及**（WRN-W2-003）: w2 `prebuild` が screen-defs / catalog を再生成 → 3100 表示に差分が出うる。大変更は **w2 専用生成パス ADR**（Wave 3 Team 4 §リスク）を先に。

---

## 7. Wave 4 受入条件（AC-16）

| ID | 条件 |
|----|------|
| AC-16-01 | `16.json` transitions が **node-scoped のみ**（bare `hotspot.N` 0 件） |
| AC-16-02 | 外部遷移 3 件（16e · 17picker · 18photo）が `part-0` からのみ発火 |
| AC-16-03 | SaveBar / CanvasDropZone 操作が誤遷移しない |
| AC-16-04 | `16` scorecard total≥90 · B≥28 · C≥28 |
| AC-16-05 | `StatePanel` 4 状態の最低 1 つ（Q9:C） |
| AC-16-06 | 3101 `#16` に W2 専用 override **なし**（catalog 共有） |
| AC-16-07 | 3100 ソース 0 diff |
| AC-16-08 | Team 8 Merge Bot 直列 commit |
| AC-16-09 | WRN-W2-001 #16 行 RESOLVED |
| AC-16-10 | Builder 新規 walkId は index.json + scorecard 後に sidebar 表示 |
| AC-16-11 | screen-def 破壊なし — redirect / override のみ（他 walkId 同様） |

---

## 8. 参照

- [`apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx`](../../apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx)
- [`screen-defs/16.json`](../../screen-defs/16.json) · [`screen-defs/16e.json`](../../screen-defs/16e.json)
- Team 5 WRN-W2-001 · TRN-W2-004（graph duality）
