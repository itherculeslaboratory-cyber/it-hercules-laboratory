/** Lab mock — sessionStorage でオークション入札状態を保持 */
export const AUCTION_LISTING_ID = "listing-hercules-78";

const STORAGE_KEY = "ihl-w2-auction-mock";

export type AuctionBidStatus = "none" | "highest" | "outbid";

export type AuctionBidMockState = {
  listingId: string;
  currentPrice: number;
  bidCount: number;
  hasBidders: boolean;
  myMaxBid: number | null;
  myCurrentBid: number | null;
  status: AuctionBidStatus;
  auctionEnded: boolean;
  won: boolean;
};

const DEFAULT_STATE: AuctionBidMockState = {
  listingId: AUCTION_LISTING_ID,
  currentPrice: 12_000,
  bidCount: 3,
  hasBidders: true,
  myMaxBid: null,
  myCurrentBid: null,
  status: "none",
  auctionEnded: false,
  won: false,
};

export function parseYen(value: string | number): number {
  if (typeof value === "number") return value;
  return Number.parseInt(String(value).replace(/[¥,\s]/g, ""), 10) || 0;
}

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** Yahoo 風入札単位 */
export function getBidIncrement(currentPrice: number): number {
  if (currentPrice < 1_000) return 10;
  if (currentPrice < 5_000) return 100;
  if (currentPrice < 10_000) return 250;
  return 500;
}

/** 最低入札額 — 入札者なしは現在価格、ありは現在+単位 */
export function getMinBid(currentPrice: number, hasBidders: boolean): number {
  if (!hasBidders) return currentPrice;
  return currentPrice + getBidIncrement(currentPrice);
}

export function loadAuctionBidState(listingId = AUCTION_LISTING_ID): AuctionBidMockState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, listingId };
    const parsed = JSON.parse(raw) as AuctionBidMockState;
    if (parsed.listingId !== listingId) return { ...DEFAULT_STATE, listingId };
    return parsed;
  } catch {
    return { ...DEFAULT_STATE, listingId };
  }
}

export function saveAuctionBidState(state: AuctionBidMockState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAuctionBidState(listingId = AUCTION_LISTING_ID): void {
  saveAuctionBidState({ ...DEFAULT_STATE, listingId });
}

export function validateBidAmount(
  amount: number,
  currentPrice: number,
  hasBidders: boolean,
): { ok: true; minBid: number; increment: number } | { ok: false; minBid: number; increment: number; message: string } {
  const increment = getBidIncrement(currentPrice);
  const minBid = getMinBid(currentPrice, hasBidders);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, minBid, increment, message: "入札額を入力してください" };
  }
  if (amount < minBid) {
    return {
      ok: false,
      minBid,
      increment,
      message: `最低入札額は ${formatYen(minBid)} です（入札単位 ${formatYen(increment)}）`,
    };
  }
  const diff = amount - minBid;
  if (diff > 0 && diff % increment !== 0) {
    return {
      ok: false,
      minBid,
      increment,
      message: `入札単位 ${formatYen(increment)} の倍数で入力してください`,
    };
  }
  return { ok: true, minBid, increment };
}

/** 自動入札 mock — maxBudget を現在価格へ反映 */
export function placeAutoBid(maxBudget: number): AuctionBidMockState {
  const state = loadAuctionBidState();
  const validation = validateBidAmount(maxBudget, state.currentPrice, state.hasBidders);
  if (!validation.ok) return state;

  const next: AuctionBidMockState = {
    ...state,
    myMaxBid: maxBudget,
    myCurrentBid: validation.minBid,
    currentPrice: validation.minBid,
    bidCount: state.bidCount + 1,
    hasBidders: true,
    status: "highest",
    auctionEnded: false,
    won: false,
  };
  saveAuctionBidState(next);
  return next;
}

export function simulateOutbid(): AuctionBidMockState {
  const state = loadAuctionBidState();
  const bump = getBidIncrement(state.currentPrice);
  const next: AuctionBidMockState = {
    ...state,
    currentPrice: state.currentPrice + bump,
    bidCount: state.bidCount + 1,
    status: "outbid",
  };
  saveAuctionBidState(next);
  return next;
}

export function endAuctionDemo(): AuctionBidMockState {
  const state = loadAuctionBidState();
  const won = state.status === "highest";
  const next: AuctionBidMockState = {
    ...state,
    auctionEnded: true,
    won,
  };
  saveAuctionBidState(next);
  return next;
}

export function isAuctionWon(): boolean {
  const state = loadAuctionBidState();
  return state.auctionEnded && state.won;
}
