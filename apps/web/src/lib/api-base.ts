/** Shared API origin resolution for server rewrites and browser fetch. */

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
  return "";
};

/** Server-side API origin (SSR / route handlers). */
export const resolveServerApiBase = (): string =>
  normalizeApiBase(process.env.IHL_API_URL ?? "http://localhost:8000");
