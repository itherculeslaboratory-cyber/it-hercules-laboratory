import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-session";

const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/terms", "/language"];
const BYPASS_PATH_PREFIXES = ["/_next", "/favicon", "/api"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (process.env.IHL_WEB_AUTH_BYPASS === "1") {
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, BYPASS_PATH_PREFIXES)) {
    return NextResponse.next();
  }

  const isPublic = matchesPrefix(pathname, PUBLIC_PATH_PREFIXES);
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const isAuthed = Boolean(sessionToken);

  if (!isAuthed && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && pathname === "/login") {
    const nextPath = request.nextUrl.searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
