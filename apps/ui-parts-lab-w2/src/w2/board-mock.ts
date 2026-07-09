/** 07 掲示板 · 知の広場 — mock データ（lab 専用 · INSERT ONLY 想定） */

import type { BoardKind } from "./board-config";

export type MockThread = {
  id: string;
  title: string;
  responses: number;
  lastUpdate: string;
  boardKind: BoardKind;
};

export type MockPost = {
  /** post_id — pst_* 形式（DET-KN-01） */
  id: string;
  threadId: string;
  responseNo: number;
  author: string;
  time: string;
  body: string;
  quotedNo?: number;
};

export const MOCK_THREADS: Record<"gripe" | "improve", MockThread[]> = {
  gripe: [
    {
      id: "thr_g1",
      title: "幼虫の脱皮が読めなくてイライラする",
      responses: 48,
      lastUpdate: "2026/07/05 22:10",
      boardKind: "gripe",
    },
    {
      id: "thr_g2",
      title: "観測入力、もう少しサクサクできないかな",
      responses: 31,
      lastUpdate: "2026/07/04 18:42",
      boardKind: "gripe",
    },
    {
      id: "thr_g3",
      title: "湿度センサーの誤差が気になる",
      responses: 19,
      lastUpdate: "2026/07/03 09:15",
      boardKind: "gripe",
    },
    {
      id: "thr_g4",
      title: "夜中の通知がうるさい",
      responses: 12,
      lastUpdate: "2026/07/02 23:58",
      boardKind: "gripe",
    },
    {
      id: "thr_g5",
      title: "マーケット落札できなかった…",
      responses: 7,
      lastUpdate: "2026/07/01 14:20",
      boardKind: "gripe",
    },
  ],
  improve: [
    {
      id: "thr_b1",
      title: "観測フローの改善について",
      responses: 56,
      lastUpdate: "2026/07/05 11:30",
      boardKind: "improve",
    },
    {
      id: "thr_b2",
      title: "アラート閾値の共通プリセットが欲しい",
      responses: 34,
      lastUpdate: "2026/07/04 10:02",
      boardKind: "improve",
    },
    {
      id: "thr_b3",
      title: "構造化ログで原因調査を短くしたい",
      responses: 22,
      lastUpdate: "2026/07/03 16:44",
      boardKind: "improve",
    },
    {
      id: "thr_b4",
      title: "血統画面のフィルタ UX 改善案",
      responses: 15,
      lastUpdate: "2026/07/02 08:11",
      boardKind: "improve",
    },
  ],
};

export const MOCK_POSTS: MockPost[] = [
  {
    id: "pst_01JZK3G1MOLT",
    threadId: "thr_g1",
    responseNo: 1,
    author: "匿名",
    time: "2026/07/05 20:00",
    body: "幼虫の脱皮タイミングが読めなくてイライラする。観測ログと実際の脱皮がずれがち。",
  },
  {
    id: "pst_01JZK3G2ANCH",
    threadId: "thr_g1",
    responseNo: 2,
    author: "匿名",
    time: "2026/07/05 20:15",
    body: ">>1\nわかる。湿度変動で脱皮予測が外れる。",
    quotedNo: 1,
  },
  {
    id: "pst_01JZK3G3OBSV",
    threadId: "thr_g1",
    responseNo: 3,
    author: "lab_user_07",
    time: "2026/07/05 21:02",
    body: "SwitchBot の手動 import ならタイムラグは減るかも。",
  },
  {
    id: "pst_01JZK3G4RPLY",
    threadId: "thr_g1",
    responseNo: 4,
    author: "匿名",
    time: "2026/07/05 21:45",
    body: ">>2\n同感。センサー校正の手順がわかりにくい。",
    quotedNo: 2,
  },
  {
    id: "pst_01JZK3G5ENDG",
    threadId: "thr_g1",
    responseNo: 5,
    author: "匿名",
    time: "2026/07/05 22:10",
    body: "とりあえず手入力で凌いでる。自動化待ち。",
  },
  {
    id: "pst_01JZK3B1IMPR",
    threadId: "thr_b1",
    responseNo: 1,
    author: "改善提案者",
    time: "2026/07/05 10:00",
    body: "【現状】観測入力が3画面に分散\n【提案】コンテキストピッカーから1画面完結\n【期待効果】入力時間30%短縮",
  },
  {
    id: "pst_01JZK3B2VOTE",
    threadId: "thr_b1",
    responseNo: 2,
    author: "lab_user_12",
    time: "2026/07/05 11:30",
    body: ">>1\n賛成。05ctx からの導線を強化したい。",
    quotedNo: 1,
  },
  {
    id: "pst_01JZK3B3NOTE",
    threadId: "thr_b1",
    responseNo: 3,
    author: "@arctic_fox",
    time: "2026/07/05 12:05",
    body: "既存テンプレ fork との整合も確認したい。",
  },
  {
    id: "pst_01JZK3G2OP01",
    threadId: "thr_g2",
    responseNo: 1,
    author: "匿名",
    time: "2026/07/04 17:00",
    body: "観測入力のステップが多すぎる。",
  },
  {
    id: "pst_01JZK3G2OP02",
    threadId: "thr_g2",
    responseNo: 2,
    author: "匿名",
    time: "2026/07/04 18:42",
    body: ">>1\nショートカットキーがあれば助かる。",
    quotedNo: 1,
  },
];

export type GitHubFeatureBoard = {
  id: string;
  featureId: string;
  displayName: string;
  openIssues: number;
  githubUrl: string;
  summary?: string;
};

export const MOCK_GITHUB_BOARDS: GitHubFeatureBoard[] = [
  {
    id: "gh-07",
    featureId: "feature:07-掲示板",
    displayName: "掲示板 · 改善履歴",
    openIssues: 12,
    githubUrl: "https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory/issues?q=label%3Afeature%3A07",
    summary: "BBS UX · post_id · ハブ IA",
  },
  {
    id: "gh-19",
    featureId: "feature:19-component-board",
    displayName: "コンポーネント掲示板",
    openIssues: 8,
    githubUrl: "https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory/issues?q=label%3Acomponent",
    summary: "BOARD.md · giscus 規約",
  },
  {
    id: "gh-05",
    featureId: "feature:05-観測",
    displayName: "観測 · 改善提案",
    openIssues: 5,
    githubUrl: "https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory/issues?q=label%3Afeature%3A05",
    summary: "Capture 導線 · Tier B ingest",
  },
  {
    id: "gh-09",
    featureId: "feature:09-論文",
    displayName: "論文 · Paper Match",
    openIssues: 3,
    githubUrl: "https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory/issues?q=label%3Afeature%3A09",
    summary: "in_progress · 6節テンプレ",
  },
];

export function getThreadById(threadId: string): MockThread | undefined {
  for (const list of Object.values(MOCK_THREADS)) {
    const found = list.find((t) => t.id === threadId);
    if (found) return found;
  }
  return undefined;
}

export function getPostsForThread(threadId: string): MockPost[] {
  return MOCK_POSTS.filter((p) => p.threadId === threadId).sort((a, b) => a.responseNo - b.responseNo);
}

export function getPostByResponseNo(threadId: string, responseNo: number): MockPost | undefined {
  return getPostsForThread(threadId).find((p) => p.responseNo === responseNo);
}

export function formatAnchorQuote(responseNo: number): string {
  return `>>${responseNo}`;
}

export function formatCiteToken(type: string, id: string): string {
  return `[ihl:cite type=${type} id=${id}]`;
}

export function formatPostCite(postId: string): string {
  return formatCiteToken("post", postId);
}
