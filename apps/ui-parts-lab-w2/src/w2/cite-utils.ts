/** 汎用引用 — W2 lab · ADR-H-09/10 cite token 契約（mock preview） */

export const IHL_CITE_TOKEN_RE = /\[ihl:cite\s+([^\]]+)\]/g;

const CITE_TYPES = new Set([
  "observation",
  "individual",
  "cross",
  "content",
  "post",
  "thread",
  "user",
  "tag",
  "template",
  "market_listing",
  "tombstone",
]);

export type CiteRefParsed = {
  type: string;
  id: string;
  extras: Record<string, string>;
};

export type CitePreview = {
  type: string;
  title: string;
  subtitle?: string;
  permalink: string;
  badges?: string[];
  status?: "ok" | "hidden" | "tombstone";
  reason?: string;
};

/** `[ihl:cite observation=cap-abc]` · post は thread 必須 */
export function formatIhlCiteToken(
  type: string,
  id: string,
  extras?: Record<string, string>,
): string {
  const pairs = [`${type}=${id}`];
  if (extras) {
    for (const [k, v] of Object.entries(extras)) {
      if (k !== type && k !== "id") pairs.push(`${k}=${v}`);
    }
  }
  return `[ihl:cite ${pairs.join(" ")}]`;
}

export function parseIhlCiteToken(token: string): CiteRefParsed | null {
  const match = /\[ihl:cite\s+([^\]]+)\]/.exec(token);
  if (!match) return null;

  const map: Record<string, string> = {};
  for (const part of match[1]!.trim().split(/\s+/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    map[part.slice(0, eq)] = part.slice(eq + 1);
  }

  if (map.type && map.id) {
    const { type, id, ...rest } = map;
    return { type, id, extras: rest };
  }

  for (const [k, v] of Object.entries(map)) {
    if (CITE_TYPES.has(k)) {
      const extras = { ...map };
      delete extras[k];
      return { type: k, id: v, extras };
    }
  }

  return null;
}

export function citePermalink(ref: CiteRefParsed): string {
  switch (ref.type) {
    case "observation":
      return `/observation/${ref.id}`;
    case "individual":
      return `/individuals/${ref.id}`;
    case "cross":
      return `/lineage/cross/${ref.id}`;
    case "content": {
      const ct = ref.extras.content_type ?? "article";
      if (ct === "paper") return `/research/paper-match/${ref.id}`;
      if (ct === "blog") return `/knowledge/blog/${ref.id}`;
      return `/knowledge/articles/${ref.id}`;
    }
    case "post": {
      const kind = ref.extras.board_kind ?? "complaint";
      const thread = ref.extras.thread ?? "thr";
      return `/board/${kind}/${thread}#post-${ref.id}`;
    }
    case "thread":
      return `/board/${ref.extras.board_kind ?? "general"}/${ref.id}`;
    case "user":
      return `/profile/${ref.id}`;
    case "tag":
      return `/knowledge?tag=${encodeURIComponent(ref.id)}`;
    case "template":
      return `/observation/templates/${ref.id}`;
    case "market_listing":
      return `/market/listings/${ref.id}`;
    default:
      return `/knowledge`;
  }
}

const MOCK_PREVIEWS: Record<string, CitePreview> = {
  "observation:cap_20260705-001": {
    type: "observation",
    title: "ヘラクレスオオカブト ♂ L3",
    subtitle: "78.2mm · 2026-07-05",
    permalink: "/observation/cap_20260705-001",
    badges: ["Scope A", "色補正なし"],
    status: "ok",
  },
  "post:pst_1": {
    type: "post",
    title: "幼虫の脱皮タイミングが読めなくて…",
    subtitle: "匿名 · 2026/07/05",
    permalink: "/board/complaint/thr_g1#post-pst_1",
    status: "ok",
  },
};

export function getMockCitePreview(ref: CiteRefParsed): CitePreview {
  const key = `${ref.type}:${ref.id}`;
  const cached = MOCK_PREVIEWS[key];
  if (cached) return cached;

  if (ref.type === "tombstone") {
    return {
      type: "tombstone",
      title: "この引用先は非公開です",
      subtitle: ref.extras.reason ?? ref.id,
      permalink: citePermalink(ref),
      status: "tombstone",
      reason: ref.extras.reason,
    };
  }

  return {
    type: ref.type,
    title: ref.extras.label_hint ?? ref.id,
    subtitle: ref.type,
    permalink: citePermalink(ref),
    status: "ok",
  };
}

export function formatCiteMarkdown(ref: CiteRefParsed, preview: CitePreview): string {
  const lines = [`> **${preview.title}**`];
  if (preview.subtitle) lines.push(`> ${preview.subtitle}`);
  lines.push(">", `> ${preview.permalink}`);
  lines.push("", formatIhlCiteToken(ref.type, ref.id, ref.extras));
  return lines.join("\n");
}

export async function copyCiteMarkdown(ref: CiteRefParsed, preview: CitePreview): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatCiteMarkdown(ref, preview));
    return true;
  } catch {
    return false;
  }
}

/** 本文から cite token を抽出 */
export function extractCiteTokens(body: string): string[] {
  const tokens: string[] = [];
  for (const match of body.matchAll(IHL_CITE_TOKEN_RE)) {
    tokens.push(match[0]!);
  }
  return tokens;
}
