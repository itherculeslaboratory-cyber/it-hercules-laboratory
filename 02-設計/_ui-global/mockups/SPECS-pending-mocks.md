# 未生成 / 差し替え予定 mock 仕様（2026-06-09 UX レビュー反映）

> **ステータス**: **2026-06-09 AI バッチ完了** — 下表 9 件 + ウォークスルー追加 3 件を生成済。
> PNG 差し替え時は **必ず `scripts/archive-mock.mjs` を先に実行**。

| ファイル | 画面 ID | 必須要素 | 状態 |
|----------|---------|----------|------|
| `ihl-00-terms.png` | O3 | 条項ごとに「本音解説（小5向け）」リンク + 解説動画アイコン · 兄弟リンク維持 | ✅ |
| `ihl-01-nav-home.png` | 01 | 主 CTA 2 つ: 〔観測をはじめる〕→ 計測入力系 · 〔検索〕→ グリッド · 左ナビに血統/論文/Builder · ヘッダ文脈バー | ✅ |
| `ihl-06-market-listing-create.png` | 06list | 観測中個体チェックリスト · その場撮影/選択 · 複数匹まとめ出品 · 主〔出品する〕 | ✅ |
| `ihl-06-market-detail-board-stage2.png` | 06b-s2 | Stage2 ステッパ · 振込確認/配達到着ボタン + 取り消し不可確認モーダル | ✅ |
| `ihl-06-market-detail-board-stage3.png` | 06b-s3 | Stage3 評価完了 · 貢献費 8% 積み上がり · 〔振込案内へ〕 | ✅ |
| `ihl-07-board-hub.png` | 07a | **上部タブ削除** · 4 大ボタンのみ（愚痴/改善/論文/その他） | ✅ |
| `ihl-05-obs-input-row.png` | 05i | 種族 DD · フェーズ DD · 採卵日/誕生日 · 今日が N 日目 · 性別トグル | ✅ |
| `ihl-05-obs-template-list.png` | 05tl | カードにサムネ画像 · `?scope_route=` 絞り込み表示 | ✅ |
| `ihl-10-preference-pairwise.png` | 10 | pairwise 維持 + 「好みに基づく表示」プレビュー帯 | ✅ |

### ウォークスルー追加（§G 解消）

| ファイル | 画面 ID | 状態 |
|----------|---------|------|
| `ihl-06-market-lottery-result-lose.png` | `06lot-lose` | ✅ |
| `ihl-06-market-priority-queue-lose.png` | `06pri-lose` | ✅ |
| `ihl-03-lineage-metrics-detail.png` | `03met` | ✅ |

### Batch 3 — 観測 5 ステップ補完（HQ-08 ギャップ · Phase 5 前）

> 正本: [`mock-gap-RTM-観測-v1-DRAFT.md`](../mock-gap-RTM-観測-v1-DRAFT.md)

| ファイル | 画面 ID | 必須要素 | 状態 |
|----------|---------|----------|------|
| `ihl-05-obs-input-dual-primary.png` | `05i` | [一括取得]+[写真撮影] 両 primary · 採取物/機器 | ⏳ TODO |
| `ihl-05-obs-input-bulk-fetching.png` | `05i` | フェッチ中 StatusStrip | ⏳ TODO |
| `ihl-05-obs-input-bulk-done.png` | `05i` | フェッチ完了 · 自動入力 · 確認へ | ⏳ TODO |
| `ihl-05-obs-input-photo-capture.png` | `05i` | 写真プレビュー · 撮影条件 | ⏳ TODO |
| `ihl-05-obs-input-confirm.png` | `obs.confirm` | 3 チャンク · [登録] 1 主 | ⏳ TODO |
| `ihl-05-obs-register-success.png` | `05done` | 登録完了 · 次アクション | ⏳ TODO |

| ファイル | 画面 ID | 必須要素 | 状態 |
|----------|---------|----------|------|
| `ihl-20-vote-general.png` | 20vote | 候補カード · 1票 · PT 残高 · 22 リンク | ✅ |
| `ihl-17-world-template-picker.png` | 17picker | default/recommended/custom · 適用主ボタン | ✅ |
| `ihl-18-photo-analysis-result.png` | 18photo | タグ提案 · 色補正なし · 写真なし | ✅ |
| `ihl-19-component-board.png` | 19board | GitHub issue 一覧 · file-board リンク | ✅ |
