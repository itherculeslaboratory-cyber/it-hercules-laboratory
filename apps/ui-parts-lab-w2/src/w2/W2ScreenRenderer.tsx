import type { ScreenDef, W2ComponentProps, W2PartState } from "@ihl/ui-catalog/types/w2";
import "@ihl/ui-catalog/tokens/civ.css";
import "@ihl/ui-catalog/components/features/observation/observation.css";
import "@ihl/ui-catalog/components/features/market/market.css";
import "@ihl/ui-catalog/components/features/board/board.css";
import "@ihl/ui-catalog/components/features/profile/profile.css";
import "@ihl/ui-catalog/components/features/settings/settings.css";
import "@ihl/ui-catalog/components/features/economy/economy.css";
import "@ihl/ui-catalog/components/features/vote/vote.css";
import "@ihl/ui-catalog/renderer/screen-renderer.css";
import "@ihl/ui-catalog/renderer/region-part.css";
import "@ihl/ui-catalog/components/form-field.css";
import "@ihl/ui-catalog/components/features/_shared/feature-screen.css";
import { BrandChromeW2 } from "./BrandChromeW2";
import { resolveW2CatalogComponent } from "./registry";
import { shouldShowW2DeepChrome } from "./deep-chrome-screens";
import { isStatePanelComponentId, W2UniversalStatePanel } from "./W2UniversalStatePanel";
import { shouldUseW2GlobalChrome, W2GlobalChrome } from "./w2-global-chrome";

type W2ScreenRendererProps = {
  def: ScreenDef;
  screenParams?: Record<string, string>;
  onNavigate?: (screenId: string, params?: Record<string, string>) => void;
};

function wireProps(
  nodeId: string,
  def: ScreenDef,
  screenParams: Record<string, string> | undefined,
  onNavigate?: (id: string, params?: Record<string, string>) => void,
): W2ComponentProps {
  const go = (targetId: string, params?: Record<string, string>) => {
    if (targetId !== def.screen_id || params !== undefined) onNavigate?.(targetId, params);
  };

  const partState = screenParams?.partState as W2PartState | undefined;
  const resolvedState: W2PartState =
    partState && ["ok", "loading", "empty", "error"].includes(partState) ? partState : "ok";

  const base: W2ComponentProps = {
    state: resolvedState,
    screenId: def.screen_id,
    screenParams,
    onNavigate: go,
    onAction: (action, payload) => {
      const t = def.transitions?.find((tr) => tr.from === `${nodeId}.${action}` || tr.from === action);
      if (!t) return;
      const payloadParams =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, string>)
          : undefined;
      go(t.to_screen_id, { ...t.params, ...payloadParams });
    },
  };

  if (nodeId === "form" && def.screen_id === "O1") {
    return { ...base, onAction: () => onNavigate?.("O2") };
  }
  if (nodeId === "form" && def.screen_id === "O2") {
    return {
      ...base,
      onAction: (action) => {
        if (action === "terms" || action === "terms_link") onNavigate?.("O3");
        if (action === "complete" || action === "submit") onNavigate?.("01");
      },
    };
  }
  if (nodeId === "form" && def.screen_id === "O3") {
    return {
      ...base,
      onAction: (action) => {
        if (action === "back" || action === "agree") onNavigate?.("O2");
      },
    };
  }
  if (def.screen_id === "06detail" && nodeId === "part-1") {
    return {
      ...base,
      onAction: (action) => {
        if (action !== "hotspot.0") return;
        const mode = screenParams?.mode?.trim().toLowerCase();
        if (mode === "priority") {
          onNavigate?.("06priority-apply", { mode: "priority" });
          return;
        }
        if (mode === "lottery") {
          onNavigate?.("06lot-apply", { mode: "lottery" });
          return;
        }
        onNavigate?.("06bid", { mode: "auction" });
      },
    };
  }
  return base;
}

/** 3101 専用 ScreenRenderer — W2 実験コンポーネントを優先解決 */
export function W2ScreenRenderer({ def, screenParams, onNavigate }: W2ScreenRendererProps) {
  const layout = def.layout ?? "standard";
  const chromeNode = def.nodes.find((n) => n.component_id === "ihl-brand-chrome");
  const showChrome =
    layout === "auth" ? Boolean(chromeNode) : shouldShowW2DeepChrome(def.screen_id) && Boolean(chromeNode);
  const contentNodes = def.nodes.filter((n) => n.component_id !== "ihl-brand-chrome");
  const useGlobalChrome = shouldUseW2GlobalChrome(def.screen_id, layout);

  const screenClass =
    layout === "auth"
      ? `ihl-screen ihl-screen--auth ihl-screen--${def.screen_id.toLowerCase()}`
      : "ihl-screen ihl-screen--standard";

  const renderedNodes = contentNodes.map((node) => {
    const Comp = resolveW2CatalogComponent(node.component_id);
    if (!Comp) {
      return (
        <div key={node.id} className="ihl-screen__missing" data-missing={node.component_id}>
          部品未登録: {node.component_id}
        </div>
      );
    }
    const props = wireProps(node.id, def, screenParams, onNavigate);
    if (node.component_id === "ihl-00-onboarding-login__LoginMagicLinkForm") {
      return <Comp key={node.id} {...props} onAction={() => onNavigate?.("O2")} />;
    }
    if (node.component_id === "ihl-00-onboarding-signup__SignupOnboardingForm") {
      return (
        <Comp
          key={node.id}
          {...props}
          onOpenTerms={() => onNavigate?.("O3")}
          onComplete={() => onNavigate?.("01")}
        />
      );
    }
    if (node.component_id === "ihl-00-terms__TermsAgreementForm") {
      return (
        <Comp
          key={node.id}
          {...props}
          onAction={(action) => {
            if (action === "back" || action === "agree") onNavigate?.("O2");
          }}
        />
      );
    }
    if (isStatePanelComponentId(node.component_id)) {
      return (
        <W2UniversalStatePanel
          key={node.id}
          Inner={Comp}
          componentId={node.component_id}
          {...props}
          className={node.props?.className as string | undefined}
        />
      );
    }
    return <Comp key={node.id} {...props} className={node.props?.className as string | undefined} />;
  });

  const mainClass = layout === "auth" ? "ihl-screen__main" : "ihl-screen-standard__main";

  return (
    <div className={screenClass} data-screen-id={def.screen_id} data-w2-lab="3101">
      {showChrome && chromeNode && (
        <BrandChromeW2
          {...wireProps(chromeNode.id, def, screenParams, onNavigate)}
          className={chromeNode.props?.className as string | undefined}
        />
      )}
      {useGlobalChrome ? (
        <div className={mainClass}>
          <W2GlobalChrome breadcrumb={def.title} onNavigate={onNavigate}>
            {renderedNodes}
          </W2GlobalChrome>
        </div>
      ) : (
        <main className={mainClass}>{renderedNodes}</main>
      )}
    </div>
  );
}
