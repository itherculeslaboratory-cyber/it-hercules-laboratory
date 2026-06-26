export const AUTH_SESSION_COOKIE = "ihl_session_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const encoded = `${encodeURIComponent(name)}=`;
  const target = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(encoded));
  if (!target) {
    return null;
  }
  return decodeURIComponent(target.slice(encoded.length));
}

export function setAuthSessionCookie(sessionToken: string) {
  if (typeof document === "undefined") {
    return;
  }
  const maxAge = 60 * 60 * 24 * 14;
  document.cookie = `${AUTH_SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function clearAuthSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
