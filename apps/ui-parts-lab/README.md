# IHL UI Parts Lab — W2 遷移プロトタイプ

> **本番実装とは完全分離** — `apps/web` を変更しません。  
> **W2 部品カタログ + ScreenDef 駆動**の遷移確認用ラボ（port **3100**）。  
> 正本計画: [`docs/planning/quantum/QUANTUM-W2-IMPL-CATALOG-REMEDIATION.md`](../../docs/planning/quantum/QUANTUM-W2-IMPL-CATALOG-REMEDIATION.md)

---

## 再開コマンド（1 行）

```bash
cd apps/ui-parts-lab && npm run dev
```

リポジトリルートから:

```bash
npm run ui-parts-lab
```

| 操作 | コマンド |
|------|----------|
| 開発起動 | `npm run dev`（port **3100** · `predev` で codegen 自動実行） |
| ビルド | `npm run build` |
| プレビュー | `npm run preview` |

**URL**

| 画面 | URL |
|------|-----|
| オンボーディング入口 | http://localhost:3100/s/O1 |
| **ホーム（再開の目安）** | http://localhost:3100/s/01 |
| 部品一覧 | http://localhost:3100/parts |

初回のみ `npm install`（`apps/ui-parts-lab` 内）。

---

## これは何か

- **W2 parts lab** — `packages/ihl-ui-catalog` の生成部品 + `ScreenRenderer` で 55 画面の遷移をクリック確認
- **`apps/web` ではない** — API・認証なし · 本番マージは別 PR
- 遷移監査: [`docs/planning/quantum/W2-TRANSITION-AUDIT.md`](../../docs/planning/quantum/W2-TRANSITION-AUDIT.md)

---

## 主要パス

| パス | 役割 |
|------|------|
| `packages/ihl-ui-catalog/` | 263 部品 TSX · `ScreenRenderer` · feature 実装 |
| `packages/ihl-ui-catalog/src/registry/overrides/` | 画面別 hand UI（1 mockBase = 1 ファイル） |
| `screen-defs/` | 55 ScreenDef JSON（遷移・ノード構成） |
| `02-設計/_ui-global/ux-walkthrough/walkthrough.js` | 遷移正本 · ホットスポット座標 |
| `scripts/w2-generate.mjs` | shard → 部品 TSX + screen-defs 生成 |
| `scripts/w2-merge-overrides.mjs` | override 衝突検出 + `overrides.generated.ts` |
| `apps/ui-parts-lab/src/pages/ScreenPage.tsx` | ScreenDef 読込 · ルーティング `/s/:screenId` |

---

## 再開チェックリスト（2026-07-03 時点）

### 済み（P0 + P1）

- [x] **遷移配線** — 55 画面 · P0/P1 修正完了 · `npm run build` PASS（[`W2-TRANSITION-AUDIT.md`](../../docs/planning/quantum/W2-TRANSITION-AUDIT.md)）
- [x] **観測深葉** — `hot()` + `ObsDeepNav` · 11 画面 + マーケット深層ホーム導線
- [x] **血統フロー** — 正本 **05b → 03** · 率カード **03 → 03m**（`?metric=`）· 03m 戻り **03**
- [x] **ホーム 01** — ハブショートカット · 06a/07a 各 2 チップ · 設定→17picker 2 ホップ
- [x] **ScreenDef 駆動** — ui-parts-lab は mock PNG クリックから `ScreenRenderer` 実装へ移行済み

### 残り（P2 · 次セッション）

- [ ] **screen-def  parity** — `01`/`16` の `onNavigate` 直書きを hotspot 索引へ（§3 表）
- [ ] **16 hotspot 衝突** — node-scoped transitions（`${nodeId}.hotspot.N`）
- [ ] **3 クリック簡略化** — 抽選 5 ホップ → `06a` タブ状態 · 取引 Stage 統合 · GMO インライン化（§4–5）
- [ ] **グローバル chrome** — 深葉画面への ホーム + プロフィール常駐
- [ ] **06soc** — orphan stub の扱い確定

再開時は監査 §5 roadmap から 1 項目選び、`npm run build` で regress 確認。

---

## 新規画面 / override の追加

### 1. codegen（screen-def + 部品スケルトン）

```bash
node scripts/w2-generate.mjs
```

`walkthrough.js` · quantum shards · `SCREEN_TRANSITION_OVERRIDES`（`w2-generate.mjs` 内）を反映。

### 2. hand UI（override）

1. 所有権: [`packages/ihl-ui-catalog/src/registry/overrides/README.md`](../../packages/ihl-ui-catalog/src/registry/overrides/README.md)
2. 対象 walkId は [`scripts/w2-screen-worker-manifest.json`](../../scripts/w2-screen-worker-manifest.json) を参照
3. `registry/overrides/{mockBase}.ts` に `SCREEN_OVERRIDES` を export（**他画面ファイルは触らない**）

### 3. マージ + ビルド

```bash
node scripts/w2-merge-overrides.mjs
cd apps/ui-parts-lab && npm run build
```

`predev` / `prebuild` は上記 2 コマンドを自動実行。

---

## 操作

| 操作 | 説明 |
|------|------|
| 左サイドバー | walkthrough 同型の画面ジャンプ |
| 画面内ボタン | ScreenDef `transitions` 経由で遷移 |
| 部品カタログ | `/parts` — 263 部品一覧 |
| フッター | ← 戻る · ホームへ |

---

*UI 作業一時停止（2026-07-03）。再開は本 README → `/s/01` 目視 → P2 1 項目。*
