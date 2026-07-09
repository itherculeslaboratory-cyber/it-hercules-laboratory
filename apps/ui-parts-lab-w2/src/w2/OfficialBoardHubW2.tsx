import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import {
  BoardCategoryCard,
  BoardShell,
  hot,
} from "@ihl/ui-catalog/components/features/board/shared";
import { OFFICIAL_BOARDS } from "./board-config";

const ID = "ihl-07-board-official-hub";

function openBoard(
  board: (typeof OFFICIAL_BOARDS)[number],
  onAction: W2ComponentProps["onAction"],
  onNavigate: W2ComponentProps["onNavigate"],
) {
  hot(onAction, board.hotspot);
  onNavigate?.(board.target);
}

/** 07a-official — 公式掲示板ハブ · 愚痴 + 改善 2 カード */
export function OfficialBoardHubContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", onAction, onNavigate, className } = props;

  return (
    <BoardShell
      componentId={`${ID}__ContentArea`}
      state={state}
      className={`ihl-board-hub ihl-board-hub--official ${className ?? ""}`.trim()}
    >
      <h2 className="ihl-board__title">公式掲示板</h2>
      <p className="ihl-board__lead">愚痴 · 改善 — 板を選んでスレッドを読む · 投稿する</p>

      {state === "loading" ? (
        <div className="ihl-board-grid ihl-board-grid--2" aria-busy="true">
          {OFFICIAL_BOARDS.map((b) => (
            <div key={b.id} className="ihl-board-card ihl-board-card--pillar" style={{ opacity: 0.45 }}>
              <span className="ihl-board-card__icon">{b.icon}</span>
              <h3 className="ihl-board-card__title">{b.title}</h3>
            </div>
          ))}
        </div>
      ) : state === "empty" || state === "error" ? (
        <div className="ihl-board-card ihl-board-card--wide ihl-board-card--pillar" data-testid="official-hub-error">
          <h3 className="ihl-board-card__title">
            {state === "error" ? "読み込めませんでした" : "板一覧がありません"}
          </h3>
          <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("retry")}>
            再試行
          </button>
        </div>
      ) : (
        <div className="ihl-board-grid ihl-board-grid--2" data-testid="official-hub-grid">
          {OFFICIAL_BOARDS.map((board) => (
            <BoardCategoryCard
              key={board.id}
              icon={board.icon}
              title={board.title}
              desc={board.desc}
              count={`${board.threadCount} スレッド`}
              onOpen={() => openBoard(board, onAction, onNavigate)}
            />
          ))}
        </div>
      )}

      {state === "ok" && (
        <footer className="ihl-board-secondary">
          <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.("07a")}>
            ← 知の広場へ
          </button>
        </footer>
      )}
    </BoardShell>
  );
}

export function OfficialBoardHubPrimaryActionW2(props: W2ComponentProps) {
  const { onAction, onNavigate, className } = props;
  const gripe = OFFICIAL_BOARDS[0]!;

  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton type="button" data-testid="official-hub-primary" onClick={() => openBoard(gripe, onAction, onNavigate)}>
        愚痴板を開く
      </PrimaryButton>
    </div>
  );
}

export function OfficialBoardHubStatePanelW2(_props: W2ComponentProps) {
  return <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true" aria-hidden />;
}
