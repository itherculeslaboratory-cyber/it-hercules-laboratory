import { describe, expect, it } from "vitest";
import { detectLocale, t } from "./i18n";

describe("i18n", () => {
  it("returns ja strings by default", () => {
    expect(t("ja", "nav.home")).toBe("ホーム");
  });

  it("returns en strings", () => {
    expect(t("en", "nav.market")).toBe("Market");
  });

  it("detects locale from header", () => {
    expect(detectLocale("en-US")).toBe("en");
    expect(detectLocale("ja-JP")).toBe("ja");
  });
});
