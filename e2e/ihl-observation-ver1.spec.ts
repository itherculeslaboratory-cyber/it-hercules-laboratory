import { expect, test, type Page } from "@playwright/test";

async function loginWithDevToken(page: Page) {
  await page.goto("/login");
  await page.getByTestId("auth-email-input").fill("obs-flow@ihl.local");
  await page.getByTestId("auth-terms-check").check();
  await page.getByTestId("auth-login-btn").click();
  await expect(page.getByTestId("auth-dev-token-btn")).toBeVisible();
  await page.getByTestId("auth-dev-token-btn").click();
  await page.waitForURL("**/");
}

test.describe("W3 observation ver1 flow", () => {
  test("context -> input -> confirm -> done", async ({ page }) => {
    await loginWithDevToken(page);

    await page.goto("/observation/context");
    await page.getByTestId("obs-tgt-domain-biological").click();
    await page.getByTestId("obs-tgt-search-input").fill("hercules");
    await page.getByTestId("obs-tgt-tree-node").first().click();
    await page.getByTestId("obs-ctx-confirm").click();
    await expect(page).toHaveURL(/\/observation\/input/);

    await page.getByTestId("obs-bulk-fetch").click();
    await expect(page.getByTestId("obs-status-strip")).toContainText("フェッチ");
    await page.getByTestId("obs-confirm-next").click();
    await expect(page).toHaveURL("/observation/input/confirm");
    await expect(page.getByTestId("obs-chunk-photo")).toBeVisible();
    await expect(page.getByTestId("obs-chunk-individual-data")).toBeVisible();
    await expect(page.getByTestId("obs-chunk-periodic")).toBeVisible();
    await page.getByTestId("obs-register-submit").click();
    await expect(page).toHaveURL("/observation/done");
    await expect(page.getByTestId("obs-success-msg")).toBeVisible();
  });
});
