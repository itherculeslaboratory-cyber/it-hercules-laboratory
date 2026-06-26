import { expect, test, type Page } from "@playwright/test";

async function loginWithDevToken(basePage: Page) {
  await basePage.goto("/login");
  await basePage.getByTestId("auth-email-input").fill("auth-home@ihl.local");
  await basePage.getByTestId("auth-terms-check").check();
  await basePage.getByTestId("auth-login-btn").click();
  await expect(basePage.getByTestId("auth-dev-token-btn")).toBeVisible();
  await basePage.getByTestId("auth-dev-token-btn").click();
  await basePage.waitForURL("**/");
}

test.describe("W1/W2 auth-home", () => {
  test("未認証で /home を開くと /login へリダイレクト", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("auth-login-btn")).toBeVisible();
  });

  test("ログイン後にホーム CTA とナビが表示される", async ({ page }) => {
    await loginWithDevToken(page);
    await expect(page.getByTestId("home-welcome-msg")).toBeVisible();
    await expect(page.getByTestId("home-obs-cta")).toBeVisible();
    await expect(page.getByTestId("home-bbs-cta")).toBeVisible();
    await expect(page.getByTestId("home-market-cta")).toBeVisible();
    await expect(page.getByTestId("home-action-cards")).toBeVisible();
    await expect(page.getByTestId("shell-primary-nav")).toBeVisible();
  });
});
