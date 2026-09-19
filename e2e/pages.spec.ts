import { test, expect } from "@playwright/test";

test("l'accueil répond 200 et porte le nom en h1", async ({ page }) => {
  const r = await page.goto("/");
  expect(r?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Jonathan Dubois");
});

test("404 personnalisée", async ({ page }) => {
  const r = await page.goto("/nimporte-quoi/");
  expect(r?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Cette page n'existe pas");
});

test("zéro erreur console sur l'accueil", async ({ page }) => {
  const erreurs: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(erreurs).toEqual([]);
});
