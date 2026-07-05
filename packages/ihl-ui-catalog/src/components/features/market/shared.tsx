import type { ReactNode } from "react";
import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps, W2PartState } from "../../../types/w2";
import "./market.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

/** O2 — StatePanel 非表示（観測 hand UI 同型） */
export function MarketNullStatePanel(_props: W2ComponentProps) {
  return null;
}

type ShellProps = W2ComponentProps & {
  componentId: string;
  children: ReactNode;
};

export function MarketShell({ componentId, state = "ok", className, children }: ShellProps) {
  return (
    <section
      className={["ihl-mkt", className].filter(Boolean).join(" ")}
      data-component-id={componentId}
      data-state={state}
    >
      {children}
    </section>
  );
}

export function MarketCrumb({ parts }: { parts: { label: string; action?: () => void }[] }) {
  return (
    <p className="ihl-mkt__crumb">
      {parts.map((p, i) => (
        <span key={p.label}>
          {i > 0 && " › "}
          {p.action ? (
            <button type="button" onClick={p.action}>
              {p.label}
            </button>
          ) : (
            p.label
          )}
        </span>
      ))}
    </p>
  );
}

/** ハブ画面 — よく使う導線（最大2） */
export function MarketHubShortcuts({
  onAction,
  shortcuts,
}: {
  onAction?: W2ComponentProps["onAction"];
  shortcuts: { label: string; hotspot: number }[];
}) {
  if (shortcuts.length === 0) return null;
  return (
    <div className="ihl-mkt-shortcuts" aria-label="ショートカット">
      {shortcuts.slice(0, 2).map((s) => (
        <button key={s.label} type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, s.hotspot)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** 深い画面 — ホーム等の ghost ナビ（hotspot または onNavigate 直指定） */
export function MarketDeepNav({
  onAction,
  onNavigate,
  links,
}: {
  onAction?: W2ComponentProps["onAction"];
  onNavigate?: W2ComponentProps["onNavigate"];
  links: { label: string; hotspot?: number; screenId?: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav className="ihl-mkt-deep-nav" aria-label="画面ショートカット">
      {links.map((link) => (
        <button
          key={link.label}
          type="button"
          className="ihl-mkt-tabs__tab"
          onClick={() => {
            if (link.hotspot !== undefined) hot(onAction, link.hotspot);
            else if (link.screenId) onNavigate?.(link.screenId);
          }}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}

type Tab = { id: string; label: string; active?: boolean; onClick?: () => void };

export function MarketTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="ihl-mkt-tabs" aria-label="マーケットチャネル">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={["ihl-mkt-tabs__tab", t.active ? "ihl-mkt-tabs__tab--active" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-current={t.active ? "page" : undefined}
          onClick={t.onClick}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function StatusChip({ kind, children }: { kind: "listed" | "auction" | "sold" | "lottery" | "priority"; children: ReactNode }) {
  return <span className={`ihl-mkt-chip ihl-mkt-chip--${kind}`}>{children}</span>;
}

export function TradeStepper({ stage }: { stage: 1 | 2 | 3 | 4 }) {
  const steps = ["マッチング", "振込", "配送", "評価"];
  return (
    <div className="ihl-mkt-stepper" role="list" aria-label="取引ステップ">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < stage;
        const active = n === stage;
        return (
          <div key={label} style={{ display: "contents" }}>
            {i > 0 && <span className="ihl-mkt-step__line" aria-hidden />}
            <div
              className={[
                "ihl-mkt-step",
                done ? "ihl-mkt-step--done" : "",
                active ? "ihl-mkt-step--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="listitem"
            >
              <span className="ihl-mkt-step__dot">{done ? "✓" : n}</span>
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MarketStatePanel(props: W2ComponentProps) {
  return MarketNullStatePanel(props);
}

export function MarketBody({ state, emptyText, errorText, children }: { state?: W2PartState; emptyText?: string; errorText?: string; children: ReactNode }) {
  if (state === "loading") return <div className="ihl-mkt-loading">読み込み中…</div>;
  if (state === "empty") return <div className="ihl-mkt-empty">{emptyText ?? "出品がありません"}</div>;
  if (state === "error") return <div className="ihl-mkt-error">{errorText ?? "読み込めませんでした"}</div>;
  return <>{children}</>;
}

export function MarketFab({ children, onClick, testId }: { children: ReactNode; onClick: () => void; testId?: string }) {
  return (
    <div className="ihl-mkt-fab-wrap">
      <button type="button" className="ihl-mkt-fab" onClick={onClick} data-testid={testId}>
        <span aria-hidden>+</span>
        {children}
      </button>
    </div>
  );
}

export function MarketPrimary({ children, onClick, testId }: { children: ReactNode; onClick: () => void; testId?: string }) {
  return (
    <PrimaryButton type="button" onClick={onClick} testId={testId}>
      {children}
    </PrimaryButton>
  );
}

export function SpecimenPlaceholder() {
  return <div className="ihl-mkt-specimen" aria-hidden>🪲</div>;
}

export function ListingCard({
  title,
  price,
  chip,
  seller,
  onClick,
}: {
  title: string;
  price: string;
  chip: ReactNode;
  seller: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="ihl-mkt-card" onClick={onClick}>
      <div className="ihl-mkt-card__thumb" aria-hidden>🪲</div>
      <div className="ihl-mkt-card__body">
        <p className="ihl-mkt-card__name">{title}</p>
        <p className="ihl-mkt-card__price">{price}</p>
        <div className="ihl-mkt-card__meta">
          {chip}
          <span>{seller}</span>
        </div>
      </div>
    </button>
  );
}
