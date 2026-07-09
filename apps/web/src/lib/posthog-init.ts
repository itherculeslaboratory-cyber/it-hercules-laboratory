import posthog from "posthog-js";

const DEFAULT_HOST = "https://us.i.posthog.com";

/**
 * PostHog dev instrumentation trial.
 *
 * ponytail: no-op unless NEXT_PUBLIC_POSTHOG_KEY is set — forks and
 * key-less environments never make an external request. Guards also skip
 * init under Playwright (navigator.webdriver) so e2e runs stay clean.
 */
export function initPostHog(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    return;
  }
  if (typeof navigator !== "undefined" && navigator.webdriver) {
    return;
  }

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST,
    person_profiles: "identified_only",
    respect_dnt: true,
  });
}
