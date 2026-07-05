# W2 Screen Override Ownership

並列ワーカー（最大 55）が **同一ファイルを編集しない** ための所有権ルール。

## 衝突防止戦略

| 層 | パス | 所有者 | 編集者数 |
|----|------|--------|----------|
| **プリミティブ** | `primitives.ts` | platform | 1（全ワーカー禁止） |
| **画面** | `{mockBase}.ts` | 1 walkId / mockBase | 1 |
| **マージ出力** | `../overrides.generated.ts` | CI / codegen | 0（自動生成・手編禁止） |
| **型** | `../overrides.types.ts` | platform | 1 |

### キー衝突検出

`node scripts/w2-merge-overrides.mjs` が全 `SCREEN_OVERRIDES` + `PRIMITIVE_OVERRIDES` をマージし、**同一 `component_id` が 2 ファイルに存在すれば exit 1**。

## ファイル命名

- 正本: `{componentPrefix}.ts`（catalog component id のプレフィックス = mock PNG ベース名と **大抵** 一致）
- 例外: mock `ihl-07-board-post-愚痴` → componentPrefix `ihl-07-board-post---`（ファイル名サニタイズ）
- 例: `ihl-05-obs-search-grid.ts` → walkId `05a`
- walkthrough 上 2 画面が同一 mock を共有する場合（`07o`/`07b`, `PR`/`PRnotif`）は **mockBase ファイル 1 つを共同所有** — manifest の `sharedMockAliases` を参照

## ワーカーが編集してよいファイル

1. **自分の** `registry/overrides/{mockBase}.ts` のみ
2. 必要なら `components/features/` 配下の **その画面専用** 実装ファイル（新規追加可）

## ワーカーが編集してはいけないファイル

- `primitives.ts`
- `overrides.generated.ts`
- `overrides.ts`（thin re-export）
- `../generated/**`
- 他画面の `{mockBase}.ts`

## エクスポート契約

```typescript
import type { CatalogComponent } from "../overrides.types";

/** @owner {walkId} */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "{mockBase}__ContentArea": MyContentArea,
  // ...
};
```

- キーは `catalog/ui-components.yaml` の `id` と完全一致
- 空オブジェクト `{}` 可（auth 画面は primitives が正本）

## ビルド前チェック

```bash
node scripts/w2-merge-overrides.mjs   # 衝突検出 + generated 更新
cd apps/ui-parts-lab && npm run build
```

## 所有権一覧

正本: [`scripts/w2-screen-worker-manifest.json`](../../../scripts/w2-screen-worker-manifest.json)
