import type { ReactNode } from "react";
import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import "./vote.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

export function PairwiseNullStatePanel(_props: W2ComponentProps) {
  return null;
}

function VoteShell({ componentId, state = "ok", className, children }: W2ComponentProps & { componentId: string; children: ReactNode }) {
  return (
    <section className={["ihl-vote", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

const ID = "ihl-10-preference-pairwise";

export function PairwiseContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <VoteShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <p className="ihl-vote__crumb">
        <button type="button" className="ihl-vote-links" onClick={() => hot(onAction, 1)}>
          ホーム
        </button>
        {" › "}好み
      </p>
      <h2 className="ihl-vote__title">好み pairwise</h2>
      <p className="ihl-vote__lead">どちらの UI が好みですか？</p>
      <div className="ihl-vote-pair">
        <button type="button" className="ihl-vote-pair__card" onClick={() => hot(onAction, 0)}>
          <span className="ihl-vote-pair__label">案 A</span>
          <span>コンパクト · ダーク</span>
        </button>
        <button type="button" className="ihl-vote-pair__card" onClick={() => hot(onAction, 0)}>
          <span className="ihl-vote-pair__label">案 B</span>
          <span>余白多め · カード型</span>
        </button>
      </div>
      <div className="ihl-vote-preview" onClick={() => hot(onAction, 0)} role="button" tabIndex={0}>
        プレビュー帯 — 選択した好みを反映
      </div>
      <button type="button" className="ihl-vote-links" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        ホーム
      </button>
    </VoteShell>
  );
}

export function PairwisePrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        次のペア
      </PrimaryButton>
    </div>
  );
}

export { PairwiseNullStatePanel as PairwiseStatePanel };
