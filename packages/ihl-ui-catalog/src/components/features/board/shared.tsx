import type { ReactNode } from "react";
import type { W2ComponentProps } from "../../../types/w2";
import "./board.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

export function BoardNullStatePanel(_props: W2ComponentProps) {
  return null;
}

type ShellProps = W2ComponentProps & {
  componentId: string;
  children: ReactNode;
};

export function BoardShell({ componentId, state = "ok", className, children }: ShellProps) {
  return (
    <section className={["ihl-board", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

export function BoardCrumb({ parts }: { parts: { label: string; action?: () => void }[] }) {
  return (
    <p className="ihl-board__crumb">
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
export function BoardHubShortcuts({
  onAction,
  shortcuts,
}: {
  onAction?: W2ComponentProps["onAction"];
  shortcuts: { label: string; hotspot: number }[];
}) {
  if (shortcuts.length === 0) return null;
  return (
    <div className="ihl-board-shortcuts" aria-label="ショートカット">
      {shortcuts.slice(0, 2).map((s) => (
        <button key={s.label} type="button" className="ihl-board-card__open" onClick={() => hot(onAction, s.hotspot)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function BoardTabs({ tabs }: { tabs: { id: string; label: string; active?: boolean; onClick?: () => void }[] }) {
  return (
    <nav className="ihl-board-tabs" aria-label="掲示板カテゴリ">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={["ihl-board-tabs__tab", t.active ? "ihl-board-tabs__tab--active" : ""].filter(Boolean).join(" ")}
          onClick={t.onClick}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function BoardCategoryCard({
  icon,
  title,
  desc,
  count,
  onOpen,
}: {
  icon: string;
  title: string;
  desc: string;
  count: string;
  onOpen: () => void;
}) {
  return (
    <article className="ihl-board-card">
      <span className="ihl-board-card__icon" aria-hidden>
        {icon}
      </span>
      <h3 className="ihl-board-card__title">{title}</h3>
      <p className="ihl-board-card__desc">{desc}</p>
      <div className="ihl-board-card__foot">
        <span>{count}</span>
        <button type="button" className="ihl-board-card__open" onClick={onOpen}>
          開く →
        </button>
      </div>
    </article>
  );
}

export function BoardPost({
  author,
  time,
  body,
  onQuote,
  onDispute,
}: {
  author: string;
  time: string;
  body: string;
  onQuote?: () => void;
  onDispute?: () => void;
}) {
  return (
    <article className="ihl-board-post">
      <header className="ihl-board-post__head">
        <strong>{author}</strong>
        <span>{time}</span>
      </header>
      <p className="ihl-board-post__body">{body}</p>
      <div className="ihl-board-post__actions">
        {onQuote && (
          <button type="button" onClick={onQuote}>
            引用
          </button>
        )}
        {onDispute && (
          <button type="button" onClick={onDispute}>
            指摘
          </button>
        )}
      </div>
    </article>
  );
}
