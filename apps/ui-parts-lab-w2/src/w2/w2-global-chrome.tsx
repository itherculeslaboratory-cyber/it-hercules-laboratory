import type { ReactNode } from "react";
import { StandardShell } from "@ihl/ui-catalog/components/shared/StandardShell";
import "@ihl/ui-catalog/components/shared/standard-shell.css";
import { shouldShowW2DeepChrome } from "./deep-chrome-screens";

/** ナビ・ホーム §3 #3b · ADR-H-14 — 全3101画面共通フッター */
export const W2_FOOTER_BAR: { label: string; target: string; hotspot: number }[] = [
  { label: "愚痴", target: "07g", hotspot: 12 },
  { label: "改善提案", target: "07b", hotspot: 13 },
  { label: "投票", target: "20vote", hotspot: 10 },
  { label: "Builder", target: "16", hotspot: 4 },
];

/** ナビ・ホーム §3 #1 — 全3101画面共通ヘッダー */
export const W2_HEADER_ACTIONS: { label: string; target: string; hotspot?: number }[] = [
  { label: "観測対象ナビゲータ → 対象を選ぶ", target: "05ctx", hotspot: 0 },
  { label: "マイページ", target: "PR" },
  { label: "通知", target: "PRnotif" },
  { label: "設定", target: "12hub", hotspot: 9 },
];

const HOME_SCREEN_ID = "01";

/** ホームは HomeCommandPanel 内 StandardShell（左ナビ込み）を正本とする */
export function shouldUseW2GlobalChrome(screenId: string, layout: string | undefined): boolean {
  if (layout === "auth") return false;
  if (screenId === HOME_SCREEN_ID) return false;
  /** 観測・マーケット深葉は BrandChromeW2 + 画面内導線を正本 — StandardShell 二重禁止 */
  if (shouldShowW2DeepChrome(screenId)) return false;
  return true;
}

type W2GlobalChromeProps = {
  breadcrumb: string;
  onNavigate?: (target: string) => void;
  children: ReactNode;
};

/** 3101 共通 — ヘッダー+フッターのみ（左ナビなし · DeepNav と併用可） */
export function W2GlobalChrome({ breadcrumb, onNavigate, children }: W2GlobalChromeProps) {
  return (
    <StandardShell
      breadcrumb={breadcrumb}
      onNavigate={onNavigate}
      headerActions={W2_HEADER_ACTIONS.map(({ label, target }) => ({ label, target }))}
      footerBar={W2_FOOTER_BAR.map(({ label, target }) => ({ label, target }))}
    >
      {children}
    </StandardShell>
  );
}
