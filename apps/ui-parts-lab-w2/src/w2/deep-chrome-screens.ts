/** Charter Q5:B — BrandChrome は観測・マーケット深葉のみ（3101） */
const OBS_DEEP = [
  "05a",
  "05b",
  "05confirm",
  "05ctx",
  "05fork",
  "05i",
  "05i-m",
  "05i-f",
  "05iot",
  "05td",
  "05tl",
  "05tm",
  "05tlf",
  "05d",
  "05ds",
  "18photo",
] as const;

const MARKET_DEEP = [
  "06a",
  "06detail",
  "06bid",
  "06b",
  "06list",
  "06auc",
  "06lot-apply",
  "06priority-apply",
  "06pri-tab",
  "06pri-queue",
  "06pri-lose",
] as const;

export const W2_DEEP_CHROME_SCREEN_IDS = new Set<string>([...OBS_DEEP, ...MARKET_DEEP]);

export function shouldShowW2DeepChrome(screenId: string): boolean {
  return W2_DEEP_CHROME_SCREEN_IDS.has(screenId);
}
