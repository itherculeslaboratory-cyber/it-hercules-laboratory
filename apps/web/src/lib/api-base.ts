/** Shared API origin resolution for server rewrites and browser fetch. */

/** Production host → API origin when CF Pages build omits env vars. */
const PRODUCTION_HOST_API_MAP: Record<string, string> = {
  "it-hercules.uk": "https://api.it-hercules.uk",
  "www.it-hercules.uk": "https://api.it-hercules.uk",
};

export const normalizeApiBase = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }
  return trimmed;
};

/** Browser-visible API origin (empty = same-origin /api via Next rewrites). */
export const resolvePublicApiBase = (): string => {
  const explicit = process.env.NEXT_PUBLIC_IHL_API_URL?.trim();
  if (explicit) {
    return normalizeApiBase(explicit);
  }
  const server = process.env.IHL_API_URL?.trim();
  if (server?.startsWith("https://")) {
    return normalizeApiBase(server);
  }
  if (typeof window !== "undefined") {
    const mapped = PRODUCTION_HOST_API_MAP[window.location.hostname];
    if (mapped) {
      return mapped;
    }
  }
  return "";
};

/** Server-side API origin (SSR / route handlers). */
export const resolveServerApiBase = (): string =>
  normalizeApiBase(process.env.IHL_API_URL ?? "http://localhost:8000");

export const resolveApiBase = (): string =>
  typeof window === "undefined" ? resolveServerApiBase() : resolvePublicApiBase();

/** Prefix relative /api paths with the resolved API origin (production cross-origin). */
export const resolveApiPath = (path: string): string => {
  if (!path) {
    return path;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    const base = resolveApiBase();
    if (base) {
      return `${base}${path}`;
    }
  }
  return path;
};
