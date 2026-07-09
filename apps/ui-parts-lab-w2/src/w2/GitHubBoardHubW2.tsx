import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import { BoardShell, hot } from "@ihl/ui-catalog/components/features/board/shared";
import { MOCK_GITHUB_BOARDS } from "./board-mock";

const ID = "ihl-07-github-board-hub";
const REPO_ISSUES =
  "https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory/issues";

/** 07gh — GitHub 掲示板柱 · link-out 索引（iframe 禁止） */
export function GitHubBoardHubContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", onAction, onNavigate, className } = props;

  return (
    <BoardShell
      componentId={`${ID}__ContentArea`}
      state={state}
      className={`ihl-board-hub ihl-board-hub--github ${className ?? ""}`.trim()}
    >
      <h2 className="ihl-board__title">GitHub 掲示板</h2>
      <p className="ihl-board__lead">
        改善履歴 · component 議論は GitHub 正本。IHL 内は索引と link-out のみ（iframe 禁止）。
      </p>

      {state === "loading" ? (
        <div className="ihl-github-board-grid" aria-busy="true">
          {MOCK_GITHUB_BOARDS.map((b) => (
            <article key={b.id} className="ihl-github-board-card ihl-github-board-card--skeleton">
              <h3>{b.displayName}</h3>
            </article>
          ))}
        </div>
      ) : state === "empty" || state === "error" ? (
        <div className="ihl-board-card ihl-board-card--wide">
          <h3 className="ihl-board-card__title">
            {state === "error" ? "読み込めませんでした" : "機能板がありません"}
          </h3>
          <button type="button" className="ihl-board-card__open" onClick={() => onAction?.("retry")}>
            再試行
          </button>
        </div>
      ) : (
        <div className="ihl-github-board-grid" data-testid="github-board-list">
          {MOCK_GITHUB_BOARDS.map((board, index) => (
            <article key={board.id} className="ihl-github-board-card">
              <header className="ihl-github-board-card__head">
                <h3 className="ihl-github-board-card__title">{board.displayName}</h3>
                <span className="ihl-github-board-card__badge">{board.featureId}</span>
              </header>
              {board.summary && <p className="ihl-github-board-card__desc">{board.summary}</p>}
              {board.issueLines && board.issueLines.length > 0 && (
                <ul className="ihl-github-board-card__issues" aria-label="Issues 要約">
                  {board.issueLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
              <footer className="ihl-github-board-card__foot">
                <span className="ihl-github-board-card__meta">{board.openIssues} open issues</span>
                <a
                  href={board.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ihl-board-card__open"
                  onClick={() => hot(onAction, index)}
                >
                  GitHub で開く →
                </a>
              </footer>
            </article>
          ))}
        </div>
      )}

      {state === "ok" && (
        <footer className="ihl-board-secondary">
          <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.("19board")}>
            コンポーネント掲示板 →
          </button>
          <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.("07a")}>
            ← 知の広場へ
          </button>
        </footer>
      )}
    </BoardShell>
  );
}

export function GitHubBoardHubPrimaryActionW2(props: W2ComponentProps) {
  const { onAction, className } = props;

  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton
        type="button"
        onClick={() => {
          hot(onAction, 0);
          window.open(REPO_ISSUES, "_blank", "noopener,noreferrer");
        }}
      >
        GitHub Issues を開く
      </PrimaryButton>
    </div>
  );
}

export function GitHubBoardHubStatePanelW2(_props: W2ComponentProps) {
  return <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true" aria-hidden />;
}
