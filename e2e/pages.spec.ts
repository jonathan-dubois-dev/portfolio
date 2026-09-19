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

for (const slug of ["pack-btp", "hub-sante", "studio-moonkura"]) {
  test(`/realisations/${slug}/ : titre, « ce que ça prouve », six sections, diagramme`, async ({ page }) => {
    const r = await page.goto(`/realisations/${slug}/`);
    expect(r?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-prouve]")).toBeVisible();
    await expect(page.locator("main h2")).toHaveText(["Contexte", "Ce que j'ai construit", "Preuves", "Un incident réel, et comment je l'ai réglé", "Stack"]);
    await expect(page.locator("figure.schema svg")).toHaveAttribute("role", "img");
  });
}

test("le hub porte son badge et sa ligne de statut ; le BTP n'en a pas", async ({ page }) => {
  await page.goto("/realisations/hub-sante/");
  await expect(page.locator("[data-badge]")).toHaveText("Démonstrateur, en construction");
  await expect(page.locator("[data-statut-ligne]")).toBeVisible();
  await page.goto("/realisations/pack-btp/");
  await expect(page.locator("[data-badge]")).toHaveCount(0);
});
