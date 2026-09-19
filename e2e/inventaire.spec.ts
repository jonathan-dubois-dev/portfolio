import { test, expect } from "@playwright/test";

test("/automatisations/ : six métiers, cent lignes, un badge par bloc", async ({ page }) => {
  const r = await page.goto("/automatisations/");
  expect(r?.status()).toBe(200);
  await expect(page.locator("main h2")).toHaveCount(6);
  await expect(page.locator("[data-ligne]")).toHaveCount(100);
  await expect(page.locator("main [data-badge]")).toHaveCount(6);
  await expect(page.locator("#btp [data-ligne]")).toHaveCount(29);
});

test("téléphone : l'inventaire ne défile pas horizontalement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/automatisations/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
