import { expect, test } from "@playwright/test";

/**
 * backlog 2026-06-27「明日やること1」の残タスク:
 * - 未ログインでシェル(観測=Scope A 公開ページ)から /login に到達できる
 * - login ⇄ register の往復導線
 * 未ログインコンテキスト(storageState なし)で実行する。
 */
test.describe("login flow (register/login 逆導線)", () => {
  test("シェル→/login→register→login の遷移", async ({ page }) => {
    // 未ログインでも閲覧できる観測ページ(Scope A)からシェル経由で /login へ
    await page.goto("/observation");
    await expect(page.getByTestId("shell-nav-login")).toBeVisible();
    await page.getByTestId("shell-nav-login").click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("auth-login-btn")).toBeVisible();

    // login → register
    await page.getByTestId("auth-login-register-link").click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByTestId("auth-register-submit")).toBeVisible();

    // register → login(逆導線)
    await page.getByTestId("auth-register-login-link").click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("auth-login-btn")).toBeVisible();
  });
});
