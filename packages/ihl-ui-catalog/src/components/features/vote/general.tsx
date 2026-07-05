import type { ReactNode } from "react";
import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import "./vote.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

export function VoteNullStatePanel(_props: W2ComponentProps) {
  return null;
}

function VoteShell({ componentId, state = "ok", className, children }: W2ComponentProps & { componentId: string; children: ReactNode }) {
  return (
    <section className={["ihl-vote", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

const ID = "ihl-20-vote-general";

export function VoteGeneralContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <VoteShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <p className="ihl-vote__crumb">
        <button type="button" onClick={() => hot(onAction, 3)}>
          ホーム
        </button>
        {" › "}投票 › 一般投票（2026-Q2）
      </p>
      <h2 className="ihl-vote__title">一般投票</h2>
      <p className="ihl-vote__lead">次期 UI 刷新案 — 候補を 1 つ選んで投票してください。</p>
      <button type="button" className="ihl-vote-candidate ihl-vote-candidate--selected" onClick={() => hot(onAction, 0)}>
        <strong>候補 A — 観測 UI 刷新案</strong>
        <span>コンパクトなフィルタ配置 · 類似スコアバー統合</span>
      </button>
      <button type="button" className="ihl-vote-candidate" onClick={() => hot(onAction, 0)}>
        <strong>候補 B — 血統 OS 連携強化</strong>
        <span>Cross 画面から観測への導線追加</span>
      </button>
      <div className="ihl-vote-links">
        <button type="button" onClick={() => hot(onAction, 2)}>
          免罪符ショップ
        </button>
        <button type="button" onClick={() => hot(onAction, 3)}>
          ホーム
        </button>
      </div>
    </VoteShell>
  );
}

export function VoteGeneralPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 1)}>
        投票する
      </PrimaryButton>
    </div>
  );
}

export { VoteNullStatePanel as VoteGeneralStatePanel };
