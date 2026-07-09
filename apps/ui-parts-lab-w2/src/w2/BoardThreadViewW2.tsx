import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import { BoardShell, BoardTabs } from "@ihl/ui-catalog/components/features/board/shared";

import {
  BOARD_COPY,
  OFFICIAL_BOARD_TABS,
  boardKindToWalkId,
  type BoardKind,
} from "./board-config";
import { formatAnchorQuote, getPostsForThread, getThreadById } from "./board-mock";
import { CiteMiniCardW2 } from "./CiteMiniCardW2";
import { extractCiteTokens, formatIhlCiteToken, IHL_CITE_TOKEN_RE } from "./cite-utils";

const ID = "ihl-07-board-thread-view";

function renderBodyWithAnchorsAndCites(
  body: string,
  onAnchorClick: (no: number) => void,
  onNavigate?: W2ComponentProps["onNavigate"],
) {
  const segments: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(IHL_CITE_TOKEN_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    const before = body.slice(lastIndex, match.index);
    if (before) {
      segments.push(
        <span key={`text-${lastIndex}`}>{renderAnchorText(before, onAnchorClick)}</span>,
      );
    }
    segments.push(
      <CiteMiniCardW2
        key={`cite-${match.index}`}
        token={match[0]!}
        compact
        onNavigate={onNavigate}
      />,
    );
    lastIndex = match.index + match[0]!.length;
  }

  const tail = body.slice(lastIndex);
  if (tail) {
    segments.push(<span key={`text-${lastIndex}`}>{renderAnchorText(tail, onAnchorClick)}</span>);
  }

  if (segments.length === 0) {
    return renderAnchorText(body, onAnchorClick);
  }

  return segments;
}

function renderAnchorText(body: string, onAnchorClick: (no: number) => void) {
  const parts = body.split(/(>>\d+)/g);
  return parts.map((part, i) => {
    const anchor = /^>>(\d+)$/.exec(part);
    if (anchor) {
      const no = Number(anchor[1]);
      return (
        <button
          key={`${part}-${i}`}
          type="button"
          className="ihl-board-post__anchor"
          onClick={() => onAnchorClick(no)}
        >
          {part}
        </button>
      );
    }
    return <span key={`${part}-${i}`}>{part}</span>;
  });
}

/** 07-thread — スレッド本文 · 5ch 型レス番号 + 引用 + cite mini-card */
export function BoardThreadViewContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", screenParams, onNavigate, className } = props;
  const threadId = screenParams?.thread_id ?? "thr_g1";
  const boardParam = (screenParams?.board as BoardKind | undefined) ?? "gripe";
  const thread = getThreadById(threadId);
  const kind = thread?.boardKind ?? boardParam;
  const walkId = boardKindToWalkId(kind);
  const copy = BOARD_COPY[kind];
  const posts = useMemo(() => getPostsForThread(threadId), [threadId]);
  const postRefs = useRef<Record<number, HTMLElement | null>>({});

  const scrollToPost = useCallback((responseNo: number) => {
    postRefs.current[responseNo]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const [draft, setDraft] = useState("");

  const appendQuote = (responseNo: number) => {
    const quote = `${formatAnchorQuote(responseNo)}\n`;
    setDraft((prev) => (prev.includes(quote.trim()) ? prev : prev + quote));
  };

  const appendCite = () => {
    const token = formatIhlCiteToken("observation", "cap_20260705-001");
    setDraft((prev) => (prev.includes(token) ? prev : `${prev}${prev && !prev.endsWith("\n") ? "\n" : ""}${token}`));
  };

  const draftCiteTokens = useMemo(() => extractCiteTokens(draft), [draft]);

  if (state === "loading") {
    return (
      <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
        <p className="ihl-board__lead">スレッドを読み込み中…</p>
      </BoardShell>
    );
  }

  if (state === "error" || !thread) {
    return (
      <BoardShell componentId={`${ID}__ContentArea`} state={state} className={className}>
        <div className="ihl-board-card ihl-board-card--wide">
          <h3 className="ihl-board-card__title">スレッドが見つかりません</h3>
          <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.(walkId)}>
            板一覧へ戻る
          </button>
        </div>
      </BoardShell>
    );
  }

  return (
    <BoardShell
      componentId={`${ID}__ContentArea`}
      state={state}
      className={["ihl-board-thread-view", className].filter(Boolean).join(" ")}
    >
      <BoardTabs
        tabs={OFFICIAL_BOARD_TABS.map((tab) => ({
          id: tab.walkId,
          label: tab.label,
          active: tab.walkId === walkId,
          onClick: () => onNavigate?.(tab.walkId),
        }))}
      />

      <header className="ihl-board-thread-view__head">
        <button type="button" className="ihl-board-card__open" onClick={() => onNavigate?.(walkId)}>
          ← {copy.title}
        </button>
        <h2 className="ihl-board__title">{thread.title}</h2>
        <p className="ihl-board-thread-view__meta">
          {thread.responses} レス · 最終 {thread.lastUpdate}
        </p>
      </header>

      <ol className="ihl-board-post-list" data-testid="board-post-list">
        {posts.map((post) => (
          <li
            key={post.id}
            id={`post-${post.responseNo}`}
            ref={(el) => {
              postRefs.current[post.responseNo] = el;
            }}
            className="ihl-board-post ihl-board-post--numbered"
          >
            <header className="ihl-board-post__head">
              <span className="ihl-board-post__no">{post.responseNo}</span>
              <strong>{post.author}</strong>
              <span>{post.time}</span>
              <span className="ihl-board-post__id">{post.id}</span>
            </header>
            <div className="ihl-board-post__body">
              {renderBodyWithAnchorsAndCites(post.body, scrollToPost, onNavigate)}
            </div>
            <div className="ihl-board-post__actions">
              <button type="button" onClick={() => appendQuote(post.responseNo)}>
                引用
              </button>
              <button type="button" onClick={() => onNavigate?.("11")}>
                指摘
              </button>
            </div>
          </li>
        ))}
      </ol>

      <section className="ihl-board-composer" aria-label="返信投稿">
        <div className="ihl-board-composer__tools">
          <button type="button" className="ihl-board-card__open" onClick={appendCite}>
            観測を cite
          </button>
          <span className="ihl-board-composer__hint">cite: [ihl:cite observation=…]</span>
        </div>
        {draftCiteTokens.length > 0 && (
          <div className="ihl-board-composer__cite-preview" data-testid="composer-cite-preview">
            {draftCiteTokens.map((token) => (
              <CiteMiniCardW2 key={token} token={token} onNavigate={onNavigate} />
            ))}
          </div>
        )}
        <textarea
          className="ihl-board-composer__input"
          rows={4}
          value={draft}
          placeholder="本文を入力… >>N で引用 · cite トークン可"
          onChange={(e) => setDraft(e.target.value)}
        />
      </section>
    </BoardShell>
  );
}

export function BoardThreadViewPrimaryActionW2(props: W2ComponentProps) {
  const { className } = props;

  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton type="button" data-testid="board-thread-post-submit">
        投稿
      </PrimaryButton>
    </div>
  );
}

export function BoardThreadViewStatePanelW2(_props: W2ComponentProps) {
  return <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true" aria-hidden />;
}
