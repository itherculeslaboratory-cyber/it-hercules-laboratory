import { describe, expect, it } from "vitest";

/** Keyboard checklist routes — must stay in sync with 00-打鍵チェックリスト-v1.md */
export const IHL_ROUTES = [
  "/",
  "/home",
  "/login",
  "/register",
  "/terms",
  "/language",
  "/observation",
  "/observation/context",
  "/observation/input",
  "/observation/input/confirm",
  "/observation/done",
  "/observation/solid",
  "/observation/templates",
  "/scan",
  "/individuals/ind_demo_001",
  "/individuals/ind_demo_001/qr",
  "/market",
  "/board",
  "/board/general",
  "/board/paper",
  "/board/paper/template",
  "/board/component",
  "/match",
  "/me/profile",
  "/cross/cross_01",
  "/cross/cross_01/mortality",
  "/contribution",
  "/vote",
  "/economy/shop",
  "/settings",
  "/settings/ui-template",
  "/builder",
  "/component/photo-analysis",
  "/env/shelf",
  "/admin/karma",
] as const;

describe("IHL route inventory", () => {
  it("covers primary user paths", () => {
    expect(IHL_ROUTES.length).toBeGreaterThanOrEqual(20);
    expect(IHL_ROUTES).toContain("/observation");
    expect(IHL_ROUTES).toContain("/terms");
  });
});
