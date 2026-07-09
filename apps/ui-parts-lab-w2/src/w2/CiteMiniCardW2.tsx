import { useCallback, useState } from "react";

import {
  copyCiteMarkdown,
  getMockCitePreview,
  parseIhlCiteToken,
  type CitePreview,
  type CiteRefParsed,
} from "./cite-utils";

type CiteMiniCardW2Props = {
  token: string;
  preview?: CitePreview;
  onNavigate?: (screenId: string, params?: Record<string, string>) => void;
  compact?: boolean;
};

function resolvePreview(token: string, preview?: CitePreview): { ref: CiteRefParsed; preview: CitePreview } | null {
  const ref = parseIhlCiteToken(token);
  if (!ref) return null;
  return { ref, preview: preview ?? getMockCitePreview(ref) };
}

/** 汎用引用 mini-card — blockquote 左ボーダー · permalink · コピー */
export function CiteMiniCardW2({ token, preview, onNavigate, compact }: CiteMiniCardW2Props) {
  const resolved = resolvePreview(token, preview);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!resolved) return;
    const ok = await copyCiteMarkdown(resolved.ref, resolved.preview);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }, [resolved]);

  if (!resolved) {
    return (
      <span className="ihl-cite-mini ihl-cite-mini--invalid" data-testid="cite-mini-invalid">
        {token}
      </span>
    );
  }

  const { ref, preview: p } = resolved;
  const isTombstone = p.status === "tombstone" || p.status === "hidden";

  const openPermalink = () => {
    if (ref.type === "observation") {
      onNavigate?.("05b", { capture_id: ref.id });
      return;
    }
    if (ref.type === "post" && ref.extras.thread) {
      onNavigate?.("07-thread", { thread_id: ref.extras.thread, board: ref.extras.board_kind ?? "gripe" });
    }
  };

  return (
    <figure
      className={[
        "ihl-cite-mini",
        isTombstone ? "ihl-cite-mini--tombstone" : "",
        compact ? "ihl-cite-mini--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="cite-mini-card"
      data-cite-type={ref.type}
    >
      <blockquote className="ihl-cite-mini__body">
        <p className="ihl-cite-mini__title">{p.title}</p>
        {p.subtitle && <p className="ihl-cite-mini__subtitle">{p.subtitle}</p>}
        {p.badges && p.badges.length > 0 && (
          <ul className="ihl-cite-mini__badges" aria-label="バッジ">
            {p.badges.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        {isTombstone && p.reason && (
          <p className="ihl-cite-mini__reason">理由: {p.reason}</p>
        )}
      </blockquote>
      <figcaption className="ihl-cite-mini__foot">
        <button type="button" className="ihl-cite-mini__link" onClick={openPermalink}>
          › {p.permalink}
        </button>
        <button type="button" className="ihl-cite-mini__copy" onClick={() => void handleCopy()}>
          {copied ? "コピー済" : "コピー"}
        </button>
      </figcaption>
    </figure>
  );
}
