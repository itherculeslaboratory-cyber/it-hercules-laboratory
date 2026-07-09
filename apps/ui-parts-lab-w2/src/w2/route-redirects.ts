/** 3101 専用 — 旧 walkId を charter 準拠導線へリダイレクト */
export type W2RouteRedirect = {
  target: string;
  params?: Record<string, string>;
};

export const W2_ROUTE_REDIRECTS: Record<string, W2RouteRedirect> = {
  /** Q4:A — GMO 独立 23 を stepper Stage3 へ */
  "23": { target: "06b", params: { matched: "1", stage: "3" } },
  /** Q3:C — 06b 多画面を 1 画面 stepper へ */
  "06b-s2": { target: "06b", params: { matched: "1", stage: "2" } },
  "06b-s3": { target: "06b", params: { matched: "1", stage: "3" } },
  /** Q2:A — 抽選中間画面を 06a タブ統合へ（apply は独立画面を維持） */
  "06lot-tab": { target: "06a", params: { tab: "lottery" } },
  "06lot-result": { target: "06a", params: { tab: "lottery", lotteryStep: "result" } },
  "06lot-lose": { target: "06a", params: { tab: "lottery", lotteryStep: "lose" } },
  /** Q2:A — 優先順中間画面を 06a タブ統合へ */
  "06pri-tab": { target: "06a", params: { tab: "priority" } },
  "06pri-queue": { target: "06a", params: { tab: "priority", priorityStep: "queue" } },
  "06pri-lose": { target: "06a", params: { tab: "priority", priorityStep: "lose" } },
  /** Q2:A — オークション入札を 06a タブ経由へ */
  "06auc": { target: "06a", params: { tab: "auction" } },
};

export function getW2RouteRedirect(screenId: string): W2RouteRedirect | null {
  return W2_ROUTE_REDIRECTS[screenId] ?? null;
}
