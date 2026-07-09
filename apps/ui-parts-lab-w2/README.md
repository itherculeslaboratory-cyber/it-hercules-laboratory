# ui-parts-lab-w2（実験ラボ）

| 用途 | フォルダ | URL | ポート |
|------|----------|-----|--------|
| **ベースライン（触らない比較用）** | `apps/ui-parts-lab` | http://localhost:3100/ | 3100 |
| **W2 実験・改修用** | `apps/ui-parts-lab-w2`（本フォルダ） | http://localhost:3101/ | 3101 |

## なぜ2つ？

- **3100** はチェックポイントとして固定。ここを壊しても比較・復元の基準が残る。
- **3101** で UI 改善・ScreenDef 実験を自由に行う。ぐちゃぐちゃになっても 3100 はそのまま。

## 起動

```bash
# リポジトリルートから
npm run ui-parts-lab      # ベースライン 3100
npm run ui-parts-lab-w2    # 実験 3101

# または本フォルダで
npm run dev
```

## ブランチ

作業ブランチ: `feature/ui-parts-lab-w2-checkpoint`

## 注意

- `apps/web` とは別。本番 Web には直接影響しない。
- 共有: `packages/ihl-ui-catalog` · `screen-defs` · ルートの w2 スクリプト（predev）— 実験で catalog を大きく変える場合はベースラインとの差分に注意。
