/** 知の広場 · 07 掲示板 — 板設定（3 柱 IA · 公式板 2 枚） */

export type BoardKind = "gripe" | "improve";

export type OfficialBoardWalkId = "07g" | "07b";

export type KnowledgeWalkId = "07a" | "07a-official" | "07gh" | "07-thread" | "09" | "09t";

/** 知の広場 Hub（07a）— 3 柱カード */
export const KNOWLEDGE_PILLARS: {
  id: string;
  title: string;
  icon: string;
  desc: string;
  stat: string;
  target: string;
  hotspot: number;
}[] = [
  {
    id: "board",
    title: "掲示板",
    icon: "💬",
    desc: "愚痴 · 改善。製品 BBS の会話面。",
    stat: "192 スレッド",
    target: "07a-official",
    hotspot: 0,
  },
  {
    id: "paper",
    title: "論文",
    icon: "📄",
    desc: "進行中論文 · テンプレ穴埋め · Paper Match。",
    stat: "28 件 進行中",
    target: "09",
    hotspot: 1,
  },
  {
    id: "github",
    title: "GitHub 掲示板",
    icon: "🔗",
    desc: "Issues · BOARD.md · 改善履歴（link-out）。",
    stat: "5 機能板",
    target: "07gh",
    hotspot: 2,
  },
];

/** 公式板ハブ（07a-official）— 愚痴 + 改善 */
export const OFFICIAL_BOARDS: {
  id: BoardKind;
  title: string;
  icon: string;
  desc: string;
  threadCount: number;
  target: OfficialBoardWalkId;
  hotspot: number;
}[] = [
  {
    id: "gripe",
    title: "愚痴",
    icon: "🌧",
    desc: "感情を整理する。匿名性高め。",
    threadCount: 128,
    target: "07g",
    hotspot: 1,
  },
  {
    id: "improve",
    title: "改善",
    icon: "💡",
    desc: "機能の改善を提案・議論する。",
    threadCount: 64,
    target: "07b",
    hotspot: 0,
  },
];

/** 公式板内 — 愚痴/改善 2 タブのみ（CAL-07-BOARDS-01 縮小） */
export const OFFICIAL_BOARD_TABS: { kind: BoardKind; walkId: OfficialBoardWalkId; label: string }[] = [
  { kind: "gripe", walkId: "07g", label: "愚痴" },
  { kind: "improve", walkId: "07b", label: "改善提案" },
];

export const OFFICIAL_SIDE_NAV: { label: string; walkId: string }[] = [
  { label: "知の広場", walkId: "07a" },
  { label: "板選び", walkId: "07a-official" },
  { label: "裁判", walkId: "11" },
];

export const WALK_TO_KIND: Record<OfficialBoardWalkId, BoardKind> = {
  "07g": "gripe",
  "07b": "improve",
};

export const BOARD_COPY: Record<
  BoardKind,
  { title: string; lead: string; primaryCta: string; emptyLead: string }
> = {
  gripe: {
    title: "愚痴板",
    lead: "匿名性高め。感情を整理する場所です。",
    primaryCta: "スレ立て",
    emptyLead: "まだスレッドがありません。最初の愚痴スレを立ててみましょう。",
  },
  improve: {
    title: "改善提案板",
    lead: "機能の改善を提案し、議論する板です。",
    primaryCta: "新規スレッド",
    emptyLead: "まだスレッドがありません。改善案のスレッドを立ててください。",
  },
};

export function resolveBoardKind(screenId?: string): BoardKind {
  if (screenId && screenId in WALK_TO_KIND) {
    return WALK_TO_KIND[screenId as OfficialBoardWalkId];
  }
  return "gripe";
}

export function resolveWalkId(screenId?: string): OfficialBoardWalkId {
  if (screenId && screenId in WALK_TO_KIND) {
    return screenId as OfficialBoardWalkId;
  }
  return "07g";
}

export function boardKindToWalkId(kind: BoardKind): OfficialBoardWalkId {
  return kind === "gripe" ? "07g" : "07b";
}
