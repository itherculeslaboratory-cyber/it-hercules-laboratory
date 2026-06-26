import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const apiPort = Number(process.env.IHL_API_PORT ?? 8000);
const apiBase = `http://127.0.0.1:${apiPort}`;

async function loginWithDevToken(page: Page) {
  await page.goto("/login");
  await page.getByTestId("auth-email-input").fill("obs-ver2@ihl.local");
  await page.getByTestId("auth-terms-check").check();
  await page.getByTestId("auth-login-btn").click();
  await expect(page.getByTestId("auth-dev-token-btn")).toBeVisible();
  await page.getByTestId("auth-dev-token-btn").click();
  await page.waitForURL("**/");
}

async function seedVer2Capture(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${apiBase}/api/solid-observation/commit`, {
    data: {
      species: "Dynastes hercules hercules",
      rows: [
        { item: "体長", value: "70", unit: "mm", method: "manual_entry" },
        { item: "体重", value: "16.02", unit: "g", method: "manual_entry" },
      ],
      photo_conditions: [{ item: "照明", value: "自然光", method: "manual_entry" }],
      devices: [{ device_id: "dev_e2e_ver2_01", role: "temp_humidity", source: "manual_entry" }],
      environment_snapshot: {
        temperature_c: "23.5",
        humidity_pct: "55",
        source: "manual_entry",
      },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.clientContentDigest).toBeTruthy();
  return body.captureId as string;
}

test.describe("W3 observation ver2 — search, detail, manifest", () => {
  test("search → detail sections → reanalysis-manifest 200", async ({ page, request }) => {
    const captureId = await seedVer2Capture(request);

    await loginWithDevToken(page);

    await page.goto("/observation");
    await expect(page.getByTestId("obs-grid-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "観測 検索" })).toBeVisible();

    await page.getByRole("textbox", { name: "種" }).fill("Dynastes hercules hercules");
    await page.getByRole("button", { name: "絞り込む" }).click();

    await expect(page.getByText(`capture: ${captureId}`)).toBeVisible({ timeout: 20_000 });
    const card = page.locator(".grid.gap-4 > div").filter({ hasText: captureId });
    await card.getByTestId("obs-open-detail").click();
    await expect(page).toHaveURL(`/observation/${captureId}`);

    await expect(page.getByTestId("obs-detail-page")).toBeVisible();
    await expect(page.getByTestId("obs-detail-measurements")).toBeVisible();
    await expect(page.getByTestId("obs-detail-photo-conditions")).toBeVisible();
    await expect(page.getByTestId("obs-detail-env-snapshot")).toBeVisible();
    await expect(page.getByTestId("obs-detail-devices")).toBeVisible();
    await expect(page.getByTestId("obs-detail-similar")).toContainText("類似する個体がまだありません");
    await expect(page.getByTestId("obs-detail-cite-btn")).toBeVisible();
    await expect(page.getByTestId("obs-detail-no-photo")).toContainText("写真なし");

    const manifestRes = await request.get(`${apiBase}/api/v1/observation/${captureId}/reanalysis-manifest`);
    expect(manifestRes.status()).toBe(200);
    const manifestBody = await manifestRes.json();
    expect(manifestBody.manifest.capture_id).toBe(captureId);
    expect(manifestBody.manifest.clientContentDigest).toBeTruthy();

    const viaWeb = await page.request.get(`/api/v1/observation/${captureId}/reanalysis-manifest`);
    expect(viaWeb.status()).toBe(200);
  });
});
