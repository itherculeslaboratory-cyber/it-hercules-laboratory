import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initMock = vi.fn();
vi.mock("posthog-js", () => ({
  default: { init: initMock },
}));

describe("initPostHog", () => {
  const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const originalWebdriver = (globalThis as { navigator?: { webdriver?: boolean } }).navigator;

  beforeEach(() => {
    initMock.mockClear();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
    (globalThis as { navigator?: unknown }).navigator = originalWebdriver;
  });

  it("does not init when NEXT_PUBLIC_POSTHOG_KEY is unset", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const { initPostHog } = await import("./posthog-init");
    initPostHog();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("does not init when navigator.webdriver is true", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
    (globalThis as { navigator?: unknown }).navigator = { webdriver: true };
    const { initPostHog } = await import("./posthog-init");
    initPostHog();
    expect(initMock).not.toHaveBeenCalled();
  });
});
