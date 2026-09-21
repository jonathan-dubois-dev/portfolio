import { test, expect } from "@playwright/test";

test("trois chiffres, chacun avec sa valeur et son libellé", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#chiffres [data-chiffre]")).toHaveCount(3);
  await expect(page.locator("#chiffres [data-chiffre] strong").first()).not.toBeEmpty();
});

test("cinq cartes de réalisation, dans l'ordre, qui mènent aux pages", async ({ page }) => {
  await page.goto("/");
  const cartes = page.locator("#realisations article[data-carte]");
  await expect(cartes).toHaveCount(5);
  await expect(cartes.nth(0).locator("h3")).toContainText("Le pack BTP");
  await expect(cartes.nth(0).locator("[data-badge]")).toHaveText("Pack de démonstration, en service");
  await expect(cartes.nth(1).locator("h3")).toContainText("Le pack thérapeutes");
  await expect(cartes.nth(1).locator("[data-badge]")).toHaveText("Pack de démonstration, en service");
  await expect(cartes.nth(2).locator("h3")).toContainText("plateforme");
  await expect(cartes.nth(2).locator("[data-badge]")).toHaveText("En usage quotidien");
  await expect(cartes.nth(3).locator("[data-badge]")).toHaveText("Démonstrateur, en construction");
  await expect(cartes.nth(4).locator("h3")).toContainText("Station audio");
  await cartes.nth(0).locator("a").first().click();
  await expect(page).toHaveURL(/\/realisations\/pack-btp\/$/);
});

test("sept cartes « Aussi construit », illustrées, deux arrêtées, trois liens externes", async ({ page }) => {
  await page.goto("/");
  const cartes = page.locator("#aussi article[data-aussi]");
  await expect(cartes).toHaveCount(7);
  await expect(page.locator("#aussi h2")).toHaveText("Aussi construit");
  await expect(page.locator("#aussi [data-vignette]")).toHaveCount(0);
  await expect(page.locator("#aussi [data-badge][data-statut='arrete']")).toHaveCount(2);
  await expect(page.locator("#aussi a[href^='http'][target='_blank'][rel='noopener']")).toHaveCount(3);
  await expect(cartes.nth(0).locator("a[href='/automatisations/#immo']")).toHaveCount(1);
  const img = cartes.nth(0).locator("img");
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(img).toHaveAttribute("alt", "");
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("méthode en quatre lignes, stack, contact avec mailto et disponibilité", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#methode li")).toHaveCount(4);
  await expect(page.locator("#stack li")).toHaveCount(10);
  const contact = page.locator("#contact");
  await expect(contact.locator('a[href^="mailto:"]')).toHaveAttribute("href", "mailto:contact@jonathan-dubois.dev");
  await expect(contact).toContainText("Toulouse");
  await expect(contact).toContainText("Disponible en mission ou en poste");
  // Les liens LinkedIn/GitHub n'apparaissent que s'ils sont renseignés.
  await expect(contact.locator('a[href=""]')).toHaveCount(0);
  const portrait = contact.locator('img[alt="Jonathan Dubois"]');
  await expect(portrait).toHaveCount(1);
  await expect(portrait).toHaveAttribute("loading", "lazy");
  expect(await portrait.getAttribute("src")).toMatch(/\.webp/);
  // Image lazy : hors viewport au chargement, le navigateur ne la charge qu'une fois approchée ;
  // le chargement est asynchrone après le scroll, d'où le poll plutôt qu'une lecture immédiate.
  await portrait.scrollIntoViewIfNeeded();
  await expect
    .poll(() => portrait.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const linkedin = contact.locator('a[href*="linkedin.com/in/jonathan-dubois-dev"]');
  await expect(linkedin).toHaveCount(1);
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener");
});

test("six tuiles par métier avec leurs comptes, et le lien vers l'inventaire", async ({ page }) => {
  await page.goto("/");
  const tuiles = page.locator("#tourne [data-tuile]");
  await expect(tuiles).toHaveCount(6);
  await expect(tuiles.nth(0)).toContainText("29");
  await expect(tuiles.nth(0).locator("a")).toHaveAttribute("href", "/automatisations/#btp");
  await expect(page.locator("#tourne a[href='/automatisations/']")).toHaveText(/Voir les 100/);
});
