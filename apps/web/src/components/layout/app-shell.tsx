"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { EconIcon } from "@/components/brand/econ-icon";
import { cn } from "@/lib/cn";

const PRIMARY_NAV = [
  { href: "/", label: "ホーム" },
  { href: "/observation", label: "観測" },
  { href: "/settings", label: "設定" },
];

const AUTH_LITE_PREFIXES = ["/login", "/register", "/terms", "/language"];
const OBSERVATION_PREFIXES = ["/observation"];
const THEME_STORAGE_KEY = "ihl_theme_pack_override";

type ShellVariant = "default" | "auth-lite" | "observation-focus";
type ThemePack = "light" | "dark";
type ThemeSelection = ThemePack | "route-default";

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function resolveShellVariant(pathname: string): ShellVariant {
  if (startsWithAny(pathname, AUTH_LITE_PREFIXES)) {
    return "auth-lite";
  }
  if (startsWithAny(pathname, OBSERVATION_PREFIXES)) {
    return "observation-focus";
  }
  return "default";
}

function resolveRouteDefaultTheme(pathname: string): ThemePack {
  return startsWithAny(pathname, OBSERVATION_PREFIXES) ? "dark" : "light";
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shellVariant = resolveShellVariant(pathname);
  const isAuthLite = shellVariant === "auth-lite";
  const isObservationFocus = shellVariant === "observation-focus";
  const [themeSelection, setThemeSelection] = useState<ThemeSelection>("route-default");

  const routeDefaultTheme = resolveRouteDefaultTheme(pathname);
  const effectiveTheme = themeSelection === "route-default" ? routeDefaultTheme : themeSelection;

  const navItems = useMemo(
    () => (isAuthLite ? [{ href: "/", label: "ホーム" }] : PRIMARY_NAV),
    [isAuthLite],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      setThemeSelection(saved);
      return;
    }
    setThemeSelection("route-default");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  const selectTheme = (next: ThemeSelection) => {
    setThemeSelection(next);
    if (next === "route-default") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <div className="flex min-h-screen flex-col bg-civ-deep text-civ-fg" data-testid="shell-root">
      <header className="border-b border-civ-border bg-civ-section" data-testid="shell-header">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <BrandLogo variant="responsive" />
            <p className="mt-1 text-xs text-civ-muted" data-testid="shell-current-path">
              現在地: {pathname}
            </p>
          </div>
          <details className="relative">
            <summary
              className="cursor-pointer list-none rounded-button border border-civ-border px-3 py-2 text-xs text-civ-muted"
              data-testid="shell-theme-menu"
            >
              アカウント / 表示
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-card border border-civ-border bg-civ-card p-2 shadow-sm">
              <p className="px-2 pb-2 text-xs text-civ-muted">ThemePack</p>
              <button
                type="button"
                onClick={() => selectTheme("route-default")}
                className={cn(
                  "mb-1 w-full rounded-button px-2 py-2 text-left text-sm",
                  themeSelection === "route-default" ? "bg-civ-section text-civ-fg" : "text-civ-muted",
                )}
                data-testid="theme-pack-route-default"
              >
                ルート既定（現在: {routeDefaultTheme}）
              </button>
              <button
                type="button"
                onClick={() => selectTheme("light")}
                className={cn(
                  "mb-1 w-full rounded-button px-2 py-2 text-left text-sm",
                  themeSelection === "light" ? "bg-civ-section text-civ-fg" : "text-civ-muted",
                )}
                data-testid="theme-pack-light"
              >
                ThemePack-light
              </button>
              <button
                type="button"
                onClick={() => selectTheme("dark")}
                className={cn(
                  "w-full rounded-button px-2 py-2 text-left text-sm",
                  themeSelection === "dark" ? "bg-civ-section text-civ-fg" : "text-civ-muted",
                )}
                data-testid="theme-pack-dark"
              >
                ThemePack-dark
              </button>
            </div>
          </details>
        </div>
      </header>

      {!isAuthLite ? (
        <section
          className={cn(
            "border-b border-civ-border-subtle bg-civ-section",
            isObservationFocus && "bg-civ-card",
          )}
          data-testid="shell-contextbar"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2 text-xs">
            <span className="text-civ-muted">Context</span>
            {isObservationFocus ? (
              <>
                <span className="rounded-full border border-civ-border px-2 py-1" data-testid="obs-ctx-chip">
                  species: 未選択
                </span>
                <span className="rounded-full border border-civ-border px-2 py-1">stage: 未選択</span>
                <span className="rounded-full border border-civ-border px-2 py-1">status: ready</span>
              </>
            ) : (
              <span className="rounded-full border border-civ-border px-2 py-1 text-civ-muted">
                route: {shellVariant}
              </span>
            )}
          </div>
        </section>
      ) : null}

      <nav
        aria-label="メイン"
        className="border-b border-civ-border bg-civ-section"
        data-testid="shell-primary-nav"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-button px-2 py-1 no-underline hover:no-underline",
                isActive(pathname, item.href) ? "bg-civ-card text-civ-info" : "text-civ-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1" data-testid="shell-main">
        {children}
      </main>

      <footer
        className="border-t border-civ-border bg-civ-section py-3 text-center text-xs text-civ-muted"
        data-testid="shell-footer"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4">
          <Link href="/economy/shop" className="inline-flex items-center gap-1.5 no-underline hover:no-underline">
            <EconIcon kind="pt-coin" size="sm" />
            <span>PT ショップ</span>
          </Link>
          <span aria-hidden>·</span>
          <Link href="/settings">設定</Link>
          <span aria-hidden>·</span>
          <span>Build: {process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}</span>
        </div>
      </footer>
    </div>
  );
}
