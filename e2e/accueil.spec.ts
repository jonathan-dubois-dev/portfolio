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

test("méthode en quatre lignes, stack, contact avec mailto et disponibilité", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#methode li")).toHaveCount(4);
  await expect(page.locator("#stack li")).toHaveCount(10);
  const contact = page.locator("#contact");
  await expect(contact.locator('a[href^="mailto:"]')).toHaveAttribute("href", "mailto:duboisjonathan@orange.fr");
  await expect(contact).toContainText("Toulouse");
  await expect(contact).toContainText("Disponible en mission ou en poste");
  // Les liens LinkedIn/GitHub n'apparaissent que s'ils sont renseignés.
  await expect(contact.locator('a[href=""]')).toHaveCount(0);
});
