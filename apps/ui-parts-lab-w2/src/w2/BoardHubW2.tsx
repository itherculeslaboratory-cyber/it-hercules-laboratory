import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import {
  BoardCategoryCard,
  BoardShell,
  hot,
} from "@ihl/ui-catalog/components/features/board/shared";
import { KNOWLEDGE_PILLARS } from "./board-config";

const ID = "ihl-07-board-hub";

function openPillar(
  pillar: (typeof KNOWLEDGE_PILLARS)[number],
  onAction: W2ComponentProps["onAction"],
  onNavigate: W2ComponentProps["onNavigate"],
) {
  hot(onAction, pillar.hotspot);
  onNavigate?.(pillar.target);
}

function PillarSkeletonGrid() {
  return (
    <div className="ihl-board-grid ihl-board-grid--3" aria-busy="true" aria-label="柱一覧を読み込み中">
      {KNOWLEDGE_PILLARS.map((p) => (
        <div key={p.id} className="ihl-board-card ihl-board-card--pillar" style={{ opacity: 0.45 }}>
          <span className="ihl-board-card__icon" aria-hidden>
            {p.icon}
          </span>
          <h3 className="ihl-board-card__title">{p.title}</h3>
          <p className="ihl-board-card__desc">—</p>
        </div>
      ))}
    </div>
  );
}

/** 07a — 知の広場 Hub · 3 柱（掲示板/論文/GitHub）· タブなし */
export function BoardHubContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", onAction, onNavigate, className } = props;

  return (
    <BoardShell
      componentId={`${ID}__ContentArea`}
      state={state}
      className={`ihl-board-hub ihl-board-hub--knowledge ${className ?? ""}`.trim()}
    >
      <h2 className="ihl-board__title">知の広場</h2>
      <p className="ihl-board__lead">話す · 検証する · 改善履歴を見る — 3 つの柱から選ぶ</p>

      {state === "loading" ? (
        <PillarSkeletonGrid />
      ) : state === "empty" ? (
        <div className="ihl-board-card ihl-board-card--wide ihl-board-card--pillar" data-testid="board-hub-empty">
          <h3 className="ihl-board-card__title">柱一覧がありません</h3>
          <p className="ihl-board-card__desc">知の広場のコンテンツがまだ用意されていません。</p>
          <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("retry")}>
            再読み込み
          </button>
        </div>
      ) : state === "error" ? (
        <div className="ihl-board-card ihl-board-card--wide ihl-board-card--pillar" data-testid="board-hub-error">
          <h3 className="ihl-board-card__title">読み込めませんでした</h3>
          <p className="ihl-board-card__desc">接続を確認して再試行してください。</p>
          <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("retry")}>
            再試行
          </button>
        </div>
      ) : (
        <div className="ihl-board-grid ihl-board-grid--3" data-testid="knowledge-hub-grid">
          {KNOWLEDGE_PILLARS.map((pillar) => (
            <BoardCategoryCard
              key={pillar.id}
              icon={pillar.icon}
              title={pillar.title}
              desc={pillar.desc}
              count={pillar.stat}
              onOpen={() => openPillar(pillar, onAction, onNavigate)}
            />
          ))}
        </div>
      )}
    </BoardShell>
  );
}

/** 主 CTA — 掲示板柱（07a-official）へ */
export function BoardHubPrimaryActionW2(props: W2ComponentProps) {
  const { onAction, onNavigate, className } = props;
  const boardPillar = KNOWLEDGE_PILLARS[0]!;

  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton
        type="button"
        data-testid="knowledge-hub-primary"
        onClick={() => openPillar(boardPillar, onAction, onNavigate)}
      >
        掲示板を開く
      </PrimaryButton>
    </div>
  );
}

export function BoardHubStatePanelW2(_props: W2ComponentProps) {
  return <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true" aria-hidden />;
}
