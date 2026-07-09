/** 06detail / 06bid 系 — URL ?mode= と fixed= の解釈を一元化 */
export type MarketListingMode = "auction" | "priority" | "lottery" | "fixed";

export function resolveMarketListingMode(screenParams?: Record<string, string>): MarketListingMode {
  const mode = screenParams?.mode?.trim().toLowerCase();
  if (mode === "lottery") return "lottery";
  if (mode === "priority") return "priority";
  if (screenParams?.fixed === "1") return "fixed";
  return "auction";
}

export function isMarketListingMode(
  screenParams: Record<string, string> | undefined,
  target: Exclude<MarketListingMode, "auction" | "fixed">,
): boolean {
  return resolveMarketListingMode(screenParams) === target;
}
