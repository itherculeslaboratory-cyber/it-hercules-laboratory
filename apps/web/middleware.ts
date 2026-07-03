import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-session";

const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/terms", "/language"];
const BYPASS_PATH_PREFIXES = ["/_next", "/favicon", "/api"];

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
    const nextPath = request.nextUrl.searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
