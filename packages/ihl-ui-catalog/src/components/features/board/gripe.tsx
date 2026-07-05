import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { BoardCrumb, BoardNullStatePanel, BoardPost, BoardShell, hot } from "./shared";

const ID = "ihl-07-board-post---";

export function BoardGripeContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <BoardCrumb parts={[{ label: "掲示板", action: () => hot(onAction, 0) }, { label: "愚痴" }]} />
      <h2 className="ihl-board__title">愚痴板</h2>
      <p className="ihl-board__lead">匿名性高め。感情を整理する場所です。</p>
      <div className="ihl-board-thread">
        <BoardPost author="匿名" time="2025/05/21 22:10" body="幼虫の脱皮タイミングが読めなくてイライラする…" />
        <BoardPost author="匿名" time="2025/05/21 23:05" body="観測入力、もう少しサクサクできないかな。" />
      </div>
      <div className="ihl-board-compose">
        <textarea className="ihl-form-control" placeholder="愚痴を書く…" aria-label="愚痴入力" readOnly />
      </div>
    </BoardShell>
  );
}

export function BoardGripePrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        愚痴を書く
      </PrimaryButton>
    </div>
  );
}

export { BoardNullStatePanel as BoardGripeStatePanel };
