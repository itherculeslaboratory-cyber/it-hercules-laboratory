# PLAN: 観測画像 性能 Phase 0(ネイティブ img への切替)

## ゴール

観測画像の表示を認証付き blob fetch(N+1・キャッシュ不可)からネイティブ `<img src>` に切り替え、ブラウザキャッシュと並列読み込みを効かせる。STATUS.md 次タスク#1。**スコープは Phase 0 のみ** — サムネイル専用エンドポイント(Phase 1)や signed URL(Phase 2)には踏み込まない。

## 前提(必ず先に確認)

- 観測 READ は Scope A で認証免除済み(`IHL_AUTH_REQUIRED=1` は WRITE のみ)。ただし **STATUS.md に「VPS/Pages 再デプロイ(観測 READ 認証免除の反映)」が未完タスクとして残っている** — つまり本番 API はまだ画像 GET に認証を要求している可能性がある。ローカルで `apps/api` を起動し、無認証で画像 GET(`apps/api/routes/observation.py` の該当ルート)が 200 を返すことを確認してから着手。401 なら先にルート側の免除実装を確認する
- 詳細計画: `docs/planning/backlog/image-perf-and-cost.md` の Phase 0 節を精読

## 触るファイル

- `apps/web/src/**/AuthenticatedImage.tsx`(または相当のコンポーネント。`grep -r "AuthenticatedImage" apps/web/src` で全使用箇所を列挙)
- 使用箇所のページ/コンポーネント(props 変更が波及する場合)
- 読むだけ: `apps/api/routes/observation.py`、`docs/planning/backlog/image-perf-and-cost.md`

## 手順

1. `AuthenticatedImage` の全使用箇所と、現在の fetch 実装(Authorization ヘッダ付与、blob URL 生成、revoke)を把握
2. 画像 GET が公開(無認証 200)であることをローカル API で実証
3. コンポーネントを書き換え: fetch+blob をやめ、`<img src={imageUrl} loading="lazy" decoding="async">` を返す。alt は既存の意味を維持
4. blob URL の `URL.revokeObjectURL` 等の後始末コードを除去(残すとメモリリーク対策コードが死蔵する)
5. `npm run test`(vitest)と `npx playwright test e2e/ihl-observation-ver1* e2e/ihl-observation-ver2*` で検証
6. 開発サーバで観測一覧を開き、DevTools Network で (a) 画像が並列取得される (b) リロード時に disk cache から返る、を目視確認

## エッジケース(弱いモデルが見落とす点)

- 画像 URL が相対パスか絶対 URL か(API と Web が別オリジンなら CORS ではなく単純な img GET なので問題ないが、`next.config` の rewrite 経由かを確認)
- エラー時のフォールバック UI: 旧実装に onError 表示があれば維持。**「読み込み失敗(未実装)」のような WIP 文言は UI に出さない**(repo 禁止事項)
- Next.js の `next/image` は使わない(Cloudflare Pages のイメージ最適化課金・互換の論点があるため Phase 0 ではプレーン `<img>`。eslint が `@next/next/no-img-element` で警告する場合は該当行のみ disable コメント)
- 認証が必要な画像(観測以外)にも同コンポーネントが使われていないか — 使われていれば観測用のみ切替え、他は現状維持
- SSR でのハイドレーション不一致(blob URL は CSR 専用だったはず — 切替でむしろ解消するが、loading skeleton の条件分岐が blob 前提なら修正)

## 受け入れ条件

- [ ] 観測一覧・詳細で画像が表示される(Playwright の観測系 spec が green)
- [ ] DevTools でリロード時に画像が disk/memory cache から返ることを確認(スクリーンショット添付)
- [ ] `grep -r "AuthenticatedImage" apps/web/src` の残存箇所が意図したもの(認証必須の非観測画像)のみ
- [ ] `npm run test` green、`npm run build` 成功
- [ ] UI に WIP/未実装文言なし
