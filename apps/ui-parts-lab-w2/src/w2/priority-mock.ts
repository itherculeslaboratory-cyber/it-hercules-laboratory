/** TX-PLATINUM-PRIORITY lab mock — FR-MKT-15 · 取引方式-v1 §3.7 */

export type MockPriorityListing = {
  id: string;
  title: string;
  capacity: number;
  applicants: number;
  remain: string;
  seller: string;
  listedAt: number;
  preferenceMatch: boolean;
  species: string;
};

export const MOCK_PRIORITY_LISTINGS: MockPriorityListing[] = [
  {
    id: "P1",
    title: "ヘラクレス ♂ 95mm",
    capacity: 3,
    applicants: 12,
    remain: "残り2日14時間",
    seller: "@beetle_lab · 貢献 L3",
    listedAt: 1,
    preferenceMatch: true,
    species: "hercules",
  },
  {
    id: "P2",
    title: "ギラファノコギリクワガタ ♂ 72mm",
    capacity: 5,
    applicants: 8,
    remain: "残り5日3時間",
    seller: "IT Hercules Laboratory",
    listedAt: 2,
    preferenceMatch: false,
    species: "giraffe",
  },
  {
    id: "P3",
    title: "ヘラクレス ♂ 88mm",
    capacity: 1,
    applicants: 24,
    remain: "残り18時間",
    seller: "@kabukuwa_lover · 貢献 L4",
    listedAt: 3,
    preferenceMatch: true,
    species: "hercules",
  },
];

export type PrioritySortMode = "preference-new" | "new" | "deadline";

export function sortPriorityListings(
  items: MockPriorityListing[],
  sortMode: PrioritySortMode,
): MockPriorityListing[] {
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

export function priorityCardMeta(item: MockPriorityListing): string {
  return `定員${item.capacity}名 · 応募${item.applicants}名 · ${item.remain}`;
}
