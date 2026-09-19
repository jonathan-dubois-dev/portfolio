import { test, expect } from "@playwright/test";

test("le hero porte le nom, les deux titres, la ligne, la ville et deux appels", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await expect(hero.locator("h1")).toHaveText("Jonathan Dubois");
  await expect(hero.locator("[data-titres]")).toContainText("Ingénieur automatisation IA");
  await expect(hero.locator("[data-titres]")).toContainText("Creative technologist");
  await expect(hero.locator("[data-meta]")).toContainText("Toulouse");
  await expect(hero.locator("a.bouton")).toHaveCount(2);
  await expect(hero.locator("a.bouton.plein")).toHaveAttribute("href", "#realisations");
  await expect(hero.locator("a.bouton.creux")).toHaveAttribute("href", "#contact");
});

test("sans JavaScript, le texte du hero est intact", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-hero] h1")).toBeVisible();
  await expect(page.locator("[data-hero] a.bouton")).toHaveCount(2);
  await ctx.close();
});
