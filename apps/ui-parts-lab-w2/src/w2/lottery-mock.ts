/** TX-LOTTERY lab mock — FR-MKT-02 · 取引方式-v1 §3.5 */

export type MockLotteryListing = {
  id: string;
  title: string;
  applicants: number;
  deadline: string;
  remain: string;
  statusLabel: string;
  seller: string;
  listedAt: number;
  preferenceMatch: boolean;
  species: string;
};

export const MOCK_LOTTERY_LISTINGS: MockLotteryListing[] = [
  {
    id: "LOT1",
    title: "ギラファノコギリクワガタ ♂ 72mm",
    applicants: 47,
    deadline: "2026-06-15 23:59",
    remain: "残り2日14時間",
    statusLabel: "応募受付中",
    seller: "IT Hercules Laboratory",
    listedAt: 2,
    preferenceMatch: false,
    species: "giraffe",
  },
  {
    id: "LOT2",
    title: "ヘラクレス ♂ 95mm",
    applicants: 31,
    deadline: "2026-06-18 23:59",
    remain: "残り5日3時間",
    statusLabel: "応募受付中",
    seller: "@beetle_lab · 貢献 L3",
    listedAt: 1,
    preferenceMatch: true,
    species: "hercules",
  },
  {
    id: "LOT3",
    title: "ヘラクレス ♂ 88mm",
    applicants: 62,
    deadline: "2026-06-12 23:59",
    remain: "残り18時間",
    statusLabel: "応募受付中",
    seller: "@kabukuwa_lover · 貢献 L4",
    listedAt: 3,
    preferenceMatch: true,
    species: "hercules",
  },
];

export type LotterySortMode = "preference-new" | "new" | "deadline";

export function sortLotteryListings(
  items: MockLotteryListing[],
  sortMode: LotterySortMode,
): MockLotteryListing[] {
  const copy = [...items];
  if (sortMode === "new") {
    return copy.sort((a, b) => a.listedAt - b.listedAt);
  }
  if (sortMode === "deadline") {
    return copy.sort((a, b) => a.remain.localeCompare(b.remain));
  }
  return copy.sort((a, b) => {
    if (a.preferenceMatch !== b.preferenceMatch) return a.preferenceMatch ? -1 : 1;
    return a.listedAt - b.listedAt;
  });
}

/** カード副行 — 抽選状況（価格 UI ではない） */
export function lotteryCardMeta(item: MockLotteryListing): string {
  return `応募 ${item.applicants}名 · 締切 ${item.remain}`;
}
