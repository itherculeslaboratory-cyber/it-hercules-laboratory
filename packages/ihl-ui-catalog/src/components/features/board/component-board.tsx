import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { BoardCrumb, BoardNullStatePanel, BoardShell, hot } from "./shared";

const ID = "ihl-19-component-board";

export function ComponentBoardContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <BoardCrumb
        parts={[
          { label: "ホーム", action: () => hot(onAction, 3) },
          { label: "掲示板", action: () => hot(onAction, 2) },
          { label: "コンポーネント掲示板" },
        ]}
      />
      <h2 className="ihl-board__title">コンポーネント掲示板</h2>
      <p className="ihl-board__lead">UI 部品・コンポーネント開発の議論</p>
      <div className="ihl-board-thread">
        <button type="button" className="ihl-board-issue-row" onClick={() => hot(onAction, 0)}>
          <span>
            <strong>GitHub issue #142</strong>
            <span style={{ display: "block", fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 4 }}>
              obs_search_grid の props 整理
            </span>
          </span>
          <span>→</span>
        </button>
        <button type="button" className="ihl-board-issue-row" onClick={() => hot(onAction, 1)}>
          <span>file-board スレッド</span>
          <span>→</span>
        </button>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" className="ihl-board-card__open" onClick={() => hot(onAction, 2)}>
          掲示板ハブ
        </button>
        <button type="button" className="ihl-board-card__open" onClick={() => hot(onAction, 3)}>
          ホーム
        </button>
      </div>
    </BoardShell>
  );
}

export function ComponentBoardPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        issue を開く
      </PrimaryButton>
    </div>
  );
}

export { BoardNullStatePanel as ComponentBoardStatePanel };
