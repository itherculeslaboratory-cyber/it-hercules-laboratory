import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { BoardCategoryCard, BoardCrumb, BoardHubShortcuts, BoardNullStatePanel, BoardShell, BoardTabs, hot } from "./shared";

const ID = "ihl-07-board-hub";

export function BoardHubContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <BoardCrumb parts={[{ label: "掲示板" }, { label: "ハブ" }]} />
      <BoardHubShortcuts
        onAction={onAction}
        shortcuts={[
          { label: "改善提案", hotspot: 0 },
          { label: "愚痴板", hotspot: 1 },
        ]}
      />
      <h2 className="ihl-board__title">掲示板</h2>
      <p className="ihl-board__lead">目的に合った板を選んでスレッドを読む・投稿する</p>
      <BoardTabs
        tabs={[
          { id: "gripe", label: "愚痴", onClick: () => hot(onAction, 1) },
          { id: "improve", label: "改善提案", active: true, onClick: () => hot(onAction, 0) },
          { id: "paper", label: "論文", onClick: () => hot(onAction, 2) },
          { id: "other", label: "その他", onClick: () => hot(onAction, 3) },
        ]}
      />
      <div className="ihl-board-grid">
        <BoardCategoryCard
          icon="🌧"
          title="愚痴"
          desc="感情を整理する。匿名性高め。"
          count="128 スレッド"
          onOpen={() => hot(onAction, 1)}
        />
        <BoardCategoryCard
          icon="💡"
          title="改善提案"
          desc="機能の改善を提案・議論する。"
          count="64 スレッド"
          onOpen={() => hot(onAction, 0)}
        />
        <BoardCategoryCard
          icon="📄"
          title="論文"
          desc="研究・論文を共有して議論する。"
          count="37 スレッド"
          onOpen={() => hot(onAction, 2)}
        />
        <BoardCategoryCard
          icon="▦"
          title="その他"
          desc="上記に当てはまらない話題。"
          count="52 スレッド"
          onOpen={() => hot(onAction, 3)}
        />
      </div>
      <button type="button" className="ihl-board-card__open" style={{ marginTop: 16 }} onClick={() => hot(onAction, 4)}>
        コンポーネント掲示板 →
      </button>
      <div className="ihl-board-shortcuts" style={{ marginTop: 12 }} aria-label="深い導線ショートカット">
        <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.("11")}>
          争い部屋
        </button>
        <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.("01")}>
          ホーム
        </button>
      </div>
    </BoardShell>
  );
}

export function BoardHubPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        改善提案を開く
      </PrimaryButton>
    </div>
  );
}

export { BoardNullStatePanel as BoardHubStatePanel };
