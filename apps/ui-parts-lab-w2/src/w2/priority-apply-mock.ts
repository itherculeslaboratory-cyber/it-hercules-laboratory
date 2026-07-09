/** Lab mock — sessionStorage で PT 優先申込状態を保持（06bid 自動入札と同型） */
import type { MarketPriorityContext } from "./MarketEntityDetailShellW2";
import { MOCK_PRIORITY_CONTEXT } from "./MarketEntityDetailShellW2";

export const PRIORITY_LISTING_ID = "P1";

const STORAGE_KEY = "ihl-w2-priority-apply-mock";

export const PRIORITY_INCREMENT = 1;

export type PriorityApplyStatus = "none" | "leading" | "outbid";

export type PriorityApplyMockState = {
  listingId: string;
  highestCumulativePt: number;
  yourCumulativePt: number;
  yourRank: number;
  myMaxPt: number | null;
  myEffectivePt: number | null;
  status: PriorityApplyStatus;
  applied: boolean;
};

export function formatPt(amount: number): string {
  return `${amount} PT`;
}

export function parsePt(value: string | number): number {
  if (typeof value === "number") return value;
  return Number.parseInt(String(value).replace(/[,\sPTpt]/g, ""), 10) || 0;
}

/** キュー内の最高累計 PT（競合者 · 同数タイブレーク用の floor） */
export function getQueueHighestPt(ctx: MarketPriorityContext): number {
  const competitors = ctx.queueRows.filter((r) => !r.isYou);
  if (competitors.length === 0) return ctx.yourCoins;
  return Math.max(...competitors.map((r) => r.coins));
}

/** 申込可能な最低累計 PT — キュー最高値以上 */
export function getMinPriorityBid(highestPt: number): number {
  return highestPt;
}

/** 先頭取得に必要な累計 PT（同数は早い順のため +1） */
export function getMinWinPt(highestPt: number): number {
  return highestPt + PRIORITY_INCREMENT;
}

function defaultStateFromContext(ctx = MOCK_PRIORITY_CONTEXT): PriorityApplyMockState {
  const highest = getQueueHighestPt(ctx);
  return {
    listingId: PRIORITY_LISTING_ID,
    highestCumulativePt: highest,
    yourCumulativePt: ctx.yourCoins,
    yourRank: ctx.yourRank,
    myMaxPt: null,
    myEffectivePt: null,
    status: "none",
    applied: false,
  };
}

export function loadPriorityApplyState(listingId = PRIORITY_LISTING_ID): PriorityApplyMockState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStateFromContext();
    const parsed = JSON.parse(raw) as PriorityApplyMockState;
    if (parsed.listingId !== listingId) return defaultStateFromContext();
    return parsed;
  } catch {
    return defaultStateFromContext();
  }
}

export function savePriorityApplyState(state: PriorityApplyMockState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetPriorityApplyState(): void {
  savePriorityApplyState(defaultStateFromContext());
}

export function validatePriorityBidAmount(
  amount: number,
  highestPt: number,
): { ok: true; minBid: number; minWin: number } | { ok: false; minBid: number; minWin: number; message: string } {
  const minBid = getMinPriorityBid(highestPt);
  const minWin = getMinWinPt(highestPt);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, minBid, minWin, message: "累計 PT を入力してください" };
  }
  if (!Number.isInteger(amount)) {
    return { ok: false, minBid, minWin, message: "1 PT 単位で入力してください" };
  }
  if (amount < minBid) {
    return {
      ok: false,
      minBid,
      minWin,
      message: `最低累計 PT は ${formatPt(minBid)} です（キュー最高値以上）`,
    };
  }
  return { ok: true, minBid, minWin };
}

/** 自動入札 mock — maxPt を上限に +1 PT 単位で競合 */
export function placePriorityAutoBid(maxPt: number): PriorityApplyMockState {
  const state = loadPriorityApplyState();
  const validation = validatePriorityBidAmount(maxPt, state.highestCumulativePt);
  if (!validation.ok) return state;

  const minWin = validation.minWin;
  const effectivePt = maxPt >= minWin ? minWin : maxPt;
  const takesLead = effectivePt >= minWin;

  const next: PriorityApplyMockState = {
    ...state,
    myMaxPt: maxPt,
    myEffectivePt: effectivePt,
    yourCumulativePt: effectivePt,
    highestCumulativePt: Math.max(state.highestCumulativePt, effectivePt),
    yourRank: takesLead ? 1 : state.yourRank,
    status: takesLead ? "leading" : "none",
    applied: true,
  };
  savePriorityApplyState(next);
  return next;
}

export function simulatePriorityOutbid(): PriorityApplyMockState {
  const state = loadPriorityApplyState();
  if (state.myMaxPt == null) return state;

  const competitorPt = state.highestCumulativePt + PRIORITY_INCREMENT;
  const canAutoRebid = competitorPt <= state.myMaxPt;
  const effectivePt = canAutoRebid ? competitorPt : state.myEffectivePt;
  const takesLead = canAutoRebid && effectivePt >= getMinWinPt(state.highestCumulativePt);

  const next: PriorityApplyMockState = {
    ...state,
    highestCumulativePt: competitorPt,
    myEffectivePt: effectivePt ?? state.myEffectivePt,
    yourCumulativePt: effectivePt ?? state.yourCumulativePt,
    status: takesLead ? "leading" : "outbid",
    yourRank: takesLead ? 1 : state.yourRank + 1,
  };
  savePriorityApplyState(next);
  return next;
}
