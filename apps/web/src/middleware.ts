import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-session";

/**
 * 認証境界（正本: docs/planning/claude-plans/AUTH-ROUTE-MATRIX-v1.md）
 * 方針: デフォルトデナイ。明示的に公開したルートのみ未ログイン通過、他は全て /login へ。
 * - PUBLIC: 認証入口（/login /register）・規約（/terms）・言語（/language）
 * - 観測 READ（Scope A）: isObservationPublicRead で判定（WRITE と /fork は保護）
 * - 知の広場（/board）・個体・QR・マーケット・設定・admin 等は全て保護（PROVISIONAL / 個人スコープ）
 * 新規ルートは列挙しない限り保護側に落ちる。観測配下に新 WRITE を足す時のみ
 * OBSERVATION_WRITE_PREFIXES への追記が必要（観測配下は READ 既定のため）。
 */
const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/terms", "/language"];
const BYPASS_PATH_PREFIXES = ["/_next", "/favicon", "/api", "/health"];

/** Scope A: catalog search/detail/templates are readable without login; write flows stay protected. */
const OBSERVATION_WRITE_PREFIXES = [
  "/observation/input",
  "/observation/context",
  "/observation/solid",
  "/observation/done",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isObservationPublicRead(pathname: string): boolean {
  if (!pathname.startsWith("/observation")) {
    return false;
  }
  if (pathname === "/observation") {
    return true;
  }
  if (matchesPrefix(pathname, OBSERVATION_WRITE_PREFIXES)) {
    return false;
  }
  if (pathname.includes("/fork")) {
    return false;
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (process.env.IHL_WEB_AUTH_BYPASS === "1") {
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, BYPASS_PATH_PREFIXES)) {
    return NextResponse.next();
  }

  const isPublic =
    matchesPrefix(pathname, PUBLIC_PATH_PREFIXES) || isObservationPublicRead(pathname);
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const isAuthed = Boolean(sessionToken);

  if (!isAuthed && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && pathname === "/login") {
    const rawNext = request.nextUrl.searchParams.get("next");
    // open-redirect ガード: 解決後の origin が同一のときのみ内部遷移を許可。
    // 文字列判定だと URL 正規化（\ → /、TAB/LF/CR 除去）で外部ホストに化けるため parse してから比較する。
    let candidate: URL | null = null;
    if (rawNext) {
      try {
        candidate = new URL(rawNext, request.url);
      } catch {
        candidate = null;
      }
    }
    const dest =
      candidate && candidate.origin === request.nextUrl.origin
        ? new URL(candidate.pathname + candidate.search, request.url)
        : new URL("/", request.url);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
