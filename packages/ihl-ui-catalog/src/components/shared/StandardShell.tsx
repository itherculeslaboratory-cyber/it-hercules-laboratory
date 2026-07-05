import type { ReactNode } from "react";
import "./standard-shell.css";

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  target: string;
  active?: boolean;
};

type ShellAction = { label: string; target: string };

type StandardShellProps = {
  breadcrumb: string;
  children: ReactNode;
  nav?: NavItem[];
  onNavigate?: (screenId: string) => void;
  /** @deprecated prefer headerActions */
  contextBar?: ShellAction[];
  headerActions?: ShellAction[];
  footerBar?: ShellAction[];
};

export function StandardShell({
  breadcrumb,
  children,
  nav,
  onNavigate,
  contextBar,
  headerActions,
  footerBar,
}: StandardShellProps) {
  const topActions = headerActions ?? contextBar;
  return (
    <div className="ihl-shell">
      {nav && nav.length > 0 && (
        <nav className="ihl-shell__nav" aria-label="メインナビ">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "ihl-shell__nav-item",
                item.active ? "ihl-shell__nav-item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onNavigate?.(item.target)}
            >
              <span className="ihl-shell__nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      )}
      <div className="ihl-shell__main">
        <header className="ihl-shell__topbar">
          <p className="ihl-shell__breadcrumb">{breadcrumb}</p>
          {topActions && topActions.length > 0 && (
            <div className="ihl-shell__header-actions">
              {topActions.map((c) => (
                <button
                  key={c.target}
                  type="button"
                  className="ihl-shell__header-btn"
                  onClick={() => onNavigate?.(c.target)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="ihl-shell__content">{children}</div>
        {footerBar && footerBar.length > 0 && (
          <footer className="ihl-shell__footer">
            {footerBar.map((c) => (
              <button
                key={c.target}
                type="button"
                className="ihl-shell__footer-btn"
                onClick={() => onNavigate?.(c.target)}
              >
                {c.label}
              </button>
            ))}
          </footer>
        )}
      </div>
    </div>
  );
}

export function PanelStateMessage({
  state,
  emptyText = "データがありません",
  errorText = "読み込みに失敗しました",
}: {
  state: "loading" | "empty" | "error";
  emptyText?: string;
  errorText?: string;
}) {
  if (state === "loading") {
    return <p className="ihl-state-msg">読み込み中…</p>;
  }
  if (state === "empty") {
    return <p className="ihl-state-msg">{emptyText}</p>;
  }
  return <p className="ihl-state-msg ihl-state-msg--error">{errorText}</p>;
}
