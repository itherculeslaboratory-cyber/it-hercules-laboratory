import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { BoardCrumb, BoardNullStatePanel, BoardPost, BoardShell, hot } from "./shared";

const ID = "ihl-07-board-thread-post";

const THREADS = {
  "07b": {
    title: "観測フローの改善について",
    crumb: [{ label: "掲示板" }, { label: "改善提案" }],
    crumbHot: 1,
    posts: [
      { author: "@penguin_obs", time: "2025/05/20 09:14", body: "手入力のステップが多く、受信後の検証を自動化できませんか。" },
      { author: "@arctic_fox", time: "2025/05/20 10:02", body: "アラート閾値がチームごとにバラバラ。共通プリセットが欲しい。" },
      { author: "@sea_turtle", time: "2025/05/20 11:30", body: "ログ粒度が粗く、原因調査に時間がかかる。構造化ログを。" },
    ],
    primary: "返信する",
    primaryHot: 0,
  },
  "07o": {
    title: "雑談・その他スレッド",
    crumb: [{ label: "掲示板" }, { label: "その他" }],
    crumbHot: 0,
    posts: [
      { author: "@lab_user", time: "2025/05/18 14:00", body: "今シーズンの幼虫の調子が良いです。" },
      { author: "@beetle_fan", time: "2025/05/19 09:22", body: "展示会の情報共有スレッドです。" },
    ],
    primary: "新規投稿",
    primaryHot: 1,
  },
};

export function BoardThreadContentArea({ state = "ok", screenId, onAction, className }: W2ComponentProps) {
  const key = screenId === "07o" ? "07o" : "07b";
  const thread = THREADS[key];

  return (
    <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <BoardCrumb parts={thread.crumb.map((p, i) => (i === 0 ? { ...p, action: () => hot(onAction, thread.crumbHot) } : p))} />
      <h2 className="ihl-board__title">{thread.title}</h2>
      <div className="ihl-board-thread">
        {thread.posts.map((p, i) => (
          <BoardPost
            key={p.author}
            author={p.author}
            time={p.time}
            body={p.body}
            onQuote={() => hot(onAction, 0)}
            onDispute={i === 1 && key === "07b" ? () => hot(onAction, 0) : undefined}
          />
        ))}
      </div>
      <div className="ihl-board-compose">
        <textarea className="ihl-form-control" placeholder="メッセージを入力してください…" aria-label="返信" readOnly />
      </div>
    </BoardShell>
  );
}

export function BoardThreadPrimaryAction({ screenId, onAction, className }: W2ComponentProps) {
  const key = screenId === "07o" ? "07o" : "07b";
  const thread = THREADS[key];

  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, thread.primaryHot)}>
        {thread.primary}
      </PrimaryButton>
    </div>
  );
}

export { BoardNullStatePanel as BoardThreadStatePanel };
