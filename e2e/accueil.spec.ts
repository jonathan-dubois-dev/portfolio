import { test, expect } from "@playwright/test";

test("trois chiffres, chacun avec sa valeur et son libellé", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#chiffres [data-chiffre]")).toHaveCount(3);
  await expect(page.locator("#chiffres [data-chiffre] strong").first()).not.toBeEmpty();
});

test("trois cartes de réalisation, dans l'ordre, qui mènent aux pages", async ({ page }) => {
  await page.goto("/");
  const cartes = page.locator("#realisations article[data-carte]");
  await expect(cartes).toHaveCount(3);
  await expect(cartes.nth(0).locator("h3")).toContainText("Agent d'estimation");
  await expect(cartes.nth(1).locator("[data-badge]")).toHaveText("Démonstrateur, en construction");
  await expect(cartes.nth(2).locator("h3")).toContainText("Station audio");
  await cartes.nth(0).locator("a").first().click();
  await expect(page).toHaveURL(/\/realisations\/pack-btp\/$/);
});

test("deux vignettes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#aussi [data-vignette]")).toHaveCount(2);
});
