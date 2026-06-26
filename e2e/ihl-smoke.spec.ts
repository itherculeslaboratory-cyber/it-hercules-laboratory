import { test, expect } from "@playwright/test";

/**
 * POST-B8-04 — minimal critical journey: login → observation → env shelf.
 * Secrets are not logged; dev magic-link uses IHL_DEV_EXPOSE_MAGIC_TOKEN server-side only.
 */
test.describe("IHL smoke", () => {
  test("login → observation → env shelf", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();

    await page.getByTestId("auth-email-input").fill("smoke@ihl.local");
    await page.getByTestId("auth-terms-check").check();
    await page.getByTestId("auth-login-btn").click();
    await expect(page.getByTestId("auth-dev-token-btn")).toBeVisible();
    await page.getByTestId("auth-dev-token-btn").click();
    await page.waitForURL("**/");

    await page.goto("/observation");
    await expect(page.getByRole("heading", { name: "観測 検索" })).toBeVisible();
    await expect(page.getByText("色補正なし")).toBeVisible();

    await page.goto("/env/shelf");
    await expect(page.getByRole("heading", { name: "データ取得元（機器）" })).toBeVisible();
  });
});
