/**
 * IHL UX Walkthrough — 草案 v1
 * 正本遷移: ../00-遷移マップ-全体.md
 * ホットスポット座標は %（画像左上基準）— 人間レビューで微調整要
 */
const SCREENS = {
  O1: {
    id: "O1", group: "オンボーディング", title: "ログイン（マジックリンク）",
    route: "/login", mock: "mockups/ihl-00-onboarding-login.png",
    breadcrumb: "オンボーディング › ログイン",
    hotspots: [
      { label: "ログインリンクを送る → 登録へ", target: "O2", x: 35, y: 62, w: 30, h: 8 },
    ],
  },
  O2: {
    id: "O2", group: "オンボーディング", title: "新規登録",
    route: "/register", mock: "mockups/ihl-00-onboarding-signup.png",
    breadcrumb: "オンボーディング › 新規登録",
    hotspots: [
      { label: "利用規約リンク", target: "O3", x: 42, y: 58, w: 18, h: 4 },
      { label: "はじめる → ホーム", target: "01", x: 35, y: 72, w: 30, h: 8 },
    ],
  },
  O3: {
    id: "O3", group: "オンボーディング", title: "利用規約・プライバシー",
    route: "/terms", mock: "mockups/ihl-00-terms.png",
    breadcrumb: "オンボーディング › 利用規約",
    hotspots: [
      { label: "第1条 › 本音解説", target: "O3", x: 72, y: 28, w: 18, h: 4 },
      { label: "第2条 › 本音解説", target: "O3", x: 72, y: 38, w: 18, h: 4 },
      { label: "解説動画リンク", target: "O3", x: 72, y: 48, w: 18, h: 4 },
      { label: "戻る → 登録", target: "O2", x: 8, y: 88, w: 15, h: 7 },
      { label: "同意して続ける", target: "O2", x: 70, y: 88, w: 22, h: 7 },
    ],
  },
  "01": {
    id: "01", group: "ホーム", title: "ホーム（司令塔）",
    route: "/", mock: "mockups/ihl-01-nav-home.png",
    breadcrumb: "ホーム",
    hotspots: [
      { label: "観測対象ナビゲータ → 対象を選ぶ", target: "05ctx", x: 48, y: 60, w: 20, h: 6 },
      { label: "観測をはじめる → 計測", target: "05i", x: 48, y: 68, w: 20, h: 7 },
      { label: "検索グリッド", target: "05a", x: 70, y: 68, w: 16, h: 7 },
      { label: "左ナビ › 血統", target: "03", x: 2, y: 62, w: 12, h: 6 },
      { label: "左ナビ › 論文", target: "09", x: 2, y: 70, w: 12, h: 6 },
      { label: "左ナビ › Builder", target: "16", x: 2, y: 78, w: 12, h: 6 },
      { label: "左ナビ › マーケット", target: "06a", x: 2, y: 22, w: 12, h: 6 },
      { label: "左ナビ › 掲示板", target: "07a", x: 2, y: 30, w: 12, h: 6 },
      { label: "左ナビ › 好み", target: "10", x: 2, y: 38, w: 12, h: 6 },
      { label: "左ナビ › 貢献度", target: "14", x: 2, y: 46, w: 12, h: 6 },
      { label: "左ナビ › 設定", target: "12hub", x: 2, y: 54, w: 12, h: 6 },
      { label: "左ナビ › 投票", target: "20vote", x: 2, y: 86, w: 12, h: 6 },
      { label: "文脈バー › 愚痴", target: "07g", x: 55, y: 4, w: 10, h: 4 },
      { label: "文脈バー › 改善提案", target: "07b", x: 66, y: 4, w: 10, h: 4 },
    ],
  },
  "05ctx": {
    id: "05ctx", group: "観測", title: "観測 対象ナビゲータ + コンテキスト",
    route: "(文脈バー · ボトムシート · ADR-H-16)", mock: "mockups/ihl-05-obs-context-picker.png",
    breadcrumb: "観測 › 対象ナビゲータ",
    hotspots: [
      { label: "① ドメイン › 生物（選択中）", target: "05ctx", x: 2, y: 26, w: 12, h: 7 },
      { label: "① ドメイン › 器物・無機物", target: "05ctx", x: 14, y: 26, w: 16, h: 7 },
      { label: "① ドメイン › デジタル", target: "05ctx", x: 31, y: 26, w: 12, h: 7 },
      { label: "① ドメイン › 環境", target: "05ctx", x: 44, y: 26, w: 10, h: 7 },
      { label: "① ドメイン › カスタム", target: "05ctx", x: 55, y: 26, w: 14, h: 7 },
      { label: "② タブ › 学名検索", target: "05ctx", x: 5, y: 39, w: 24, h: 6 },
      { label: "② タブ › 質問で絞る（アキネーター式）", target: "05ctx", x: 40, y: 39, w: 24, h: 6 },
      { label: "② タブ › 分類ツリー（選択中）", target: "05ctx", x: 76, y: 39, w: 22, h: 6 },
      { label: "② 亜種 › D. h. hercules（選択）", target: "05ctx", x: 3, y: 60, w: 92, h: 6 },
      { label: "亜種未区別（種まで）", target: "05ctx", x: 36, y: 69, w: 32, h: 7 },
      { label: "③ 適用 → 検索（対象プリフィル）", target: "05a", x: 2, y: 86, w: 96, h: 6 },
      { label: "適用 → 計測入力（プリフィル）", target: "05i", x: 79, y: 9, w: 9, h: 5 },
      { label: "適用 → テンプレ一覧（target_scope）", target: "05tl", x: 89, y: 9, w: 9, h: 5 },
    ],
  },
  "05a": {
    id: "05a", group: "観測", title: "観測 検索グリッド",
    route: "/observation", mock: "mockups/ihl-05-obs-search-grid.png",
    breadcrumb: "観測 › 検索",
    hotspots: [
      { label: "対象チップ → 対象ナビゲータ", target: "05ctx", x: 62, y: 2, w: 18, h: 6 },
      { label: "個体カード → 詳細", target: "05b", x: 28, y: 35, w: 18, h: 22 },
      { label: "計測入力へ", target: "05i", x: 80, y: 2, w: 14, h: 6 },
      { label: "テンプレ一覧", target: "05tl", x: 88, y: 2, w: 12, h: 6 },
      { label: "ホーム", target: "01", x: 2, y: 8, w: 10, h: 5 },
    ],
  },
  "05b": {
    id: "05b", group: "観測", title: "観測 個体詳細 + 類似",
    route: "/observation/:id", mock: "mockups/ihl-05-obs-detail-similar.png",
    breadcrumb: "観測 › 個体詳細",
    hotspots: [
      { label: "計測入力", target: "05i", x: 18, y: 75, w: 16, h: 6 },
      { label: "戻る › 検索", target: "05a", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "05i": {
    id: "05i", group: "観測", title: "観測 計測入力",
    route: "/observation/input", mock: "mockups/ihl-05-obs-input-row.png",
    breadcrumb: "観測 › 計測入力",
    hotspots: [
      { label: "対象チップ → 対象ナビゲータ", target: "05ctx", x: 5, y: 9, w: 22, h: 6 },
      { label: "性別 › 雄", target: "05i-m", x: 22, y: 18, w: 8, h: 5 },
      { label: "性別 › 雌", target: "05i-f", x: 32, y: 18, w: 8, h: 5 },
      { label: "テンプレから", target: "05tl", x: 55, y: 10, w: 14, h: 5 },
      { label: "IoT 未登録バナー", target: "05iot", x: 20, y: 55, w: 55, h: 10 },
      { label: "写真解析結果", target: "18photo", x: 72, y: 10, w: 14, h: 5 },
    ],
  },
  "05i-m": {
    id: "05i-m", group: "観測", title: "計測入力（雄）",
    route: "/observation/input", mock: "mockups/ihl-05-obs-input-male.png",
    breadcrumb: "観測 › 計測入力 › 雄",
    hotspots: [{ label: "雌に切替", target: "05i-f", x: 32, y: 18, w: 8, h: 5 }],
  },
  "05i-f": {
    id: "05i-f", group: "観測", title: "計測入力（雌）",
    route: "/observation/input", mock: "mockups/ihl-05-obs-input-female.png",
    breadcrumb: "観測 › 計測入力 › 雌",
    hotspots: [{ label: "雄に切替", target: "05i-m", x: 22, y: 18, w: 8, h: 5 }],
  },
  "05tl": {
    id: "05tl", group: "観測", title: "計測テンプレ 一覧",
    route: "/observation/templates", mock: "mockups/ihl-05-obs-template-list.png",
    breadcrumb: "観測 › 計測テンプレ",
    hotspots: [
      { label: "対象チップ → 対象ナビゲータ", target: "05ctx", x: 18, y: 2, w: 20, h: 6 },
      { label: "絞り込み解除（フィルタのみ）", target: "05tl", x: 87, y: 10, w: 12, h: 6 },
      { label: "テンプレカード → 詳細", target: "05td", x: 2, y: 27, w: 24, h: 26 },
      { label: "新規テンプレ作成", target: "05fork", x: 82, y: 2, w: 16, h: 6 },
    ],
  },
  "05td": {
    id: "05td", group: "観測", title: "計測テンプレ 詳細",
    route: "/observation/templates/:id", mock: "mockups/ihl-05-obs-template-detail.png",
    breadcrumb: "観測 › 計測テンプレ › 詳細",
    hotspots: [
      { label: "このテンプレで記録", target: "05i", x: 55, y: 88, w: 22, h: 7 },
      { label: "複製して編集 (Fork)", target: "05fork", x: 30, y: 88, w: 18, h: 7 },
      { label: "一覧へ", target: "05tl", x: 14, y: 6, w: 12, h: 4 },
    ],
  },
  "05fork": {
    id: "05fork", group: "観測", title: "テンプレ Fork",
    route: "(詳細内ペイン)", mock: "mockups/ihl-05-obs-template-fork.png",
    breadcrumb: "観測 › Fork",
    hotspots: [
      { label: "IoT 未登録", target: "05iot", x: 25, y: 60, w: 50, h: 12 },
      { label: "詳細へ戻る", target: "05td", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "05iot": {
    id: "05iot", group: "観測", title: "IoT 機器未登録",
    route: "/observation/input", mock: "mockups/ihl-05-obs-device-link.png",
    breadcrumb: "観測 › IoT",
    hotspots: [
      { label: "機器管理へ", target: "13", x: 35, y: 68, w: 28, h: 8 },
    ],
  },
  "06a": {
    id: "06a", group: "マーケット", title: "マーケット 出品一覧",
    route: "/market", mock: "mockups/ihl-06-market-browse.png",
    breadcrumb: "マーケット › 出品",
    hotspots: [
      { label: "〔出品する〕", target: "06list", x: 78, y: 8, w: 14, h: 6 },
      { label: "出品カード → 詳細", target: "06b", x: 22, y: 35, w: 22, h: 25 },
      { label: "タブ › 抽選", target: "06lot-tab", x: 38, y: 12, w: 10, h: 5 },
      { label: "タブ › 優先順", target: "06pri-tab", x: 50, y: 12, w: 10, h: 5 },
      { label: "タブ › オークション", target: "06auc", x: 26, y: 12, w: 10, h: 5 },
      { label: "通知（マイページ）", target: "PRnotif", x: 70, y: 8, w: 12, h: 5 },
    ],
  },
  "06list": {
    id: "06list", group: "マーケット", title: "新規出品",
    route: "/market/listing/new", mock: "mockups/ihl-06-market-listing-create.png",
    breadcrumb: "マーケット › 出品作成",
    hotspots: [
      { label: "観測中の個体を選択", target: "06list", x: 20, y: 28, w: 55, h: 22 },
      { label: "その場で写真追加", target: "06list", x: 20, y: 52, w: 25, h: 8 },
      { label: "出品する", target: "06b", x: 58, y: 85, w: 18, h: 7 },
      { label: "一覧へ", target: "06a", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06lot-tab": {
    id: "06lot-tab", group: "マーケット", title: "マーケット 抽選タブ",
    route: "/market?tab=lottery", mock: "mockups/ihl-06-market-lottery-tab.png",
    breadcrumb: "マーケット › 抽選",
    hotspots: [
      { label: "抽選出品 → 応募", target: "06lot-apply", x: 22, y: 35, w: 22, h: 25 },
      { label: "出品タブ", target: "06a", x: 14, y: 12, w: 10, h: 5 },
    ],
  },
  "06lot-apply": {
    id: "06lot-apply", group: "マーケット", title: "抽選 応募",
    route: "/market/:id", mock: "mockups/ihl-06-market-lottery-apply.png",
    breadcrumb: "マーケット › 抽選応募",
    hotspots: [
      { label: "応募する", target: "06lot-result", x: 58, y: 72, w: 18, h: 8 },
      { label: "一覧へ", target: "06lot-tab", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06lot-result": {
    id: "06lot-result", group: "マーケット", title: "抽選結果（当選）",
    route: "/market/:id", mock: "mockups/ihl-06-market-lottery-result.png",
    breadcrumb: "マーケット › 抽選結果",
    hotspots: [
      { label: "プライベートボード", target: "06b", x: 32, y: 72, w: 35, h: 8 },
      { label: "落選例を見る", target: "06lot-lose", x: 14, y: 72, w: 16, h: 6 },
    ],
  },
  "06lot-lose": {
    id: "06lot-lose", group: "マーケット", title: "抽選結果（落選）",
    route: "/market/:id", mock: "mockups/ihl-06-market-lottery-result-lose.png",
    breadcrumb: "マーケット › 抽選結果 › 落選",
    hotspots: [
      { label: "他の出品を見る", target: "06lot-tab", x: 35, y: 78, w: 22, h: 7 },
      { label: "当選例を見る", target: "06lot-result", x: 60, y: 78, w: 16, h: 6 },
    ],
  },
  "06pri-tab": {
    id: "06pri-tab", group: "マーケット", title: "マーケット 優先順タブ",
    route: "/market?tab=priority", mock: "mockups/ihl-06-market-priority-tab.png",
    breadcrumb: "マーケット › 優先順",
    hotspots: [
      { label: "優先順出品 → 申込", target: "06pri-queue", x: 22, y: 38, w: 22, h: 22 },
      { label: "出品タブ", target: "06a", x: 14, y: 12, w: 10, h: 5 },
    ],
  },
  "06pri-queue": {
    id: "06pri-queue", group: "マーケット", title: "優先順 申込・順位",
    route: "/market/:id", mock: "mockups/ihl-06-market-priority-queue.png",
    breadcrumb: "マーケット › 優先順申込",
    hotspots: [
      { label: "申し込む", target: "06b", x: 58, y: 78, w: 16, h: 7 },
      { label: "落選確定例", target: "06pri-lose", x: 38, y: 78, w: 16, h: 6 },
      { label: "一覧へ", target: "06pri-tab", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06pri-lose": {
    id: "06pri-lose", group: "マーケット", title: "優先順 落選確定",
    route: "/market/:id", mock: "mockups/ihl-06-market-priority-queue-lose.png",
    breadcrumb: "マーケット › 優先順 › 落選",
    hotspots: [
      { label: "一覧へ戻る", target: "06pri-tab", x: 35, y: 82, w: 20, h: 6 },
      { label: "申込画面へ", target: "06pri-queue", x: 58, y: 82, w: 16, h: 6 },
    ],
  },
  "06auc": {
    id: "06auc", group: "マーケット", title: "オークション 入札",
    route: "/market/auction/:id", mock: "mockups/ihl-06-market-auction-bid.png",
    breadcrumb: "マーケット › オークション",
    hotspots: [
      { label: "入札する（stub: Stage1未配線）", target: "06b", x: 58, y: 68, w: 16, h: 8, stub: true },
      { label: "出品タブ", target: "06a", x: 14, y: 12, w: 10, h: 5 },
    ],
  },
  "06b": {
    id: "06b", group: "マーケット", title: "出品詳細 + プライベートボード（Stage 1）",
    route: "/market/:id", mock: "mockups/ihl-06-market-detail-board.png",
    breadcrumb: "マーケット › 取引 › Stage 1",
    hotspots: [
      { label: "ステッパ › 配送（Stage 2）", target: "06b-s2", x: 30, y: 18, w: 14, h: 5 },
      { label: "一覧へ", target: "06a", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06b-s2": {
    id: "06b-s2", group: "マーケット", title: "取引 Stage 2（振込・配達確認）",
    route: "/market/:id", mock: "mockups/ihl-06-market-detail-board-stage2.png",
    breadcrumb: "マーケット › 取引 › Stage 2",
    hotspots: [
      { label: "振込確認（取り消し不可）", target: "06b-s2", x: 25, y: 55, w: 22, h: 7 },
      { label: "配達到着確認（取り消し不可）", target: "06b-s3", x: 52, y: 55, w: 24, h: 7 },
      { label: "Stage 1へ", target: "06b", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06b-s3": {
    id: "06b-s3", group: "マーケット", title: "取引 Stage 3（評価・8%）",
    route: "/market/:id", mock: "mockups/ihl-06-market-detail-board-stage3.png",
    breadcrumb: "マーケット › 取引 › Stage 3",
    hotspots: [
      { label: "評価を確定", target: "06b-s3", x: 55, y: 62, w: 18, h: 7 },
      { label: "振込案内へ（8%）", target: "23", x: 55, y: 78, w: 20, h: 6, stub: true },
      { label: "Stage 2へ", target: "06b-s2", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "06soc": {
    id: "06soc", group: "マーケット", title: "（移設）マーケット通知 → マイページ",
    route: "/me/notifications", mock: "mockups/ihl-06-market-social.png",
    breadcrumb: "マイページ › 通知（旧マーケットソーシャル）",
    hotspots: [
      { label: "マイページ通知へ", target: "PRnotif", x: 14, y: 6, w: 18, h: 4 },
      { label: "マーケットへ", target: "06a", x: 34, y: 6, w: 12, h: 4 },
    ],
    stubOnly: true,
  },
  "07a": {
    id: "07a", group: "掲示板", title: "掲示板ハブ",
    route: "/board", mock: "mockups/ihl-07-board-hub.png",
    breadcrumb: "掲示板 › ハブ",
    hotspots: [
      { label: "改善提案を開く", target: "07b", x: 22, y: 28, w: 28, h: 14 },
      { label: "愚痴板", target: "07g", x: 22, y: 44, w: 28, h: 14 },
      { label: "論文板", target: "09", x: 22, y: 60, w: 28, h: 14 },
      { label: "その他板", target: "07o", x: 22, y: 76, w: 28, h: 14 },
      { label: "コンポ掲示板", target: "19board", x: 55, y: 76, w: 28, h: 14 },
    ],
  },
  "07o": {
    id: "07o", group: "掲示板", title: "掲示板 その他",
    route: "/board/other", mock: "mockups/ihl-07-board-thread-post.png",
    breadcrumb: "掲示板 › その他",
    hotspots: [
      { label: "ハブへ", target: "07a", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "07b": {
    id: "07b", group: "掲示板", title: "掲示板 スレッド（改善提案）",
    route: "/board/:category", mock: "mockups/ihl-07-board-thread-post.png",
    breadcrumb: "掲示板 › 改善提案",
    hotspots: [
      { label: "… › 指摘", target: "11", x: 75, y: 42, w: 8, h: 5 },
      { label: "ハブへ", target: "07a", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "07g": {
    id: "07g", group: "掲示板", title: "掲示板 愚痴板",
    route: "/board/gripe", mock: "mockups/ihl-07-board-post-愚痴.png",
    breadcrumb: "掲示板 › 愚痴",
    hotspots: [{ label: "ハブへ", target: "07a", x: 14, y: 6, w: 10, h: 4 }],
  },
  "10": {
    id: "10", group: "その他", title: "好み pairwise",
    route: "/match", mock: "mockups/ihl-10-preference-pairwise.png",
    breadcrumb: "好み",
    hotspots: [
      { label: "プレビュー帯（好み反映）", target: "10", x: 15, y: 72, w: 70, h: 12 },
      { label: "ホーム", target: "01", x: 2, y: 8, w: 10, h: 5 },
    ],
  },
  "11": {
    id: "11", group: "その他", title: "争い 二人部屋",
    route: "/board/.../dispute", mock: "mockups/ihl-11-dispute-tworoom.png",
    breadcrumb: "掲示板 › 争い",
    hotspots: [{ label: "掲示板へ", target: "07b", x: 14, y: 6, w: 10, h: 4 }],
  },
  "12hub": {
    id: "12hub", group: "設定", title: "設定ハブ",
    route: "/settings", mock: "mockups/ihl-12-settings-hub.png",
    breadcrumb: "設定",
    hotspots: [
      { label: "PII・プライバシー", target: "12pii", x: 22, y: 38, w: 35, h: 14 },
      { label: "機器管理", target: "13", x: 22, y: 55, w: 35, h: 14 },
      { label: "UI テンプレ選択", target: "17picker", x: 22, y: 72, w: 35, h: 14 },
    ],
  },
  "12pii": {
    id: "12pii", group: "設定", title: "設定 PII",
    route: "/settings/pii", mock: "mockups/ihl-12-settings-pii.png",
    breadcrumb: "設定 › PII",
    hotspots: [{ label: "設定ハブ", target: "12hub", x: 14, y: 6, w: 10, h: 4 }],
  },
  "13": {
    id: "13", group: "設定", title: "機器管理",
    route: "/settings/device", mock: "mockups/ihl-13-device-registry.png",
    breadcrumb: "設定 › 機器",
    hotspots: [
      { label: "観測入力へ", target: "05i", x: 14, y: 6, w: 12, h: 4 },
      { label: "設定ハブ", target: "12hub", x: 22, y: 6, w: 10, h: 4 },
    ],
  },
  "14": {
    id: "14", group: "その他", title: "貢献度",
    route: "/contribution", mock: "mockups/ihl-14-contribution-badge.png",
    breadcrumb: "貢献度",
    hotspots: [
      { label: "PTショップ", target: "22", x: 55, y: 72, w: 18, h: 7 },
      { label: "一般投票", target: "20vote", x: 55, y: 62, w: 18, h: 7 },
      { label: "プロフィール", target: "PR", x: 55, y: 55, w: 18, h: 7 },
    ],
  },
  "08": {
    id: "08", group: "その他", title: "カルマ概要",
    route: "/karma", mock: "mockups/ihl-08-karma-summary.png",
    breadcrumb: "プロフィール › カルマ",
    hotspots: [
      { label: "免罪符ショップ", target: "22", x: 55, y: 78, w: 20, h: 6 },
      { label: "プロフィール", target: "PR", x: 14, y: 6, w: 12, h: 4 },
    ],
  },
  PR: {
    id: "PR", group: "その他", title: "プロフィール 3 指標",
    route: "/me/profile", mock: "mockups/ihl-profile-three-metrics.png",
    breadcrumb: "プロフィール",
    hotspots: [
      { label: "通知（Q&A・称賛・オファー）", target: "PRnotif", x: 72, y: 8, w: 14, h: 5 },
      { label: "カルマ詳細", target: "08", x: 18, y: 28, w: 25, h: 22 },
      { label: "貢献度", target: "14", x: 42, y: 28, w: 25, h: 22 },
    ],
  },
  PRnotif: {
    id: "PRnotif", group: "その他", title: "マイページ 通知",
    route: "/me/notifications", mock: "mockups/ihl-profile-three-metrics.png",
    breadcrumb: "マイページ › 通知",
    hotspots: [
      { label: "プロフィールへ", target: "PR", x: 14, y: 6, w: 12, h: 4 },
      { label: "マーケットへ", target: "06a", x: 28, y: 6, w: 12, h: 4 },
    ],
  },
  "03": {
    id: "03", group: "血統・論文", title: "血統・交配",
    route: "/cross/:id", mock: "mockups/ihl-03-lineage-cross.png",
    breadcrumb: "血統 › Cross",
    hotspots: [
      { label: "死亡率 詳細", target: "03m", x: 55, y: 62, w: 12, h: 5 },
      { label: "率 指標 drilldown", target: "03met", x: 68, y: 55, w: 14, h: 5 },
      { label: "成長 詳細", target: "03g", x: 42, y: 48, w: 12, h: 5 },
    ],
  },
  "03met": {
    id: "03met", group: "血統・論文", title: "率 詳細一覧（指標）",
    route: "/cross/:id/metrics/:metric", mock: "mockups/ihl-03-lineage-metrics-detail.png",
    breadcrumb: "血統 › 交配 › 死亡率 詳細",
    hotspots: [
      { label: "観測詳細へ", target: "05b", x: 72, y: 42, w: 14, h: 5 },
      { label: "Crossへ", target: "03", x: 14, y: 6, w: 10, h: 4 },
      { label: "死亡一覧へ", target: "03m", x: 28, y: 6, w: 12, h: 4 },
    ],
  },
  "03m": {
    id: "03m", group: "血統・論文", title: "死亡一覧",
    route: "/cross/:id/mortality", mock: "mockups/ihl-03-lineage-mortality-detail.png",
    breadcrumb: "血統 › 死亡一覧",
    hotspots: [
      { label: "観測詳細へ", target: "05b", x: 72, y: 42, w: 14, h: 5 },
      { label: "Crossへ", target: "03", x: 14, y: 6, w: 10, h: 4 },
    ],
  },
  "03g": {
    id: "03g", group: "血統・論文", title: "成長詳細",
    route: "/cross/:id/growth", mock: "mockups/ihl-03-lineage-growth-detail.png",
    breadcrumb: "血統 › 成長詳細",
    hotspots: [{ label: "Crossへ", target: "03", x: 14, y: 6, w: 10, h: 4 }],
  },
  "09": {
    id: "09", group: "血統・論文", title: "論文 進行中",
    route: "/board/paper", mock: "mockups/ihl-09-paper-in-progress.png",
    breadcrumb: "掲示板 › 論文",
    hotspots: [
      { label: "テンプレ穴埋め", target: "09t", x: 55, y: 72, w: 22, h: 7 },
    ],
  },
  "09t": {
    id: "09t", group: "血統・論文", title: "論文テンプレート",
    route: "/board/paper/template", mock: "mockups/ihl-09-paper-template-fill.png",
    breadcrumb: "掲示板 › 論文テンプレ",
    hotspots: [{ label: "進行中論文", target: "09", x: 14, y: 6, w: 14, h: 4 }],
  },
  "20vote": {
    id: "20vote", group: "その他", title: "一般投票",
    route: "/vote", mock: "mockups/ihl-20-vote-general.png",
    breadcrumb: "投票 › 一般投票（2026-Q2）",
    hotspots: [
      { label: "候補 A を選択", target: "20vote", x: 18, y: 28, w: 64, h: 12 },
      { label: "投票する", target: "20vote", x: 68, y: 72, w: 16, h: 7 },
      { label: "免罪符ショップへ", target: "22", x: 55, y: 82, w: 18, h: 5 },
      { label: "ホーム", target: "01", x: 2, y: 8, w: 10, h: 5 },
    ],
  },
  "17picker": {
    id: "17picker", group: "Builder", title: "UI テンプレ選択",
    route: "/settings/ui-template", mock: "mockups/ihl-17-world-template-picker.png",
    breadcrumb: "設定 › UI テンプレ選択",
    hotspots: [
      { label: "おすすめタブ", target: "17picker", x: 28, y: 14, w: 12, h: 5 },
      { label: "テンプレカードを選択", target: "17picker", x: 8, y: 32, w: 28, h: 22 },
      { label: "適用する", target: "01", x: 72, y: 82, w: 14, h: 7 },
      { label: "Builder", target: "16", x: 2, y: 78, w: 12, h: 6 },
      { label: "設定ハブ", target: "12hub", x: 2, y: 54, w: 12, h: 6 },
    ],
  },
  "18photo": {
    id: "18photo", group: "観測", title: "写真解析 結果",
    route: "/component/photo-analysis", mock: "mockups/ihl-18-photo-analysis-result.png",
    breadcrumb: "コンポーネント › 写真解析 › 結果",
    hotspots: [
      { label: "タグ提案を承認", target: "18photo", x: 68, y: 82, w: 16, h: 7 },
      { label: "計測入力へ", target: "05i", x: 14, y: 6, w: 12, h: 4 },
      { label: "Builder", target: "16", x: 2, y: 78, w: 12, h: 6 },
    ],
  },
  "19board": {
    id: "19board", group: "掲示板", title: "コンポーネント掲示板",
    route: "/board/component", mock: "mockups/ihl-19-component-board.png",
    breadcrumb: "掲示板 › コンポーネント掲示板",
    hotspots: [
      { label: "GitHub issue #142", target: "19board", x: 8, y: 28, w: 72, h: 8 },
      { label: "file-board へ", target: "19board", x: 72, y: 10, w: 16, h: 5 },
      { label: "掲示板ハブ", target: "07a", x: 14, y: 6, w: 12, h: 4 },
      { label: "ホーム", target: "01", x: 2, y: 8, w: 10, h: 5 },
    ],
  },
  "22": {
    id: "22", group: "その他", title: "PT ショップ",
    route: "/economy/shop", mock: "mockups/ihl-22-pt-shop.png",
    breadcrumb: "経済 › PTショップ",
    hotspots: [
      { label: "貢献度へ", target: "14", x: 14, y: 6, w: 10, h: 4 },
      { label: "一般投票へ", target: "20vote", x: 55, y: 72, w: 16, h: 6 },
    ],
  },
  "23": {
    id: "23", group: "マーケット", title: "GMO 振込案内",
    route: "/market/.../transfer", mock: "mockups/ihl-23-gmo-transfer.png",
    breadcrumb: "マーケット › 振込",
    hotspots: [{ label: "取引へ", target: "06b", x: 14, y: 6, w: 10, h: 4 }],
    stubOnly: true,
  },
  "16": {
    id: "16", group: "Builder", title: "UIビルダー",
    route: "/builder", mock: "mockups/ihl-16-uibuilder-canvas.png",
    breadcrumb: "Builder",
    hotspots: [
      { label: "入口例", target: "16e", x: 14, y: 6, w: 14, h: 4 },
      { label: "UI テンプレ選択", target: "17picker", x: 72, y: 10, w: 16, h: 5 },
      { label: "写真解析", target: "18photo", x: 72, y: 18, w: 14, h: 5 },
    ],
  },
  "16e": {
    id: "16e", group: "Builder", title: "この画面を編集",
    route: "(右下)", mock: "mockups/ihl-16-edit-this-screen-entry.png",
    breadcrumb: "Builder 入口",
    hotspots: [{ label: "Builder", target: "16", x: 70, y: 85, w: 18, h: 8 }],
  },
};

const DEFAULT_SCREEN = "01";
const history = [];

const imgEl = document.getElementById("mock-img");
const hotspotsEl = document.getElementById("hotspots");
const titleEl = document.getElementById("screen-title");
const routeEl = document.getElementById("screen-route");
const breadcrumbEl = document.getElementById("breadcrumb");
const flowHintEl = document.getElementById("flow-hint");
const btnBack = document.getElementById("btn-back");
const btnHome = document.getElementById("btn-home");
const showHotspotsCb = document.getElementById("show-hotspots");
const showLabelsCb = document.getElementById("show-labels");

function buildSidebar() {
  const nav = document.getElementById("flow-nav");
  const groups = {};
  Object.values(SCREENS).forEach((s) => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });
  Object.entries(groups).forEach(([name, screens]) => {
    const section = document.createElement("div");
    section.className = "flow-group";
    const h3 = document.createElement("h3");
    h3.textContent = name;
    section.appendChild(h3);
    screens.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.id = s.id;
      btn.textContent = `${s.id} ${s.title}`;
      if (s.stubOnly) btn.classList.add("stub-only");
      btn.addEventListener("click", () => navigate(s.id, false));
      section.appendChild(btn);
    });
    nav.appendChild(section);
  });
}

function updateSidebarActive(id) {
  document.querySelectorAll("#flow-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === id);
  });
}

function layoutHotspots(screen) {
  hotspotsEl.innerHTML = "";
  const rect = imgEl.getBoundingClientRect();
  const vp = document.getElementById("viewport");
  const vpRect = vp.getBoundingClientRect();
  const offsetTop = rect.top - vpRect.top + vp.scrollTop;
  const offsetLeft = rect.left - vpRect.left + (vp.clientWidth - rect.width) / 2;

  hotspotsEl.style.width = `${rect.width}px`;
  hotspotsEl.style.height = `${rect.height}px`;
  hotspotsEl.style.top = `${offsetTop}px`;
  hotspotsEl.style.left = `${offsetLeft + (vp.clientWidth - rect.width) / 2}px`;
  hotspotsEl.style.transform = "none";

  if (!showHotspotsCb.checked) {
    hotspotsEl.style.display = "none";
    return;
  }
  hotspotsEl.style.display = "block";
  hotspotsEl.classList.toggle("show-labels", showLabelsCb.checked);

  (screen.hotspots || []).forEach((z) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "zone";
    if (z.stub) el.title = "(stub 遷移)";
    el.style.left = `${z.x}%`;
    el.style.top = `${z.y}%`;
    el.style.width = `${z.w}%`;
    el.style.height = `${z.h}%`;
    const span = document.createElement("span");
    span.textContent = z.label;
    el.appendChild(span);
    el.addEventListener("click", () => navigate(z.target, true));
    hotspotsEl.appendChild(el);
  });
}

function renderScreen(id) {
  const screen = SCREENS[id];
  if (!screen) return;

  titleEl.textContent = screen.title;
  routeEl.textContent = screen.route;
  breadcrumbEl.textContent = screen.breadcrumb;
  flowHintEl.textContent = (screen.hotspots || [])
    .map((h) => h.label)
    .join(" · ") || "（ジャンプ専用 · ホットスポットなし）";

  imgEl.onload = () => layoutHotspots(screen);
  imgEl.src = screen.mock;
  imgEl.alt = screen.title;

  updateSidebarActive(id);
  btnBack.disabled = history.length === 0;
}

let currentId = DEFAULT_SCREEN;

function navigate(id, fromHotspot) {
  if (fromHotspot && currentId !== id) {
    history.push(currentId);
  } else if (!fromHotspot) {
    history.length = 0;
  }
  currentId = id;
  if (!fromHotspot) history.push(id);
  else history.push(id);
  renderScreen(id);
  btnBack.disabled = history.length <= 1;
}

btnBack.addEventListener("click", () => {
  if (history.length <= 1) return;
  history.pop();
  currentId = history[history.length - 1];
  renderScreen(currentId);
  btnBack.disabled = history.length <= 1;
});

btnHome.addEventListener("click", () => {
  currentId = DEFAULT_SCREEN;
  history.length = 0;
  history.push(DEFAULT_SCREEN);
  renderScreen(DEFAULT_SCREEN);
  btnBack.disabled = true;
});

showHotspotsCb.addEventListener("change", () => {
  const id = history[history.length - 1] || DEFAULT_SCREEN;
  layoutHotspots(SCREENS[id]);
});

showLabelsCb.addEventListener("change", () => {
  hotspotsEl.classList.toggle("show-labels", showLabelsCb.checked);
});

window.addEventListener("resize", () => {
  const id = history[history.length - 1] || DEFAULT_SCREEN;
  layoutHotspots(SCREENS[id]);
});

buildSidebar();
currentId = DEFAULT_SCREEN;
history.push(DEFAULT_SCREEN);
renderScreen(DEFAULT_SCREEN);
