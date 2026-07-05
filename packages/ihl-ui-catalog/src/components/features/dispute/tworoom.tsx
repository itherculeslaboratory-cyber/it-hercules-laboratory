import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { BoardCrumb, BoardNullStatePanel, BoardShell, hot } from "../board/shared";

const ID = "ihl-11-dispute-tworoom";

export function DisputeContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <BoardCrumb parts={[{ label: "掲示板", action: () => hot(onAction, 0) }, { label: "争い" }]} />
      <h2 className="ihl-board__title">二人部屋 — 指摘</h2>
      <div className="ihl-board-grid">
        <article className="ihl-board-post">
          <header className="ihl-board-post__head">
            <strong>部屋 A — 指摘側</strong>
          </header>
          <p className="ihl-board-post__body">観測フローの改善提案に対する指摘内容を整理してください。</p>
        </article>
        <article className="ihl-board-post">
          <header className="ihl-board-post__head">
            <strong>部屋 B — 被指摘側</strong>
          </header>
          <p className="ihl-board-post__body">反論・合意形成スペース。事実関係を明確に。</p>
        </article>
      </div>
    </BoardShell>
  );
}

export function DisputePrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        掲示板へ
      </PrimaryButton>
    </div>
  );
}

export { BoardNullStatePanel as DisputeStatePanel };
