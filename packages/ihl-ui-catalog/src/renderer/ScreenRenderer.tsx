import { BrandChrome } from "../components/BrandChrome";
import { resolveCatalogComponent } from "../registry";
import type { ScreenDef, W2ComponentProps } from "../types/w2";
import "../tokens/civ.css";
import "../components/features/observation/observation.css";
import "../components/features/market/market.css";
import "../components/features/board/board.css";
import "../components/features/profile/profile.css";
import "../components/features/settings/settings.css";
import "../components/features/economy/economy.css";
import "../components/features/vote/vote.css";
import "./screen-renderer.css";
import "./region-part.css";
import "../components/form-field.css";
import "../components/features/_shared/feature-screen.css";

type ScreenRendererProps = {
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
    if (targetId !== def.screen_id || params) onNavigate?.(targetId, params);
  };

  const base: W2ComponentProps = {
    state: "ok",
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
    return {
      ...base,
      onAction: (action) => {
        if (action === "submit" || action === "sent") onNavigate?.("O2");
      },
    };
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
  return base;
}

/** ScreenDef → React 汎用レンダラ */
export function ScreenRenderer({ def, screenParams, onNavigate }: ScreenRendererProps) {
  const layout = def.layout ?? "standard";
  const chrome = def.nodes.find((n) => n.component_id === "ihl-brand-chrome");
  const contentNodes = def.nodes.filter((n) => n.component_id !== "ihl-brand-chrome");

  const screenClass =
    layout === "auth" ? `ihl-screen ihl-screen--auth ihl-screen--${def.screen_id.toLowerCase()}` : "ihl-screen ihl-screen--standard";

  return (
    <div className={screenClass} data-screen-id={def.screen_id}>
      {chrome && (
        <BrandChrome
          {...wireProps(chrome.id, def, screenParams, onNavigate)}
          className={chrome.props?.className as string | undefined}
        />
      )}
      <main className={layout === "auth" ? "ihl-screen__main" : "ihl-screen-standard__main"}>
        {contentNodes.map((node) => {
          const Comp = resolveCatalogComponent(node.component_id);
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
          return <Comp key={node.id} {...props} className={node.props?.className as string | undefined} />;
        })}
      </main>
    </div>
  );
}
