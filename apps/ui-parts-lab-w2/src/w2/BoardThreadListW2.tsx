import { useMemo } from "react";

import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import { BoardShell, BoardTabs } from "@ihl/ui-catalog/components/features/board/shared";

import {
  BOARD_COPY,
  OFFICIAL_BOARD_TABS,
  OFFICIAL_SIDE_NAV,
  resolveBoardKind,
  resolveWalkId,
} from "./board-config";
import { MOCK_THREADS } from "./board-mock";

type BoardThreadListProps = W2ComponentProps & {
  componentPrefix: string;
};

function ThreadSkeletonList() {
  return (
    <ul className="ihl-board-thread-list" aria-busy="true" aria-label="スレッド一覧を読み込み中">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="ihl-board-thread-row ihl-board-thread-row--skeleton">
          <span className="ihl-board-thread-row__title">—</span>
          <span className="ihl-board-thread-row__meta">—</span>
        </li>
      ))}
    </ul>
  );
}

function BoardThreadListBody({
  kind,
  state,
  onAction,
  onNavigate,
}: {
  kind: ReturnType<typeof resolveBoardKind>;
  state: W2ComponentProps["state"];
  onAction?: W2ComponentProps["onAction"];
  onNavigate?: W2ComponentProps["onNavigate"];
}) {
  const copy = BOARD_COPY[kind];
  const threads = useMemo(() => MOCK_THREADS[kind], [kind]);

  if (state === "loading") {
    return <ThreadSkeletonList />;
  }

  if (state === "error") {
    return (
      <div className="ihl-board-card ihl-board-card--wide" data-testid="board-thread-error">
        <h3 className="ihl-board-card__title">読み込めませんでした</h3>
        <p className="ihl-board-card__desc">スレッド一覧の取得に失敗しました。</p>
        <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("retry")}>
          再試行
        </button>
      </div>
    );
  }

  if (state === "empty" || threads.length === 0) {
    return (
      <div className="ihl-board-card ihl-board-card--wide" data-testid="board-thread-empty">
        <h3 className="ihl-board-card__title">まだ投稿がありません</h3>
        <p className="ihl-board-card__desc">{copy.emptyLead}</p>
        <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("new-thread")}>
          {copy.primaryCta}
        </button>
      </div>
    );
  }

  return (
    <ul className="ihl-board-thread-list" data-testid="board-thread-list">
      {threads.map((thread) => (
        <li key={thread.id}>
          <button
            type="button"
            className="ihl-board-thread-row"
            onClick={() =>
              onNavigate?.("07-thread", {
                thread: thread.id,
                board: kind,
              })
            }
          >
            <span className="ihl-board-thread-row__title">{thread.title}</span>
            <span className="ihl-board-thread-row__meta">
              <span>{thread.responses} レス</span>
              <span aria-hidden>·</span>
              <span>{thread.lastUpdate}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function BoardThreadListContentAreaW2({
  state = "ok",
  screenId,
  onAction,
  onNavigate,
  className,
  componentPrefix,
}: BoardThreadListProps) {
  const walkId = resolveWalkId(screenId);
  const kind = resolveBoardKind(screenId);
  const copy = BOARD_COPY[kind];

  return (
    <BoardShell
      componentId={`${componentPrefix}__ContentArea`}
      state={state}
      className={["ihl-board-thread-screen", className].filter(Boolean).join(" ")}
    >
      <BoardTabs
        tabs={OFFICIAL_BOARD_TABS.map((tab) => ({
          id: tab.walkId,
          label: tab.label,
          active: tab.walkId === walkId,
          onClick: () => {
            if (tab.walkId !== walkId) onNavigate?.(tab.walkId);
          },
        }))}
      />

      <div className="ihl-board-layout">
        <nav className="ihl-board-side-nav" aria-label="板ナビ">
          {OFFICIAL_SIDE_NAV.map((item) => (
            <button
              key={item.walkId}
              type="button"
              className="ihl-board-side-nav__item"
              onClick={() => onNavigate?.(item.walkId)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ihl-board-main">
          <h2 className="ihl-board__title">{copy.title}</h2>
          <p className="ihl-board__lead">{copy.lead}</p>

          <BoardThreadListBody kind={kind} state={state} onAction={onAction} onNavigate={onNavigate} />
        </div>
      </div>
    </BoardShell>
  );
}

export function BoardThreadListPrimaryActionW2({
  screenId,
  onAction,
  className,
  componentPrefix,
}: BoardThreadListProps) {
  const kind = resolveBoardKind(screenId);
  const copy = BOARD_COPY[kind];

  return (
    <div data-component-id={`${componentPrefix}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton type="button" data-testid="board-thread-primary" onClick={() => onAction?.("new-thread")}>
        {copy.primaryCta}
      </PrimaryButton>
    </div>
  );
}

export function BoardThreadListStatePanelW2({ componentPrefix }: BoardThreadListProps) {
  return <div data-component-id={`${componentPrefix}__StatePanel`} data-w2-patched="true" aria-hidden />;
}

/** 07g — 愚痴板 */
export function BoardGripeContentAreaW2(props: W2ComponentProps) {
  return <BoardThreadListContentAreaW2 {...props} componentPrefix="ihl-07-board-post---" />;
}
export function BoardGripePrimaryActionW2(props: W2ComponentProps) {
  return <BoardThreadListPrimaryActionW2 {...props} componentPrefix="ihl-07-board-post---" />;
}
export function BoardGripeStatePanelW2(props: W2ComponentProps) {
  return <BoardThreadListStatePanelW2 {...props} componentPrefix="ihl-07-board-post---" />;
}

/** 07b — 改善提案板 · スレ一覧 */
export function BoardImproveContentAreaW2(props: W2ComponentProps) {
  return <BoardThreadListContentAreaW2 {...props} componentPrefix="ihl-07-board-thread-post" />;
}
export function BoardImprovePrimaryActionW2(props: W2ComponentProps) {
  return <BoardThreadListPrimaryActionW2 {...props} componentPrefix="ihl-07-board-thread-post" />;
}
export function BoardImproveStatePanelW2(props: W2ComponentProps) {
  return <BoardThreadListStatePanelW2 {...props} componentPrefix="ihl-07-board-thread-post" />;
}

/** registry 互換エイリアス（07b 一覧 · ihl-07-board-thread-post） */
export const BoardThreadPostContentAreaW2 = BoardImproveContentAreaW2;
export const BoardThreadPostPrimaryActionW2 = BoardImprovePrimaryActionW2;
export const BoardThreadPostStatePanelW2 = BoardImproveStatePanelW2;
