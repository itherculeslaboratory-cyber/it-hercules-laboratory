import type { ComponentType, ReactNode } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";

export type W2ShellFeature =
  | "lineage"
  | "obs"
  | "market"
  | "board"
  | "profile"
  | "settings"
  | "paper"
  | "karma"
  | "vote"
  | "builder"
  | "device"
  | "misc";

const HUB: Record<W2ShellFeature, string> = {
  lineage: "03",
  obs: "05ctx",
  market: "06a",
  board: "07a",
  profile: "PR",
  settings: "12hub",
  paper: "09",
  karma: "08",
  vote: "20vote",
  builder: "16",
  device: "13",
  misc: "01",
};

const HUB_LABEL: Record<W2ShellFeature, string> = {
  lineage: "血統",
  obs: "観測",
  market: "マーケット",
  board: "掲示板",
  profile: "マイページ",
  settings: "設定",
  paper: "論文",
  karma: "カルマ",
  vote: "投票",
  builder: "UI Builder",
  device: "デバイス",
  misc: "ホーム",
};

type ShellConfig = {
  feature: W2ShellFeature;
  componentId: string;
  /** メイン領域のみフッターナビを付与 */
  showFooter?: boolean;
};

function W2FooterNav({
  feature,
  onNavigate,
  screenId,
}: {
  feature: W2ShellFeature;
  onNavigate?: W2ComponentProps["onNavigate"];
  screenId?: string;
}) {
  const hub = HUB[feature];
  if (!onNavigate) return null;
  return (
    <nav className="w2-hand-shell__footer" aria-label="W2 ショートカット">
      <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate("01")}>
        ホーム
      </button>
      {hub && hub !== screenId && (
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate(hub)}>
          {HUB_LABEL[feature]}
        </button>
      )}
    </nav>
  );
}

/** 3101 専用 — catalog hand UI を W2 層で包み、導線フッタと data-w2-patched を付与 */
export function withW2Shell(
  Inner: ComponentType<W2ComponentProps>,
  config: ShellConfig,
): ComponentType<W2ComponentProps> {
  const showFooter = config.showFooter ?? isMainRegion(config.componentId);

  function W2Wrapped(props: W2ComponentProps) {
    const { onNavigate, screenId } = props;
    return (
      <div
        className="w2-hand-shell"
        data-w2-patched="true"
        data-w2-feature={config.feature}
        data-w2-component={config.componentId}
      >
        <Inner {...props} />
        {showFooter && <W2FooterNav feature={config.feature} onNavigate={onNavigate} screenId={screenId} />}
      </div>
    );
  }
  W2Wrapped.displayName = `W2(${config.componentId})`;
  return W2Wrapped;
}

function isMainRegion(componentId: string): boolean {
  return (
    componentId.endsWith("__ContentArea") ||
    componentId.endsWith("Panel") ||
    componentId.endsWith("__CanvasDropZone") ||
    componentId.endsWith("__BuilderShell") ||
    componentId.endsWith("__GmoTransferPanel") ||
    componentId.includes("__CrossDashboard") ||
    componentId.includes("__GrowthDetail") ||
    componentId.includes("__MortalityList") ||
    componentId.includes("__MetricsDetail") ||
    componentId.includes("__PaperProgress") ||
    componentId.includes("__PaperTemplate")
  );
}

export function inferW2Feature(componentPrefix: string): W2ShellFeature | null {
  if (componentPrefix.startsWith("ihl-03-lineage")) return "lineage";
  if (componentPrefix.startsWith("ihl-05-obs") || componentPrefix.startsWith("ihl-18-photo")) return "obs";
  if (componentPrefix.startsWith("ihl-06-market") || componentPrefix.startsWith("ihl-22-pt") || componentPrefix.startsWith("ihl-23-gmo")) {
    return "market";
  }
  if (componentPrefix.startsWith("ihl-07-board") || componentPrefix.startsWith("ihl-07-github-board")) return "board";
  if (componentPrefix.startsWith("ihl-profile")) return "profile";
  if (componentPrefix.startsWith("ihl-12-settings")) return "settings";
  if (componentPrefix.startsWith("ihl-09-paper")) return "paper";
  if (componentPrefix.startsWith("ihl-08-karma")) return "karma";
  if (componentPrefix.startsWith("ihl-20-vote")) return "vote";
  if (componentPrefix.startsWith("ihl-16-")) return "builder";
  if (componentPrefix.startsWith("ihl-13-device")) return "device";
  if (componentPrefix.startsWith("ihl-14-contribution")) return "karma";
  if (componentPrefix.startsWith("ihl-10-preference")) return "misc";
  if (componentPrefix.startsWith("ihl-11-dispute")) return "misc";
  if (componentPrefix.startsWith("ihl-17-world")) return "builder";
  if (componentPrefix.startsWith("ihl-19-component")) return "builder";
  return null;
}

export function W2ShellOnly({ feature, children }: { feature: W2ShellFeature; children: ReactNode }) {
  return (
    <div className="w2-hand-shell" data-w2-patched="true" data-w2-feature={feature}>
      {children}
    </div>
  );
}
