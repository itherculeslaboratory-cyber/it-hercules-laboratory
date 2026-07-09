import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-session";

function request(path: string, opts: { authed?: boolean } = {}): NextRequest {
  const req = new NextRequest(new URL(`http://localhost${path}`));
  if (opts.authed) {
    req.cookies.set(AUTH_SESSION_COOKIE, "tok");
  }
  return req;
}

/** NextResponse.next() has no location; a redirect carries a Location header. */
function locationOf(res: ReturnType<typeof middleware>): string | null {
  return res.headers.get("location");
}

describe("auth middleware boundary", () => {
  it("passes public routes without a session", () => {
    for (const path of ["/login", "/register", "/terms", "/language"]) {
      expect(locationOf(middleware(request(path))), path).toBeNull();
    }
  });

  it("passes observation READ (Scope A) without a session", () => {
    for (const path of ["/observation", "/observation/templates", "/observation/sess_1"]) {
      expect(locationOf(middleware(request(path))), path).toBeNull();
    }
  });

  it("redirects protected routes to /login with a next param when unauthenticated", () => {
    for (const path of ["/", "/home", "/board", "/individuals/i1/qr", "/settings", "/admin/karma"]) {
      const loc = locationOf(middleware(request(path)));
      expect(loc, path).toContain("/login");
      expect(loc, path).toContain(`next=${encodeURIComponent(path)}`);
    }
  });

  it("redirects observation WRITE flows when unauthenticated", () => {
    for (const path of ["/observation/input", "/observation/solid", "/observation/templates/t1/fork"]) {
      expect(locationOf(middleware(request(path))), path).toContain("/login");
    }
  });

  it("bypasses /health and framework paths", () => {
    for (const path of ["/health", "/_next/static/x.js", "/api/v1/ping"]) {
      expect(locationOf(middleware(request(path))), path).toBeNull();
    }
  });

  it("lets an authenticated user through protected routes", () => {
    expect(locationOf(middleware(request("/board", { authed: true })))).toBeNull();
  });

  it("redirects an authenticated user off /login to the next path", () => {
    const res = middleware(request("/login?next=/board", { authed: true }));
    expect(locationOf(res)).toBe("http://localhost/board");
  });

  it("refuses an external next target (open-redirect guard)", () => {
    const evils = [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "/\\/evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
      "/\r/evil.com",
    ];
    for (const evil of evils) {
      const res = middleware(request(`/login?next=${encodeURIComponent(evil)}`, { authed: true }));
      expect(locationOf(res), evil).toBe("http://localhost/");
    }
  });
});
